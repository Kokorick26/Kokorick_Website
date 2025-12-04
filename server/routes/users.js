import express from 'express';
import dynamoDB from '../db.js';
import auth from '../middleware/authEnhanced.js';
import { requireSuperAdmin } from '../middleware/permissions.js';
import { generateSecurePassword, hashPassword, validatePasswordStrength } from '../utils/password.js';
import {
  logUserCreated,
  logUserUpdated,
  logUserDeactivated,
  logUserDeleted,
  logPasswordReset,
  logPermissionsModified
} from '../utils/auditLog.js';

const router = express.Router();
const ADMIN_USERS_TABLE = 'AdminUsers';
const CUSTOM_ROLES_TABLE = 'CustomRoles';

// Helper to get client IP
function getClientIP(req) {
  return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate username format
function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * GET /api/users - List all users
 * Super Admin only
 */
router.get('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { search, role, status } = req.query;

    const result = await dynamoDB.scan({
      TableName: ADMIN_USERS_TABLE
    }).promise();

    let users = (result.Items || []).map(user => ({
      username: user.username,
      email: user.email,
      role: user.role || 'admin',
      permissions: user.permissions || [],
      isFirstLogin: user.isFirstLogin || false,
      isActive: user.isActive !== false,
      roleType: user.roleType || 'system',
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      phone: user.phone,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      createdBy: user.createdBy
    }));

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        u.username.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        (u.fullName && u.fullName.toLowerCase().includes(searchLower))
      );
    }

    if (role) {
      users = users.filter(u => u.role === role);
    }

    if (status) {
      const isActive = status === 'active';
      users = users.filter(u => u.isActive === isActive);
    }

    // Sort by createdAt descending
    users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Failed to list users:', error);
    res.status(500).json({ error: 'Failed to retrieve users', code: 'SERVER_ERROR' });
  }
});

/**
 * GET /api/users/:username - Get single user
 * Super Admin only
 */
router.get('/:username', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { username } = req.params;

    const result = await dynamoDB.get({
      TableName: ADMIN_USERS_TABLE,
      Key: { username }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    const user = result.Item;
    res.json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role || 'admin',
        permissions: user.permissions || [],
        isFirstLogin: user.isFirstLogin || false,
        isActive: user.isActive !== false,
        roleType: user.roleType || 'system',
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        phone: user.phone,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        createdBy: user.createdBy
      }
    });
  } catch (error) {
    console.error('Failed to get user:', error);
    res.status(500).json({ error: 'Failed to retrieve user', code: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/users - Create new user
 * Super Admin only
 */
router.post('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, role, permissions, fullName } = req.body;

    // Validate required fields
    if (!username || !email || !role) {
      return res.status(400).json({
        error: 'Username, email, and role are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate username format
    if (!isValidUsername(username)) {
      return res.status(400).json({
        error: 'Username must be 3-30 alphanumeric characters (underscores allowed)',
        code: 'INVALID_USERNAME'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address',
        code: 'INVALID_EMAIL'
      });
    }

    // Check if username already exists
    const existingUser = await dynamoDB.get({
      TableName: ADMIN_USERS_TABLE,
      Key: { username }
    }).promise();

    if (existingUser.Item) {
      return res.status(409).json({
        error: 'Username already exists',
        code: 'USERNAME_EXISTS'
      });
    }

    // Check if email already exists
    const emailScan = await dynamoDB.scan({
      TableName: ADMIN_USERS_TABLE,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    }).promise();

    if (emailScan.Items && emailScan.Items.length > 0) {
      return res.status(409).json({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Validate role exists
    let rolePermissions = permissions || [];
    let roleType = 'system';

    if (['super_admin', 'admin', 'content_writer'].includes(role)) {
      // System role - get default permissions if not provided
      if (!permissions || permissions.length === 0) {
        const roleResult = await dynamoDB.get({
          TableName: CUSTOM_ROLES_TABLE,
          Key: { roleId: role }
        }).promise();

        if (roleResult.Item) {
          rolePermissions = roleResult.Item.permissions;
        }
      }
    } else {
      // Custom role
      const customRoleResult = await dynamoDB.get({
        TableName: CUSTOM_ROLES_TABLE,
        Key: { roleId: role }
      }).promise();

      if (!customRoleResult.Item) {
        return res.status(400).json({
          error: 'Invalid role specified',
          code: 'INVALID_ROLE'
        });
      }

      roleType = 'custom';
      rolePermissions = permissions || customRoleResult.Item.permissions;
    }

    // Generate secure password
    const generatedPassword = generateSecurePassword();
    const hashedPassword = await hashPassword(generatedPassword);

    // Create user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role,
      permissions: rolePermissions,
      roleType,
      isFirstLogin: true,
      isActive: true,
      fullName: fullName || null,
      createdAt: new Date().toISOString(),
      createdBy: req.user.username
    };

    await dynamoDB.put({
      TableName: ADMIN_USERS_TABLE,
      Item: newUser
    }).promise();

    // Log the action
    await logUserCreated(req.user.username, username, role, getClientIP(req));

    // Return user (without password) and generated password
    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        roleType: newUser.roleType,
        isFirstLogin: newUser.isFirstLogin,
        isActive: newUser.isActive,
        fullName: newUser.fullName,
        createdAt: newUser.createdAt,
        createdBy: newUser.createdBy
      },
      generatedPassword,
      message: 'User created successfully. Please share the password securely with the user.'
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ error: 'Failed to create user', code: 'SERVER_ERROR' });
  }
});

/**
 * PATCH /api/users/:username - Update user
 * Super Admin only
 */
router.patch('/:username', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { username } = req.params;
    const { email, role, permissions, isActive, fullName, phone } = req.body;

    // Check if user exists
    const existingUser = await dynamoDB.get({
      TableName: ADMIN_USERS_TABLE,
      Key: { username }
    }).promise();

    if (!existingUser.Item) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    const user = existingUser.Item;
    const updates = {};
    const changes = {};

    // Validate and update email
    if (email !== undefined && email !== user.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: 'Please provide a valid email address',
          code: 'INVALID_EMAIL'
        });
      }

      // Check if email already exists
      const emailScan = await dynamoDB.scan({
        TableName: ADMIN_USERS_TABLE,
        FilterExpression: 'email = :email AND username <> :username',
        ExpressionAttributeValues: {
          ':email': email,
          ':username': username
        }
      }).promise();

      if (emailScan.Items && emailScan.Items.length > 0) {
        return res.status(409).json({
          error: 'Email already registered',
          code: 'EMAIL_EXISTS'
        });
      }

      updates.email = email;
      changes.email = { from: user.email, to: email };
    }

    // Update role
    if (role !== undefined && role !== user.role) {
      // Validate role exists
      if (!['super_admin', 'admin', 'content_writer'].includes(role)) {
        const customRoleResult = await dynamoDB.get({
          TableName: CUSTOM_ROLES_TABLE,
          Key: { roleId: role }
        }).promise();

        if (!customRoleResult.Item) {
          return res.status(400).json({
            error: 'Invalid role specified',
            code: 'INVALID_ROLE'
          });
        }

        updates.roleType = 'custom';
      } else {
        updates.roleType = 'system';
      }

      updates.role = role;
      changes.role = { from: user.role, to: role };
    }

    // Update permissions
    if (permissions !== undefined) {
      const oldPermissions = user.permissions || [];
      const newPermissions = permissions;

      // Log permission changes separately
      if (JSON.stringify(oldPermissions.sort()) !== JSON.stringify(newPermissions.sort())) {
        await logPermissionsModified(req.user.username, username, oldPermissions, newPermissions, getClientIP(req));
      }

      updates.permissions = newPermissions;
      changes.permissions = { from: oldPermissions, to: newPermissions };
    }

    // Update active status
    if (isActive !== undefined && isActive !== user.isActive) {
      updates.isActive = isActive;
      changes.isActive = { from: user.isActive, to: isActive };

      if (!isActive) {
        await logUserDeactivated(req.user.username, username, getClientIP(req));
      }
    }

    // Update profile fields
    if (fullName !== undefined) {
      updates.fullName = fullName;
      changes.fullName = { from: user.fullName, to: fullName };
    }

    if (phone !== undefined) {
      updates.phone = phone;
      changes.phone = { from: user.phone, to: phone };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No valid updates provided',
        code: 'NO_UPDATES'
      });
    }

    // Add updatedAt
    updates.updatedAt = new Date().toISOString();

    // Build update expression
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key, index) => {
      updateExpressions.push(`#field${index} = :value${index}`);
      expressionAttributeNames[`#field${index}`] = key;
      expressionAttributeValues[`:value${index}`] = updates[key];
    });

    await dynamoDB.update({
      TableName: ADMIN_USERS_TABLE,
      Key: { username },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }).promise();

    // Log the update
    await logUserUpdated(req.user.username, username, changes, getClientIP(req));

    // Get updated user
    const updatedResult = await dynamoDB.get({
      TableName: ADMIN_USERS_TABLE,
      Key: { username }
    }).promise();

    const updatedUser = updatedResult.Item;

    res.json({
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        permissions: updatedUser.permissions,
        roleType: updatedUser.roleType,
        isFirstLogin: updatedUser.isFirstLogin,
        isActive: updatedUser.isActive,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        profilePicture: updatedUser.profilePicture,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user', code: 'SERVER_ERROR' });
  }
});

/**
 * DELETE /api/users/:username - Delete user
 * Super Admin only
 */
router.delete('/:username', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { username } = req.params;

    // Prevent self-deletion
    if (username === req.user.username) {
      return res.status(400).json({
        error: 'You cannot delete your own account',
        code: 'CANNOT_DELETE_SELF'
      });
    }

    // Check if user exists
    const existingUser = await dynamoDB.get({
      TableName: ADMIN_USERS_TABLE,
      Key: { username }
    }).promise();

    if (!existingUser.Item) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    // Delete user
    await dynamoDB.delete({
      TableName: ADMIN_USERS_TABLE,
      Key: { username }
    }).promise();

    // Log the deletion
    await logUserDeleted(req.user.username, username, getClientIP(req));

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user', code: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/users/:username/reset-password - Reset user password
 * Super Admin only
 */
router.post('/:username/reset-password', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { username } = req.params;

    // Check if user exists
    const existingUser = await dynamoDB.get({
      TableName: ADMIN_USERS_TABLE,
      Key: { username }
    }).promise();

    if (!existingUser.Item) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    // Generate new secure password
    const generatedPassword = generateSecurePassword();
    const hashedPassword = await hashPassword(generatedPassword);

    // Update user password and set isFirstLogin to true
    await dynamoDB.update({
      TableName: ADMIN_USERS_TABLE,
      Key: { username },
      UpdateExpression: 'SET password = :password, isFirstLogin = :isFirstLogin, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':password': hashedPassword,
        ':isFirstLogin': true,
        ':updatedAt': new Date().toISOString()
      }
    }).promise();

    // Log the password reset
    await logPasswordReset(req.user.username, username, getClientIP(req));

    res.json({
      generatedPassword,
      message: 'Password reset successfully. The user will be required to change their password on next login.'
    });
  } catch (error) {
    console.error('Failed to reset password:', error);
    res.status(500).json({ error: 'Failed to reset password', code: 'SERVER_ERROR' });
  }
});

export default router;

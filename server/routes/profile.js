import express from 'express';
import dynamoDB from '../db.js';
import auth from '../middleware/authEnhanced.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password.js';
import { logPasswordChange } from '../utils/auditLog.js';

const router = express.Router();
const ADMIN_USERS_TABLE = 'AdminUsers';

// Helper to get client IP
function getClientIP(req) {
  return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * GET /api/profile - Get current user's profile
 */
router.get('/', auth, async (req, res) => {
  try {
    const result = await dynamoDB.get({
      TableName: ADMIN_USERS_TABLE,
      Key: { username: req.user.username }
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
        roleType: user.roleType || 'system',
        fullName: user.fullName,
        phone: user.phone,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Failed to get profile:', error);
    res.status(500).json({ error: 'Failed to retrieve profile', code: 'SERVER_ERROR' });
  }
});

/**
 * PATCH /api/profile - Update current user's profile
 */
router.patch('/', auth, async (req, res) => {
  try {
    const { fullName, email, phone, profilePicture } = req.body;
    const updates = {};

    // Validate and update email
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: 'Please provide a valid email address',
          code: 'INVALID_EMAIL'
        });
      }

      // Check if email already exists for another user
      const emailScan = await dynamoDB.scan({
        TableName: ADMIN_USERS_TABLE,
        FilterExpression: 'email = :email AND username <> :username',
        ExpressionAttributeValues: {
          ':email': email,
          ':username': req.user.username
        }
      }).promise();

      if (emailScan.Items && emailScan.Items.length > 0) {
        return res.status(409).json({
          error: 'Email already registered',
          code: 'EMAIL_EXISTS'
        });
      }

      updates.email = email;
    }

    // Update other profile fields
    if (fullName !== undefined) {
      updates.fullName = fullName || null;
    }

    if (phone !== undefined) {
      updates.phone = phone || null;
    }

    if (profilePicture !== undefined) {
      updates.profilePicture = profilePicture || null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No valid updates provided',
        code: 'NO_UPDATES'
      });
    }

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
      Key: { username: req.user.username },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }).promise();

    // Get updated user
    const updatedResult = await dynamoDB.get({
      TableName: ADMIN_USERS_TABLE,
      Key: { username: req.user.username }
    }).promise();

    const updatedUser = updatedResult.Item;

    res.json({
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        permissions: updatedUser.permissions,
        roleType: updatedUser.roleType,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile', code: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/profile/change-password - Change current user's password
 * Requires current password verification
 */
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Get current user with password
    const result = await dynamoDB.get({
      TableName: ADMIN_USERS_TABLE,
      Key: { username: req.user.username }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    const user = result.Item;

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Validate new password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.errors[0],
        code: 'WEAK_PASSWORD',
        details: validation.errors
      });
    }

    // Ensure new password is different from current
    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        error: 'New password must be different from current password',
        code: 'SAME_PASSWORD'
      });
    }

    // Hash and save new password
    const hashedPassword = await hashPassword(newPassword);

    await dynamoDB.update({
      TableName: ADMIN_USERS_TABLE,
      Key: { username: req.user.username },
      UpdateExpression: 'SET password = :password, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':password': hashedPassword,
        ':updatedAt': new Date().toISOString()
      }
    }).promise();

    // Log the password change
    await logPasswordChange(req.user.username, getClientIP(req));

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Failed to change password:', error);
    res.status(500).json({ error: 'Failed to change password', code: 'SERVER_ERROR' });
  }
});

export default router;

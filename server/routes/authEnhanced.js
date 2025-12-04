import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dynamoDB from '../db.js';
import auth from '../middleware/authEnhanced.js';
import { hashPassword, validatePasswordStrength } from '../utils/password.js';
import { logLoginSuccess, logLoginFailure, logPasswordChange } from '../utils/auditLog.js';

const router = express.Router();
const TABLE_NAME = 'AdminUsers';
const CUSTOM_ROLES_TABLE = 'CustomRoles';

// Helper to get client IP
function getClientIP(req) {
  return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// Login Admin
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const ipAddress = getClientIP(req);

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check for user
    const params = {
      TableName: TABLE_NAME,
      Key: { username },
    };

    const user = await dynamoDB.get(params).promise();
    if (!user.Item) {
      await logLoginFailure(username, ipAddress, 'User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.Item.isActive === false) {
      await logLoginFailure(username, ipAddress, 'Account deactivated');
      return res.status(403).json({ 
        message: 'Account has been deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.Item.password);
    if (!isMatch) {
      await logLoginFailure(username, ipAddress, 'Invalid password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update lastLogin
    await dynamoDB.update({
      TableName: TABLE_NAME,
      Key: { username },
      UpdateExpression: 'SET lastLogin = :lastLogin',
      ExpressionAttributeValues: { ':lastLogin': new Date().toISOString() }
    }).promise();

    // Log successful login
    await logLoginSuccess(username, ipAddress);

    // Get role details if custom role
    let permissions = user.Item.permissions || [];
    const role = user.Item.role || 'admin';
    const roleType = user.Item.roleType || 'system';

    // If it's a custom role, load permissions from role table
    if (roleType === 'custom') {
      const roleResult = await dynamoDB.get({
        TableName: CUSTOM_ROLES_TABLE,
        Key: { roleId: role }
      }).promise();

      if (roleResult.Item) {
        permissions = roleResult.Item.permissions;
      }
    }

    // Create token with extended payload
    const token = jwt.sign(
      { 
        id: user.Item.username,
        username: user.Item.username,
        role,
        permissions
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_this',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        username: user.Item.username,
        email: user.Item.email,
        role,
        roleType,
        permissions,
        isFirstLogin: user.Item.isFirstLogin || false,
        fullName: user.Item.fullName,
        profilePicture: user.Item.profilePicture
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password (first login or user-initiated)
router.post('/reset-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const ipAddress = getClientIP(req);

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  try {
    // Get current user
    const result = await dynamoDB.get({
      TableName: TABLE_NAME,
      Key: { username: req.user.username }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.Item;

    // If this is first login, currentPassword is not required
    // Otherwise, verify current password
    if (!user.isFirstLogin) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: 'Current password is required',
          code: 'CURRENT_PASSWORD_REQUIRED'
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }
    }

    // Validate new password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      return res.status(400).json({
        message: validation.errors[0],
        code: 'WEAK_PASSWORD',
        details: validation.errors
      });
    }

    // Ensure new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password must be different from current password',
        code: 'SAME_PASSWORD'
      });
    }

    // Hash and save new password
    const hashedPassword = await hashPassword(newPassword);

    await dynamoDB.update({
      TableName: TABLE_NAME,
      Key: { username: req.user.username },
      UpdateExpression: 'SET password = :password, isFirstLogin = :isFirstLogin, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':password': hashedPassword,
        ':isFirstLogin': false,
        ':updatedAt': new Date().toISOString()
      }
    }).promise();

    // Log the password change
    await logPasswordChange(req.user.username, ipAddress);

    res.json({ 
      message: 'Password updated successfully',
      requiresRelogin: user.isFirstLogin // Only need to re-login if was first login
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const result = await dynamoDB.get({
      TableName: TABLE_NAME,
      Key: { username: req.user.username }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.Item;
    res.json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role || 'admin',
        roleType: user.roleType || 'system',
        permissions: user.permissions || [],
        isFirstLogin: user.isFirstLogin || false,
        fullName: user.fullName,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token validity
router.get('/verify', auth, (req, res) => {
  res.json({ 
    valid: true,
    user: {
      username: req.user.username,
      role: req.user.role,
      permissions: req.user.permissions,
      isFirstLogin: req.user.isFirstLogin
    }
  });
});

export default router;

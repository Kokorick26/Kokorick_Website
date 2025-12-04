import jwt from 'jsonwebtoken';
import dynamoDB from '../db.js';

const ADMIN_USERS_TABLE = 'AdminUsers';

/**
 * Authentication middleware
 * Validates JWT token and loads full user object with role and permissions
 */
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_this');
    
    // Load full user from database
    const params = {
      TableName: ADMIN_USERS_TABLE,
      Key: { username: decoded.id || decoded.username }
    };

    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = result.Item;

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ 
        error: 'Account has been deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach full user object to request
    req.user = {
      username: user.username,
      email: user.email,
      role: user.role || 'admin', // Default for backward compatibility
      permissions: user.permissions || [],
      isFirstLogin: user.isFirstLogin || false,
      isActive: user.isActive !== false,
      roleType: user.roleType || 'system',
      fullName: user.fullName,
      profilePicture: user.profilePicture
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Session expired, please login again',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    console.error('Auth middleware error:', err);
    res.status(401).json({ 
      error: 'Token verification failed, authorization denied',
      code: 'AUTH_FAILED'
    });
  }
};

export default auth;

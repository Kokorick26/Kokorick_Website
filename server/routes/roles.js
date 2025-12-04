import express from 'express';
import dynamoDB from '../db.js';
import auth from '../middleware/authEnhanced.js';
import { requireSuperAdmin, ALL_PERMISSIONS } from '../middleware/permissions.js';
import { v4 as uuidv4 } from 'uuid';
import {
  logRoleCreated,
  logRoleUpdated,
  logRoleDeleted
} from '../utils/auditLog.js';

const router = express.Router();
const CUSTOM_ROLES_TABLE = 'CustomRoles';
const ADMIN_USERS_TABLE = 'AdminUsers';

// Helper to get client IP
function getClientIP(req) {
  return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

/**
 * GET /api/roles - List all roles
 * Super Admin only
 */
router.get('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const result = await dynamoDB.scan({
      TableName: CUSTOM_ROLES_TABLE
    }).promise();

    const roles = result.Items || [];

    // Get user counts for each role
    const userResult = await dynamoDB.scan({
      TableName: ADMIN_USERS_TABLE,
      ProjectionExpression: '#role',
      ExpressionAttributeNames: { '#role': 'role' }
    }).promise();

    const users = userResult.Items || [];
    const roleCounts = {};
    users.forEach(user => {
      const role = user.role || 'admin';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    // Add user count to each role
    const rolesWithCount = roles.map(role => ({
      ...role,
      userCount: roleCounts[role.roleId] || 0
    }));

    // Sort: system roles first, then custom roles by name
    rolesWithCount.sort((a, b) => {
      if (a.isSystemRole && !b.isSystemRole) return -1;
      if (!a.isSystemRole && b.isSystemRole) return 1;
      return (a.displayName || a.roleName).localeCompare(b.displayName || b.roleName);
    });

    res.json({ roles: rolesWithCount });
  } catch (error) {
    console.error('Failed to list roles:', error);
    res.status(500).json({ error: 'Failed to retrieve roles', code: 'SERVER_ERROR' });
  }
});

/**
 * GET /api/roles/:roleId - Get single role
 * Super Admin only
 */
router.get('/:roleId', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { roleId } = req.params;

    const result = await dynamoDB.get({
      TableName: CUSTOM_ROLES_TABLE,
      Key: { roleId }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ error: 'Role not found', code: 'ROLE_NOT_FOUND' });
    }

    // Get user count for this role
    const userResult = await dynamoDB.scan({
      TableName: ADMIN_USERS_TABLE,
      FilterExpression: '#role = :roleId',
      ExpressionAttributeNames: { '#role': 'role' },
      ExpressionAttributeValues: { ':roleId': roleId },
      Select: 'COUNT'
    }).promise();

    res.json({
      role: {
        ...result.Item,
        userCount: userResult.Count || 0
      }
    });
  } catch (error) {
    console.error('Failed to get role:', error);
    res.status(500).json({ error: 'Failed to retrieve role', code: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/roles - Create custom role
 * Super Admin only
 */
router.post('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { roleName, displayName, permissions } = req.body;

    // Validate required fields
    if (!roleName || !permissions || permissions.length === 0) {
      return res.status(400).json({
        error: 'Role name and at least one permission are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate roleName format (alphanumeric and underscore only)
    const roleNameRegex = /^[a-z0-9_]{3,30}$/;
    if (!roleNameRegex.test(roleName)) {
      return res.status(400).json({
        error: 'Role name must be 3-30 lowercase alphanumeric characters (underscores allowed)',
        code: 'INVALID_ROLE_NAME'
      });
    }

    // Check for reserved role names
    const reservedRoles = ['super_admin', 'admin', 'content_writer'];
    if (reservedRoles.includes(roleName)) {
      return res.status(400).json({
        error: 'Cannot use reserved role names',
        code: 'RESERVED_ROLE_NAME'
      });
    }

    // Check if role name already exists
    const existingRole = await dynamoDB.get({
      TableName: CUSTOM_ROLES_TABLE,
      Key: { roleId: roleName }
    }).promise();

    if (existingRole.Item) {
      return res.status(409).json({
        error: 'A role with this name already exists',
        code: 'ROLE_EXISTS'
      });
    }

    // Validate permissions
    const invalidPermissions = permissions.filter(p => !ALL_PERMISSIONS.includes(p));
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        error: `Invalid permissions: ${invalidPermissions.join(', ')}`,
        code: 'INVALID_PERMISSIONS'
      });
    }

    // Create role
    const newRole = {
      roleId: roleName,
      roleName: roleName,
      displayName: displayName || roleName,
      permissions,
      isSystemRole: false,
      createdAt: new Date().toISOString(),
      createdBy: req.user.username
    };

    await dynamoDB.put({
      TableName: CUSTOM_ROLES_TABLE,
      Item: newRole
    }).promise();

    // Log the action
    await logRoleCreated(req.user.username, roleName, permissions, getClientIP(req));

    res.status(201).json({
      role: { ...newRole, userCount: 0 },
      message: 'Role created successfully'
    });
  } catch (error) {
    console.error('Failed to create role:', error);
    res.status(500).json({ error: 'Failed to create role', code: 'SERVER_ERROR' });
  }
});

/**
 * PATCH /api/roles/:roleId - Update custom role
 * Super Admin only
 */
router.patch('/:roleId', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { roleId } = req.params;
    const { displayName, permissions } = req.body;

    // Check if role exists
    const existingRole = await dynamoDB.get({
      TableName: CUSTOM_ROLES_TABLE,
      Key: { roleId }
    }).promise();

    if (!existingRole.Item) {
      return res.status(404).json({ error: 'Role not found', code: 'ROLE_NOT_FOUND' });
    }

    // For super_admin role, ensure critical permissions are not removed
    if (existingRole.Item.roleId === 'super_admin' && permissions !== undefined) {
      const requiredPermissions = ['user_management', 'role_management', 'admin_panel_access'];
      const missingRequired = requiredPermissions.filter(p => !permissions.includes(p));
      if (missingRequired.length > 0) {
        return res.status(400).json({
          error: `Super Admin role must have: ${missingRequired.join(', ')}`,
          code: 'REQUIRED_PERMISSIONS_MISSING'
        });
      }
    }

    const updates = {};
    const oldPermissions = existingRole.Item.permissions;

    if (displayName !== undefined) {
      updates.displayName = displayName;
    }

    if (permissions !== undefined) {
      // Validate permissions
      const invalidPermissions = permissions.filter(p => !ALL_PERMISSIONS.includes(p));
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          error: `Invalid permissions: ${invalidPermissions.join(', ')}`,
          code: 'INVALID_PERMISSIONS'
        });
      }

      if (permissions.length === 0) {
        return res.status(400).json({
          error: 'Role must have at least one permission',
          code: 'NO_PERMISSIONS'
        });
      }

      updates.permissions = permissions;
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
      TableName: CUSTOM_ROLES_TABLE,
      Key: { roleId },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }).promise();

    // If permissions changed, update all users with this role
    if (updates.permissions) {
      const usersWithRole = await dynamoDB.scan({
        TableName: ADMIN_USERS_TABLE,
        FilterExpression: '#role = :roleId',
        ExpressionAttributeNames: { '#role': 'role' },
        ExpressionAttributeValues: { ':roleId': roleId }
      }).promise();

      for (const user of (usersWithRole.Items || [])) {
        await dynamoDB.update({
          TableName: ADMIN_USERS_TABLE,
          Key: { username: user.username },
          UpdateExpression: 'SET #permissions = :permissions, updatedAt = :updatedAt',
          ExpressionAttributeNames: {
            '#permissions': 'permissions'
          },
          ExpressionAttributeValues: {
            ':permissions': updates.permissions,
            ':updatedAt': new Date().toISOString()
          }
        }).promise();
      }

      // Log the permission update
      await logRoleUpdated(req.user.username, roleId, oldPermissions, updates.permissions, getClientIP(req));
    }

    // Get updated role
    const updatedResult = await dynamoDB.get({
      TableName: CUSTOM_ROLES_TABLE,
      Key: { roleId }
    }).promise();

    res.json({
      role: updatedResult.Item,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Failed to update role:', error);
    res.status(500).json({ error: 'Failed to update role', code: 'SERVER_ERROR' });
  }
});

/**
 * DELETE /api/roles/:roleId - Delete custom role
 * Super Admin only
 */
router.delete('/:roleId', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { roleId } = req.params;

    // Check if role exists
    const existingRole = await dynamoDB.get({
      TableName: CUSTOM_ROLES_TABLE,
      Key: { roleId }
    }).promise();

    if (!existingRole.Item) {
      return res.status(404).json({ error: 'Role not found', code: 'ROLE_NOT_FOUND' });
    }

    // Cannot delete system roles
    if (existingRole.Item.isSystemRole) {
      return res.status(400).json({
        error: 'Cannot delete system roles',
        code: 'SYSTEM_ROLE_PROTECTED'
      });
    }

    // Check if any users have this role
    const usersWithRole = await dynamoDB.scan({
      TableName: ADMIN_USERS_TABLE,
      FilterExpression: '#role = :roleId',
      ExpressionAttributeNames: { '#role': 'role' },
      ExpressionAttributeValues: { ':roleId': roleId },
      Select: 'COUNT'
    }).promise();

    if (usersWithRole.Count > 0) {
      return res.status(400).json({
        error: `Cannot delete role: ${usersWithRole.Count} user(s) are assigned this role`,
        code: 'ROLE_IN_USE'
      });
    }

    // Delete role
    await dynamoDB.delete({
      TableName: CUSTOM_ROLES_TABLE,
      Key: { roleId }
    }).promise();

    // Log the deletion
    await logRoleDeleted(req.user.username, roleId, getClientIP(req));

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Failed to delete role:', error);
    res.status(500).json({ error: 'Failed to delete role', code: 'SERVER_ERROR' });
  }
});

/**
 * GET /api/roles/:roleId/users - Get users with a specific role
 * Super Admin only
 */
router.get('/:roleId/users', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { roleId } = req.params;

    // Check if role exists
    const existingRole = await dynamoDB.get({
      TableName: CUSTOM_ROLES_TABLE,
      Key: { roleId }
    }).promise();

    if (!existingRole.Item) {
      return res.status(404).json({ error: 'Role not found', code: 'ROLE_NOT_FOUND' });
    }

    // Get users with this role
    const usersResult = await dynamoDB.scan({
      TableName: ADMIN_USERS_TABLE,
      FilterExpression: '#role = :roleId',
      ExpressionAttributeNames: { '#role': 'role' },
      ExpressionAttributeValues: { ':roleId': roleId }
    }).promise();

    const users = (usersResult.Items || []).map(user => ({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive !== false,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }));

    res.json({
      role: existingRole.Item,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Failed to get role users:', error);
    res.status(500).json({ error: 'Failed to retrieve role users', code: 'SERVER_ERROR' });
  }
});

/**
 * GET /api/roles/permissions/all - Get all available permissions
 */
router.get('/permissions/all', auth, requireSuperAdmin, async (req, res) => {
  try {
    const permissions = ALL_PERMISSIONS.map(p => ({
      id: p,
      name: p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: getPermissionDescription(p)
    }));

    res.json({ permissions });
  } catch (error) {
    console.error('Failed to get permissions:', error);
    res.status(500).json({ error: 'Failed to retrieve permissions', code: 'SERVER_ERROR' });
  }
});

function getPermissionDescription(permission) {
  const descriptions = {
    analytics: 'View and manage analytics dashboard',
    testimonials: 'Create, edit, and delete testimonials',
    projects: 'Create, edit, and delete projects',
    blogs: 'Create, edit, and delete blog posts',
    team: 'Manage team member profiles',
    whitepapers: 'Create, edit, and delete whitepapers',
    newsletter: 'Manage newsletter subscribers',
    requests: 'View and manage contact requests',
    user_management: 'Create, edit, and delete users',
    role_management: 'Create, edit, and delete roles',
    audit_logs: 'View audit logs',
    admin_panel_access: 'Access to the admin panel'
  };

  return descriptions[permission] || 'No description available';
}

export default router;

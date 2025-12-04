/**
 * Available permissions in the system
 */
export const Permissions = {
  ANALYTICS: 'analytics',
  TESTIMONIALS: 'testimonials',
  PROJECTS: 'projects',
  BLOGS: 'blogs',
  TEAM: 'team',
  WHITEPAPERS: 'whitepapers',
  NEWSLETTER: 'newsletter',
  REQUESTS: 'requests',
  USER_MANAGEMENT: 'user_management',
  ROLE_MANAGEMENT: 'role_management',
  AUDIT_LOGS: 'audit_logs',
  ADMIN_PANEL_ACCESS: 'admin_panel_access'
};

/**
 * All available permissions as an array
 */
export const ALL_PERMISSIONS = Object.values(Permissions);

/**
 * Default permissions by role
 */
export const DEFAULT_PERMISSIONS = {
  super_admin: ALL_PERMISSIONS,
  admin: [
    Permissions.ANALYTICS,
    Permissions.TESTIMONIALS,
    Permissions.PROJECTS,
    Permissions.BLOGS,
    Permissions.TEAM,
    Permissions.REQUESTS,
    Permissions.ADMIN_PANEL_ACCESS
  ],
  content_writer: [
    Permissions.BLOGS,
    Permissions.WHITEPAPERS,
    Permissions.ADMIN_PANEL_ACCESS
  ]
};

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with role and permissions
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.role === 'super_admin') return true;
  
  // Check user's permissions array
  return user.permissions && user.permissions.includes(permission);
}

/**
 * Check if user is a Super Admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isSuperAdmin(user) {
  return user && user.role === 'super_admin';
}

/**
 * Middleware to check if user has required permission
 * @param {...string} permissions - Required permissions (user needs at least one)
 */
export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Super admin has all permissions
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if user has at least one of the required permissions
    const hasRequiredPermission = permissions.some(
      permission => req.user.permissions && req.user.permissions.includes(permission)
    );

    if (!hasRequiredPermission) {
      return res.status(403).json({
        error: "You don't have permission to access this resource",
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permissions
      });
    }

    next();
  };
}

/**
 * Middleware to require all specified permissions
 * @param {...string} permissions - Required permissions (user needs all)
 */
export function requireAllPermissions(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Super admin has all permissions
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if user has all required permissions
    const hasAllPermissions = permissions.every(
      permission => req.user.permissions && req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        error: "You don't have permission to access this resource",
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permissions
      });
    }

    next();
  };
}

/**
 * Middleware to require Super Admin role
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      error: 'This action requires Super Admin privileges',
      code: 'SUPER_ADMIN_REQUIRED'
    });
  }

  next();
}

/**
 * Middleware to require admin panel access
 */
export function requireAdminPanelAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Super admin always has access
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check for admin panel access permission
  if (!req.user.permissions || !req.user.permissions.includes(Permissions.ADMIN_PANEL_ACCESS)) {
    return res.status(403).json({
      error: 'You do not have access to the admin panel',
      code: 'NO_ADMIN_PANEL_ACCESS'
    });
  }

  next();
}

/**
 * Get default permissions for a role
 * @param {string} role - Role name
 * @returns {string[]} Default permissions for the role
 */
export function getDefaultPermissions(role) {
  return DEFAULT_PERMISSIONS[role] || [];
}

import dynamoDB from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const AUDIT_LOGS_TABLE = 'AuditLogs';

/**
 * Audit event types
 */
export const AuditEventType = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_CHANGE: 'password_change',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DEACTIVATED: 'user_deactivated',
  USER_DELETED: 'user_deleted',
  PERMISSIONS_MODIFIED: 'permissions_modified',
  ROLE_CREATED: 'role_created',
  ROLE_UPDATED: 'role_updated',
  ROLE_DELETED: 'role_deleted'
};

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {string} params.eventType - Type of event
 * @param {string} params.performedBy - Username who performed the action
 * @param {string} [params.targetUser] - Target user (for user-related actions)
 * @param {string} [params.ipAddress] - IP address of the request
 * @param {Object} [params.details] - Additional event details
 * @param {boolean} [params.success] - Whether the action succeeded
 * @returns {Promise<Object>} Created audit log entry
 */
export async function createAuditLog({
  eventType,
  performedBy,
  targetUser = null,
  ipAddress = null,
  details = {},
  success = true
}) {
  const timestamp = new Date().toISOString();
  const id = uuidv4();

  const auditLog = {
    id,
    timestamp,
    eventType,
    performedBy,
    targetUser,
    ipAddress,
    details,
    success
  };

  try {
    await dynamoDB.put({
      TableName: AUDIT_LOGS_TABLE,
      Item: auditLog
    }).promise();

    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging failures shouldn't break the main operation
    return null;
  }
}

/**
 * Query audit logs with filters
 * @param {Object} filters - Query filters
 * @param {string} [filters.startDate] - Start date (ISO string)
 * @param {string} [filters.endDate] - End date (ISO string)
 * @param {string} [filters.eventType] - Filter by event type
 * @param {string} [filters.performedBy] - Filter by user who performed action
 * @param {string} [filters.targetUser] - Filter by target user
 * @param {number} [filters.limit] - Maximum number of results
 * @param {Object} [filters.lastKey] - Last evaluated key for pagination
 * @returns {Promise<{ logs: Array, lastKey: Object | null }>}
 */
export async function queryAuditLogs({
  startDate,
  endDate,
  eventType,
  performedBy,
  targetUser,
  limit = 50,
  lastKey = null
}) {
  try {
    // Use scan with filters (for small-medium datasets)
    // For production with large datasets, consider using GSIs
    const params = {
      TableName: AUDIT_LOGS_TABLE,
      Limit: limit
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    // Build filter expression
    const filterExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (startDate) {
      filterExpressions.push('#timestamp >= :startDate');
      expressionAttributeNames['#timestamp'] = 'timestamp';
      expressionAttributeValues[':startDate'] = startDate;
    }

    if (endDate) {
      filterExpressions.push('#timestamp <= :endDate');
      expressionAttributeNames['#timestamp'] = 'timestamp';
      expressionAttributeValues[':endDate'] = endDate;
    }

    if (eventType) {
      filterExpressions.push('eventType = :eventType');
      expressionAttributeValues[':eventType'] = eventType;
    }

    if (performedBy) {
      filterExpressions.push('performedBy = :performedBy');
      expressionAttributeValues[':performedBy'] = performedBy;
    }

    if (targetUser) {
      filterExpressions.push('targetUser = :targetUser');
      expressionAttributeValues[':targetUser'] = targetUser;
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      if (Object.keys(expressionAttributeNames).length > 0) {
        params.ExpressionAttributeNames = expressionAttributeNames;
      }
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const result = await dynamoDB.scan(params).promise();

    // Sort by timestamp descending
    const logs = (result.Items || []).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      logs,
      lastKey: result.LastEvaluatedKey || null,
      count: logs.length
    };
  } catch (error) {
    console.error('Failed to query audit logs:', error);
    throw error;
  }
}

/**
 * Log login success event
 */
export async function logLoginSuccess(username, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.LOGIN_SUCCESS,
    performedBy: username,
    targetUser: username,
    ipAddress,
    details: { action: 'User logged in successfully' },
    success: true
  });
}

/**
 * Log login failure event
 */
export async function logLoginFailure(username, ipAddress, reason) {
  return createAuditLog({
    eventType: AuditEventType.LOGIN_FAILURE,
    performedBy: username || 'unknown',
    targetUser: username || 'unknown',
    ipAddress,
    details: { reason },
    success: false
  });
}

/**
 * Log password reset event (by admin)
 */
export async function logPasswordReset(adminUsername, targetUsername, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.PASSWORD_RESET,
    performedBy: adminUsername,
    targetUser: targetUsername,
    ipAddress,
    details: { action: 'Password reset by administrator' },
    success: true
  });
}

/**
 * Log password change event (by user)
 */
export async function logPasswordChange(username, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.PASSWORD_CHANGE,
    performedBy: username,
    targetUser: username,
    ipAddress,
    details: { action: 'User changed their password' },
    success: true
  });
}

/**
 * Log user creation event
 */
export async function logUserCreated(adminUsername, newUsername, role, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.USER_CREATED,
    performedBy: adminUsername,
    targetUser: newUsername,
    ipAddress,
    details: { role, action: 'New user created' },
    success: true
  });
}

/**
 * Log user update event
 */
export async function logUserUpdated(adminUsername, targetUsername, changes, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.USER_UPDATED,
    performedBy: adminUsername,
    targetUser: targetUsername,
    ipAddress,
    details: { changes, action: 'User updated' },
    success: true
  });
}

/**
 * Log user deactivation event
 */
export async function logUserDeactivated(adminUsername, targetUsername, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.USER_DEACTIVATED,
    performedBy: adminUsername,
    targetUser: targetUsername,
    ipAddress,
    details: { action: 'User account deactivated' },
    success: true
  });
}

/**
 * Log user deletion event
 */
export async function logUserDeleted(adminUsername, targetUsername, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.USER_DELETED,
    performedBy: adminUsername,
    targetUser: targetUsername,
    ipAddress,
    details: { action: 'User account deleted' },
    success: true
  });
}

/**
 * Log permissions modification event
 */
export async function logPermissionsModified(adminUsername, targetUsername, oldPermissions, newPermissions, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.PERMISSIONS_MODIFIED,
    performedBy: adminUsername,
    targetUser: targetUsername,
    ipAddress,
    details: {
      oldPermissions,
      newPermissions,
      action: 'User permissions modified'
    },
    success: true
  });
}

/**
 * Log role creation event
 */
export async function logRoleCreated(adminUsername, roleName, permissions, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.ROLE_CREATED,
    performedBy: adminUsername,
    ipAddress,
    details: { roleName, permissions, action: 'Custom role created' },
    success: true
  });
}

/**
 * Log role update event
 */
export async function logRoleUpdated(adminUsername, roleName, oldPermissions, newPermissions, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.ROLE_UPDATED,
    performedBy: adminUsername,
    ipAddress,
    details: {
      roleName,
      oldPermissions,
      newPermissions,
      action: 'Custom role updated'
    },
    success: true
  });
}

/**
 * Log role deletion event
 */
export async function logRoleDeleted(adminUsername, roleName, ipAddress) {
  return createAuditLog({
    eventType: AuditEventType.ROLE_DELETED,
    performedBy: adminUsername,
    ipAddress,
    details: { roleName, action: 'Custom role deleted' },
    success: true
  });
}

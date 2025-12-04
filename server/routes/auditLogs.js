import express from 'express';
import auth from '../middleware/authEnhanced.js';
import { requireSuperAdmin } from '../middleware/permissions.js';
import { queryAuditLogs, AuditEventType } from '../utils/auditLog.js';

const router = express.Router();

/**
 * GET /api/audit-logs - Query audit logs
 * Super Admin only
 */
router.get('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      eventType,
      performedBy,
      targetUser,
      limit = 50,
      lastKey
    } = req.query;

    // Validate eventType if provided
    if (eventType && !Object.values(AuditEventType).includes(eventType)) {
      return res.status(400).json({
        error: 'Invalid event type',
        code: 'INVALID_EVENT_TYPE',
        validTypes: Object.values(AuditEventType)
      });
    }

    const result = await queryAuditLogs({
      startDate,
      endDate,
      eventType,
      performedBy,
      targetUser,
      limit: parseInt(limit, 10),
      lastKey: lastKey ? JSON.parse(lastKey) : null
    });

    res.json({
      logs: result.logs,
      count: result.count,
      lastKey: result.lastKey ? JSON.stringify(result.lastKey) : null
    });
  } catch (error) {
    console.error('Failed to query audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs', code: 'SERVER_ERROR' });
  }
});

/**
 * GET /api/audit-logs/event-types - Get all audit event types
 */
router.get('/event-types', auth, requireSuperAdmin, async (req, res) => {
  try {
    const eventTypes = Object.entries(AuditEventType).map(([key, value]) => ({
      id: value,
      name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      description: getEventTypeDescription(value)
    }));

    res.json({ eventTypes });
  } catch (error) {
    console.error('Failed to get event types:', error);
    res.status(500).json({ error: 'Failed to retrieve event types', code: 'SERVER_ERROR' });
  }
});

function getEventTypeDescription(eventType) {
  const descriptions = {
    [AuditEventType.LOGIN_SUCCESS]: 'User successfully logged in',
    [AuditEventType.LOGIN_FAILURE]: 'Failed login attempt',
    [AuditEventType.PASSWORD_RESET]: 'Password was reset by administrator',
    [AuditEventType.PASSWORD_CHANGE]: 'User changed their password',
    [AuditEventType.USER_CREATED]: 'New user account created',
    [AuditEventType.USER_UPDATED]: 'User account information updated',
    [AuditEventType.USER_DEACTIVATED]: 'User account deactivated',
    [AuditEventType.USER_DELETED]: 'User account deleted',
    [AuditEventType.PERMISSIONS_MODIFIED]: 'User permissions modified',
    [AuditEventType.ROLE_CREATED]: 'Custom role created',
    [AuditEventType.ROLE_UPDATED]: 'Custom role updated',
    [AuditEventType.ROLE_DELETED]: 'Custom role deleted'
  };

  return descriptions[eventType] || 'No description available';
}

export default router;

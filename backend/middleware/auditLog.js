// backend/middleware/auditLog.js
import { createAuditLog } from '../controllers/auditLogController.js';

// Intercept express controller responses to capture successful audit log actions
export const logAction = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    const triggerAudit = () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const user = req.user || {};
        const userId = user._id || user.id || req.userId || 'system';
        const resourceId = req.params.id || req.body.id || '';
        const resourceName = req.body.name || req.body.fullName || '';

        createAuditLog({
          userId,
          userRole: user.role || 'admin',
          userName: user.fullName || 'System',
          action: action,
          resource: resource,
          resourceId: resourceId,
          resourceName: resourceName,
          details: `${action} ${resource} operation performed`,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'] || '',
        });
      }
    };

    res.send = function (data) {
      triggerAudit();
      return originalSend.call(this, data);
    };

    res.json = function (data) {
      triggerAudit();
      return originalJson.call(this, data);
    };

    next();
  };
};

// Manually log specific user audit trail actions from within controller logic
export const logAudit = async (req, action, resource, resourceId = '', resourceName = '', details = '') => {
  const user = req.user || {};
  const userId = user._id || user.id || req.userId || 'system';

  return createAuditLog({
    userId,
    userRole: user.role || 'admin',
    userName: user.fullName || 'System',
    action: action,
    resource: resource,
    resourceId: resourceId,
    resourceName: resourceName,
    details: details || `${action} ${resource} operation performed`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'] || '',
  });
};
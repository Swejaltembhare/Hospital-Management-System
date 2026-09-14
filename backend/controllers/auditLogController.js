import AuditLog from '../models/AuditLog.js';

// Create and save new audit log entry
export const createAuditLog = async (data) => {
  try {
    const log = new AuditLog({
      userId: data.userId,
      userRole: data.userRole || 'admin',
      userName: data.userName || 'System',
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId || '',
      resourceName: data.resourceName || '',
      details: data.details || '',
      ipAddress: data.ipAddress || '',
      userAgent: data.userAgent || '',
      timestamp: new Date(),
    });

    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating audit log:', error);
    return null;
  }
};

// Retrieve paginated audit logs filtered by query options
export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      resource,
      userId,
      startDate,
      endDate,
      search,
    } = req.query;

    const query = {};

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        query.timestamp.$lte = adjustedEndDate;
      }
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { resourceName: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { resourceId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'fullName email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message,
    });
  }
};

// Fetch single audit log document by ID
export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await AuditLog.findById(id).populate('userId', 'fullName email role');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found',
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log',
      error: error.message,
    });
  }
};

// Aggregate statistical metrics for system audit logs
export const getAuditLogStats = async (req, res) => {
  try {
    const [totalLogs, actionStats, resourceStats, userStats] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AuditLog.aggregate([
        { $group: { _id: '$resource', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AuditLog.aggregate([
        { $group: { _id: '$userName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = await AuditLog.countDocuments({
      timestamp: { $gte: today },
    });

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        todayLogs,
        actionStats,
        resourceStats,
        userStats,
      },
    });
  } catch (error) {
    console.error('Get audit log stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log stats',
      error: error.message,
    });
  }
};

// Delete audit logs older than specified retention period
export const cleanupOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} logs older than ${days} days`,
      data: {
        deletedCount: result.deletedCount,
        days: parseInt(days),
      },
    });
  } catch (error) {
    console.error('Cleanup old logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old logs',
      error: error.message,
    });
  }
};
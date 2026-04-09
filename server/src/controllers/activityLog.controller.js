import activityLogService from '../services/activityLog.service.js';

class ActivityLogController {
  async getRecentActivities(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const activities = await activityLogService.getRecentActivities(limit);
      
      res.status(200).json({
        success: true,
        data: activities
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new ActivityLogController();

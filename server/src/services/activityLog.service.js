import ActivityLog from '../models/ActivityLog.model.js';
import User from '../models/User.model.js';

class ActivityLogService {
  async log({ userId, action, resource, resourceId, details = {}, req = null, status = 'SUCCESS' }) {
    try {
      const activity = await ActivityLog.create({
        user: userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
        userAgent: req?.headers?.['user-agent'] || 'unknown',
        status
      });
      
      return activity;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
  
  async getRecentActivities(limit = 20) {
    try {
      // IMPORTANT: Populate the user data
      const activities = await ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'profile.email profile.firstName profile.lastName profile.avatar role');
      
      // Format for frontend
      const formattedActivities = activities.map(activity => ({
        id: activity._id,
        type: this.mapActionToType(activity.action),
        action: activity.action,
        userName: activity.user?.profile 
          ? `${activity.user.profile.firstName} ${activity.user.profile.lastName}`
          : 'Unknown User',
        userId: activity.user?._id,
        userEmail: activity.user?.profile?.email,
        userAvatar: activity.user?.profile?.avatar,
        description: this.generateDescription(activity),
        targetName: activity.details?.targetName,
        targetId: activity.details?.targetId,
        timestamp: activity.createdAt,
        ipAddress: activity.ipAddress,
        status: activity.status,
        resource: activity.resource,
        resourceId: activity.resourceId,
        details: activity.details
      }));
      
      return formattedActivities;
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }
  
  mapActionToType(action) {
    const map = {
      'CREATE': 'create',
      'UPDATE': 'update',
      'DELETE': 'delete',
      'VIEW': 'view',
      'LOGIN': 'login',
      'LOGOUT': 'logout'
    };
    return map[action] || 'default';
  }
  
  generateDescription(activity) {
    const actor = activity.user?.profile 
      ? `${activity.user.profile.firstName} ${activity.user.profile.lastName}`
      : 'Someone';
    
    const target = activity.details?.targetName || activity.resourceId || activity.resource;
    
    switch (activity.action) {
      case 'CREATE':
        return `${actor} created a new ${activity.resource.toLowerCase()}`;
      case 'UPDATE':
        return `${actor} updated ${activity.resource.toLowerCase()}`;
      case 'DELETE':
        return `${actor} deleted ${activity.resource.toLowerCase()}`;
      case 'LOGIN':
        return `${actor} logged into the system`;
      case 'LOGOUT':
        return `${actor} logged out`;
      default:
        return `${actor} ${activity.action} ${target}`;
    }
  }
}

export default new ActivityLogService();

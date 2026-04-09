import Employee from '../models/Employee.model.js';
import ActivityLog from '../models/ActivityLog.model.js';
import User from '../models/User.model.js';
class DashboardService {
  async getStats() {
    const [
      totalEmployees,
      activeEmployees,
      departmentStats,
      recentHires,
      attendanceStats,
      payrollStats,
      ratingStats
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      this.getDepartmentDistribution(),
      this.getRecentHires(5),
      this.getAttendanceSummary(),
      Employee.aggregate([
        { $group: { _id: null, totalPayroll: { $sum: '$compensation.salary' } } }
      ]),
      Employee.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$performance.currentRating' } } }
      ])
    ]);

    const totalPayroll = payrollStats[0]?.totalPayroll || 0;
    const avgRating = ratingStats[0]?.avgRating || 0;
    const averagePerformance = avgRating ? Math.round((avgRating / 5) * 1000) / 10 : 0;

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      averagePerformance,
      totalPayroll,
      departmentCount: departmentStats.length,
      overview: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        departmentCount: departmentStats.length,
        averagePerformance,
        totalPayroll
      },
      departmentDistribution: departmentStats,
      recentHires,
      attendance: attendanceStats
    };
  }

  async getDepartmentDistribution() {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: '$employmentDetails.department',
          count: { $sum: 1 },
          avgSalary: { $avg: '$compensation.salary' }
        }
      },
      {
        $project: {
          department: '$_id',
          count: 1,
          avgSalary: { $round: ['$avgSalary', 2] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return stats;
  }

  async getRecentHires(limit = 5) {
    const hires = await Employee.find()
      .sort({ 'employmentDetails.hireDate': -1 })
      .limit(limit)
      .populate('user', 'profile email')
      .select('employmentDetails.hireDate employmentDetails.position')
      .lean();

    return hires.map(hire => ({
      id: hire._id,
      name: hire.user?.profile ? 
        `${hire.user.profile.firstName} ${hire.user.profile.lastName}` : 
        'Unknown',
      email: hire.user?.email,
      position: hire.employmentDetails.position,
      hireDate: hire.employmentDetails.hireDate,
      department: hire.employmentDetails.department
    }));
  }

  async getAttendanceSummary() {
    const summary = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalLeaves: { $sum: '$attendance.totalLeaves' },
          leavesTaken: { $sum: '$attendance.leavesTaken' },
          totalLateDays: { $sum: '$attendance.lateDays' },
          totalAbsentDays: { $sum: '$attendance.absentDays' }
        }
      },
      {
        $project: {
          _id: 0,
          totalLeaves: 1,
          leavesTaken: 1,
          leavesRemaining: { $subtract: ['$totalLeaves', '$leavesTaken'] },
          utilizationRate: {
            $round: [
              { $multiply: [{ $divide: ['$leavesTaken', '$totalLeaves'] }, 100] },
              1
            ]
          },
          lateDays: '$totalLateDays',
          absentDays: '$totalAbsentDays'
        }
      }
    ]);

    return summary[0] || {
      totalLeaves: 0,
      leavesTaken: 0,
      leavesRemaining: 0,
      utilizationRate: 0,
      lateDays: 0,
      absentDays: 0
    };
  }

  async getPerformanceMetrics() {
    const reviewMetrics = await Employee.aggregate([
      { $unwind: '$performance.reviews' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$performance.reviews.date' }
          },
          avgRating: { $avg: '$performance.reviews.rating' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const avgCurrentRatingAgg = await Employee.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$performance.currentRating' } } }
    ]);
    const avgCurrentRating = avgCurrentRatingAgg[0]?.avgRating || 0;
    const fallbackPerformance = avgCurrentRating ? Math.round((avgCurrentRating / 5) * 100) : 0;

    const lastMonths = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toISOString().slice(0, 7);
      const label = date.toLocaleString('en-US', { month: 'short' });
      lastMonths.push({ key, label });
    }

    const reviewMap = new Map(
      reviewMetrics.map(item => [item._id, item.avgRating])
    );

    return lastMonths.map(({ key, label }) => {
      const rating = reviewMap.get(key);
      const performance = rating
        ? Math.round((rating / 5) * 100)
        : fallbackPerformance;
      const target = Math.min(100, Math.max(80, performance + 5));
      return { month: label, performance, target };
    });
  }

  async getSalaryDistribution() {
    const ranges = [
      { min: 0, max: 30000, label: '0-30k' },
      { min: 30001, max: 50000, label: '30k-50k' },
      { min: 50001, max: 70000, label: '50k-70k' },
      { min: 70001, max: 90000, label: '70k-90k' },
      { min: 90001, max: 120000, label: '90k-120k' },
      { min: 120001, max: Infinity, label: '120k+' }
    ];

    const distribution = await Promise.all(
      ranges.map(async (range) => {
        const count = await Employee.countDocuments({
          'compensation.salary': { $gte: range.min, $lte: range.max }
        });
        return {
          range: range.label,
          count
        };
      })
    );

    const departments = await this.getDepartmentDistribution();
    const departmentPie = departments.map((dept) => ({
      name: dept.department || 'Unassigned',
      value: dept.count
    }));

    return {
      ranges: distribution,
      departments: departmentPie
    };
  }

  async getAttendanceStats() {
    return this.getAttendanceSummary();
  }

  async getDepartmentMetrics() {
    const metrics = await Employee.aggregate([
      {
        $group: {
          _id: '$employmentDetails.department',
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          avgSalary: { $avg: '$compensation.salary' },
          avgRating: { $avg: '$performance.currentRating' }
        }
      },
      {
        $project: {
          department: '$_id',
          totalEmployees: 1,
          activeEmployees: 1,
          avgSalary: { $round: ['$avgSalary', 2] },
          avgRating: { $round: ['$avgRating', 1] }
        }
      },
      { $sort: { totalEmployees: -1 } }
    ]);

    return metrics;
  }

   async getRecentActivity(limit = 20) {
    // First, get the activities
    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get all unique user IDs from activities
    const userIds = [...new Set(activities.map(a => a.user?.toString()).filter(Boolean))];
    
    // Manually fetch all users
    const users = await User.find({ _id: { $in: userIds } }).lean();
    
    // Create a map for quick user lookup
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), user);
    });

    const actionMap = {
      CREATE: 'create',
      UPDATE: 'update',
      DELETE: 'delete',
      LOGIN: 'login',
      LOGOUT: 'logout',
      VIEW: 'view'
    };

    // Format activities with user data
    const formattedActivities = [];
    
    for (const activity of activities) {
      const user = userMap.get(activity.user?.toString());
      
      // Extract user name
      let userName = 'System';
      let userInitials = 'SY';
      
      if (user) {
        if (user.profile?.firstName && user.profile?.lastName) {
          userName = `${user.profile.firstName} ${user.profile.lastName}`;
          userInitials = (user.profile.firstName[0] + user.profile.lastName[0]).toUpperCase();
        } else if (user.profile?.firstName) {
          userName = user.profile.firstName;
          userInitials = user.profile.firstName[0].toUpperCase();
        } else if (user.email) {
          userName = user.email.split('@')[0];
          userInitials = userName[0].toUpperCase();
        }
      } else if (activity.user) {
        // User ID exists but user not found in database
        userName = `User_${activity.user.toString().slice(-6)}`;
        userInitials = '??';
      }
      
      // Generate description
      let description = '';
      const resource = activity.resource?.toLowerCase() || 'item';
      
      switch (activity.action) {
        case 'CREATE':
          description = `${userName} created a ${resource}`;
          break;
        case 'UPDATE':
          description = `${userName} updated a ${resource}`;
          break;
        case 'DELETE':
          description = `${userName} deleted a ${resource}`;
          break;
        case 'LOGIN':
          description = `${userName} logged in`;
          break;
        case 'LOGOUT':
          description = `${userName} logged out`;
          break;
        case 'VIEW':
          description = `${userName} viewed ${resource}`;
          break;
        default:
          description = `${userName} performed ${activity.action}`;
      }
      
      // Use custom description if available
      if (activity.details?.description) {
        description = activity.details.description;
      }
      
      formattedActivities.push({
        id: activity._id,
        type: actionMap[activity.action] || 'default',
        action: activity.action,
        description: description,
        timestamp: activity.createdAt,
        user: userName,
        userInitials: userInitials,
        userId: activity.user,
        userEmail: user?.email,
        resource: activity.resource,
        resourceId: activity.resourceId,
        ipAddress: activity.ipAddress,
        status: activity.status,
        details: activity.details
      });
    }
    
    return formattedActivities;
  }
  }

export default new DashboardService();

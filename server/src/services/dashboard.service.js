import Employee from '../models/Employee.model.js';

class DashboardService {
  async getStats() {
    const [
      totalEmployees,
      activeEmployees,
      departmentStats,
      recentHires,
      attendanceStats
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      this.getDepartmentDistribution(),
      this.getRecentHires(5),
      this.getAttendanceSummary()
    ]);

    return {
      overview: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        departmentCount: departmentStats.length
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
    const metrics = await Employee.aggregate([
      {
        $group: {
          _id: '$employmentDetails.department',
          avgRating: { $avg: '$performance.currentRating' },
          employees: { $sum: 1 },
          topPerformers: {
            $sum: {
              $cond: [{ $gte: ['$performance.currentRating', 4.5] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          department: '$_id',
          avgRating: { $round: ['$avgRating', 1] },
          employees: 1,
          topPerformers: 1,
          performanceRate: {
            $round: [
              { $multiply: [{ $divide: ['$topPerformers', '$employees'] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { avgRating: -1 } }
    ]);

    return metrics;
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

    return distribution;
  }
}

export default new DashboardService();

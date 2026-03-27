import dashboardService from '../services/dashboard.service.js';
import catchAsync from '../utils/catchAsync.js';

class DashboardController {
  getStats = catchAsync(async (req, res) => {
    const stats = await dashboardService.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  });

  getPerformanceMetrics = catchAsync(async (req, res) => {
    const metrics = await dashboardService.getPerformanceMetrics();

    res.status(200).json({
      success: true,
      data: metrics
    });
  });

  getSalaryDistribution = catchAsync(async (req, res) => {
    const distribution = await dashboardService.getSalaryDistribution();

    res.status(200).json({
      success: true,
      data: distribution
    });
  });

  getRecentActivity = catchAsync(async (req, res) => {
    
    res.status(200).json({
      success: true,
      data: []
    });
  });
}

export default new DashboardController();

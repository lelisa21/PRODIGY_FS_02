import dashboardService from "../services/dashboard.service.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const sanitizeCsvValue = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value).replace(/"/g, '""');
  return /[",\n]/.test(str) ? `"${str}"` : str;
};

const toCsv = (rows) => {
  if (!rows || rows.length === 0) {
    return "No data\n";
  }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => sanitizeCsvValue(row[h])).join(",")),
  ];
  return lines.join("\n");
};

export const exportReport = catchAsync(async (req, res) => {
  const type = String(req.query.type || "performance").toLowerCase();
  const range = String(req.query.range || "month").toLowerCase();

  if (type === "salary" && req.user?.role !== "admin") {
    throw new AppError("Salary reports require admin role", 403);
  }

  let dataRows = [];
  let filename = `${type}_report_${range}`;

  switch (type) {
    case "performance": {
      const metrics = await dashboardService.getPerformanceMetrics();
      dataRows = metrics.map((item) => ({
        period: item.month,
        performance: item.performance,
        target: item.target,
      }));
      break;
    }
    case "attendance": {
      const stats = await dashboardService.getAttendanceStats();
      dataRows = [
        {
          totalLeaves: stats.totalLeaves,
          leavesTaken: stats.leavesTaken,
          leavesRemaining: stats.leavesRemaining,
          utilizationRate: stats.utilizationRate,
          lateDays: stats.lateDays,
          absentDays: stats.absentDays,
        },
      ];
      break;
    }
    case "salary": {
      const distribution = await dashboardService.getSalaryDistribution();
      dataRows = (distribution.ranges || []).map((item) => ({
        range: item.range,
        count: item.count,
      }));
      break;
    }
    case "department": {
      const metrics = await dashboardService.getDepartmentMetrics();
      dataRows = (metrics || []).map((item) => ({
        department: item.department,
        totalEmployees: item.totalEmployees,
        activeEmployees: item.activeEmployees,
        avgSalary: item.avgSalary,
        avgRating: item.avgRating,
      }));
      break;
    }
    default:
      throw new AppError("Unknown report type", 400);
  }

  const csv = toCsv(dataRows);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}.csv"`,
  );
  res.status(200).send(csv);
});

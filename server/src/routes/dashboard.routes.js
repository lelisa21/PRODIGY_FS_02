import express from "express";
import dashboardController from "../controllers/dashboard.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/stats", dashboardController.getStats);
router.get(
  "/performance",
  restrictTo("admin", "manager"),
  dashboardController.getPerformanceMetrics,
);
router.get(
  "/salary-distribution",
  restrictTo("admin"),
  dashboardController.getSalaryDistribution,
);
router.get("/recent-activity", dashboardController.getRecentActivity);
router.get("/attendance", dashboardController.getAttendanceStats);
router.get("/department-metrics", dashboardController.getDepartmentMetrics);

export default router;

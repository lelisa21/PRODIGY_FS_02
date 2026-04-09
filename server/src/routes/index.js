import express from 'express';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import messageRoutes from './message.routes.js';
import reportRoutes from './report.routes.js';
import { protect } from '../middlewares/auth.middleware.js';
import activityRoutes from "../routes/activityLog.routes.js"
import userRoutes from "../routes/user.routes.js"
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Public routes
router.use('/auth', authRoutes);
router.use("/users", userRoutes);

// Protected routes
router.use('/employees', protect, employeeRoutes);
router.use('/dashboard', protect, dashboardRoutes);
router.use('/messages', protect, messageRoutes);
router.use('/reports', protect, reportRoutes);
router.use("/activities" , protect , activityRoutes);

export default router;

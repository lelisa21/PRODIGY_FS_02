import express from 'express';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import { protect } from '../middlewares/auth.middleware.js';

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

// Protected routes
router.use('/employees', protect, employeeRoutes);
router.use('/dashboard', protect, dashboardRoutes);

export default router;

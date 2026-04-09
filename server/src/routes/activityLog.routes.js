import express from 'express';
import activityLogController from '../controllers/activityLog.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/recent', protect, activityLogController.getRecentActivities);

export default router;

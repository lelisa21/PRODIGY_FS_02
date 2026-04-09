import express from 'express';
import userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All user routes are protected
router.use(protect);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

export default router;

import express from 'express';
import messageController from '../controllers/message.controller.js';
import { restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', messageController.getMessages);
router.post('/', restrictTo('admin', 'manager'), messageController.createMessage);

export default router;

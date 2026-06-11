import express from 'express';
import {
  sendMessage,
  getChatHistory,
  getChatDetails,
  deleteChat,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/message', sendMessage);
router.get('/history', getChatHistory);

router
  .route('/history/:id')
  .get(getChatDetails)
  .delete(deleteChat);

export default router;

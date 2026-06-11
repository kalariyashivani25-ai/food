import express from 'express';
import { analyzeFoodImage } from '../controllers/analyzeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/food', protect, analyzeFoodImage);

export default router;

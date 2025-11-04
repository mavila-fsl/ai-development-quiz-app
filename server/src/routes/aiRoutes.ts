import { Router } from 'express';
import { body } from 'express-validator';
import { getRecommendation, enhanceExplanation } from '../controllers/aiController';
import { validate } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth';
import { requireAuthenticated } from '../middleware/authorization';

const router = Router();

// AI routes require authentication (available to all authenticated users)
router.post(
  '/recommendation',
  authMiddleware,
  requireAuthenticated,
  [body('userId').isUUID().withMessage('Invalid user ID')],
  validate,
  getRecommendation
);

router.post(
  '/enhance-explanation',
  authMiddleware,
  requireAuthenticated,
  [
    body('originalExplanation').notEmpty().withMessage('Original explanation is required'),
    body('userAnswer').notEmpty().withMessage('User answer is required'),
    body('correctAnswer').notEmpty().withMessage('Correct answer is required'),
    body('question').notEmpty().withMessage('Question is required'),
  ],
  validate,
  enhanceExplanation
);

export default router;

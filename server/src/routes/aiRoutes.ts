import { Router } from 'express';
import { body } from 'express-validator';
import { getRecommendation, enhanceExplanation } from '../controllers/aiController';
import { validate } from '../middleware/validator';

const router = Router();

router.post(
  '/recommendation',
  [body('userId').isUUID().withMessage('Invalid user ID')],
  validate,
  getRecommendation
);

router.post(
  '/enhance-explanation',
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

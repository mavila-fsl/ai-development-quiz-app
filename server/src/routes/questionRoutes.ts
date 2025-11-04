import { Router } from 'express';
import { param, body } from 'express-validator';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/questionController';
import { validate } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth';
import { requireQuizManager } from '../middleware/authorization';

const router = Router();

// All question routes require QUIZ_MANAGER role
// GET routes - accessible to Quiz Managers only (for management purposes)
router.get(
  '/',
  authMiddleware,
  requireQuizManager,
  getQuestions
);

router.get(
  '/:id',
  authMiddleware,
  requireQuizManager,
  [param('id').isUUID().withMessage('Invalid question ID')],
  validate,
  getQuestion
);

// POST/PUT/DELETE routes - require QUIZ_MANAGER role
router.post(
  '/',
  authMiddleware,
  requireQuizManager,
  [
    body('quizId').isUUID().withMessage('Invalid quiz ID'),
    body('question').trim().notEmpty().withMessage('Question text is required'),
    body('options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
    body('options.*.id').trim().notEmpty().withMessage('Option ID is required'),
    body('options.*.text').trim().notEmpty().withMessage('Option text is required'),
    body('correctAnswer').trim().notEmpty().withMessage('Correct answer is required'),
    body('explanation').trim().notEmpty().withMessage('Explanation is required'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  ],
  validate,
  createQuestion
);

router.put(
  '/:id',
  authMiddleware,
  requireQuizManager,
  [
    param('id').isUUID().withMessage('Invalid question ID'),
    body('quizId').optional().isUUID().withMessage('Invalid quiz ID'),
    body('question').optional().trim().notEmpty().withMessage('Question text cannot be empty'),
    body('options').optional().isArray({ min: 2 }).withMessage('At least 2 options are required'),
    body('options.*.id').optional().trim().notEmpty().withMessage('Option ID cannot be empty'),
    body('options.*.text').optional().trim().notEmpty().withMessage('Option text cannot be empty'),
    body('correctAnswer').optional().trim().notEmpty().withMessage('Correct answer cannot be empty'),
    body('explanation').optional().trim(),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  ],
  validate,
  updateQuestion
);

router.delete(
  '/:id',
  authMiddleware,
  requireQuizManager,
  [param('id').isUUID().withMessage('Invalid question ID')],
  validate,
  deleteQuestion
);

export default router;

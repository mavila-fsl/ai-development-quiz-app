import { Router } from 'express';
import { param, body } from 'express-validator';
import {
  getQuizzes,
  getQuiz,
  getQuizQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz
} from '../controllers/quizController';
import { validate } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth';
import { requireQuizManager } from '../middleware/authorization';

const router = Router();

// GET routes - accessible to all authenticated users
router.get('/', authMiddleware, getQuizzes);

router.get(
  '/:id',
  authMiddleware,
  [param('id').isUUID().withMessage('Invalid quiz ID')],
  validate,
  getQuiz
);

router.get(
  '/:id/questions',
  authMiddleware,
  [param('id').isUUID().withMessage('Invalid quiz ID')],
  validate,
  getQuizQuestions
);

// POST/PUT/DELETE routes - require QUIZ_MANAGER role
router.post(
  '/',
  authMiddleware,
  requireQuizManager,
  [
    body('categoryId').isUUID().withMessage('Invalid category ID'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level'),
  ],
  validate,
  createQuiz
);

router.put(
  '/:id',
  authMiddleware,
  requireQuizManager,
  [
    param('id').isUUID().withMessage('Invalid quiz ID'),
    body('categoryId').optional().isUUID().withMessage('Invalid category ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level'),
  ],
  validate,
  updateQuiz
);

router.delete(
  '/:id',
  authMiddleware,
  requireQuizManager,
  [param('id').isUUID().withMessage('Invalid quiz ID')],
  validate,
  deleteQuiz
);

export default router;

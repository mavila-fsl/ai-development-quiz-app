import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  startAttempt,
  completeAttempt,
  getAttempt,
  getUserAttempts,
} from '../controllers/attemptController';
import { validate } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth';
import { requireAuthenticated } from '../middleware/authorization';

const router = Router();

// All attempt routes require authentication (both QUIZ_TAKER and QUIZ_MANAGER can take quizzes)
router.post(
  '/start',
  authMiddleware,
  requireAuthenticated,
  [
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('quizId').isUUID().withMessage('Invalid quiz ID'),
  ],
  validate,
  startAttempt
);

router.post(
  '/complete',
  authMiddleware,
  requireAuthenticated,
  [
    body('attemptId').isUUID().withMessage('Invalid attempt ID'),
    body('answers').isArray().withMessage('Answers must be an array'),
  ],
  validate,
  completeAttempt
);

router.get(
  '/:id',
  authMiddleware,
  requireAuthenticated,
  [param('id').isUUID().withMessage('Invalid attempt ID')],
  validate,
  getAttempt
);

router.get(
  '/user/:userId',
  authMiddleware,
  requireAuthenticated,
  [param('userId').isUUID().withMessage('Invalid user ID')],
  validate,
  getUserAttempts
);

export default router;

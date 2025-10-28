import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  startAttempt,
  completeAttempt,
  getAttempt,
  getUserAttempts,
} from '../controllers/attemptController';
import { validate } from '../middleware/validator';

const router = Router();

router.post(
  '/start',
  [
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('quizId').isUUID().withMessage('Invalid quiz ID'),
  ],
  validate,
  startAttempt
);

router.post(
  '/complete',
  [
    body('attemptId').isUUID().withMessage('Invalid attempt ID'),
    body('answers').isArray().withMessage('Answers must be an array'),
  ],
  validate,
  completeAttempt
);

router.get('/:id', [param('id').isUUID().withMessage('Invalid attempt ID')], validate, getAttempt);

router.get(
  '/user/:userId',
  [param('userId').isUUID().withMessage('Invalid user ID')],
  validate,
  getUserAttempts
);

export default router;

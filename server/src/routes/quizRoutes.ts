import { Router } from 'express';
import { param } from 'express-validator';
import { getQuizzes, getQuiz, getQuizQuestions } from '../controllers/quizController';
import { validate } from '../middleware/validator';

const router = Router();

router.get('/', getQuizzes);

router.get('/:id', [param('id').isUUID().withMessage('Invalid quiz ID')], validate, getQuiz);

router.get(
  '/:id/questions',
  [param('id').isUUID().withMessage('Invalid quiz ID')],
  validate,
  getQuizQuestions
);

export default router;

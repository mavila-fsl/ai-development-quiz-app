import { Router } from 'express';
import { body, param } from 'express-validator';
import { createUser, getUser, getUserStats, loginUser } from '../controllers/userController';
import { validate } from '../middleware/validator';
import { USERNAME_VALIDATION, ERROR_MESSAGES } from '@ai-quiz-app/shared';

const router = Router();

// Username validation rules
const usernameValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({
      min: USERNAME_VALIDATION.MIN_LENGTH,
      max: USERNAME_VALIDATION.MAX_LENGTH
    })
    .withMessage(
      `Username must be between ${USERNAME_VALIDATION.MIN_LENGTH} and ${USERNAME_VALIDATION.MAX_LENGTH} characters long`
    )
    .matches(USERNAME_VALIDATION.PATTERN)
    .withMessage(ERROR_MESSAGES.USERNAME_INVALID_FORMAT),
];

router.post(
  '/',
  usernameValidation,
  validate,
  createUser
);

router.post(
  '/login',
  usernameValidation,
  validate,
  loginUser
);

router.get('/:id', [param('id').isUUID().withMessage('Invalid user ID')], validate, getUser);

router.get(
  '/:id/stats',
  [param('id').isUUID().withMessage('Invalid user ID')],
  validate,
  getUserStats
);

export default router;

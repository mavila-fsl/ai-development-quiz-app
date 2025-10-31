import { Router } from 'express';
import { body, param } from 'express-validator';
import { createUser, getUser, getUserStats, loginUser, logoutUser, invalidateAllSessions } from '../controllers/userController';
import { validate } from '../middleware/validator';
import { USERNAME_VALIDATION, PASSWORD_VALIDATION, ERROR_MESSAGES } from '@ai-quiz-app/shared';
import { ipLoginRateLimiter, usernameLoginRateLimiter } from '../middleware/rateLimiter';
import { authMiddleware } from '../middleware/auth';

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

// Password validation rules
const passwordValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({
      min: PASSWORD_VALIDATION.MIN_LENGTH,
      max: PASSWORD_VALIDATION.MAX_LENGTH
    })
    .withMessage(
      `Password must be between ${PASSWORD_VALIDATION.MIN_LENGTH} and ${PASSWORD_VALIDATION.MAX_LENGTH} characters long`
    )
    .matches(PASSWORD_VALIDATION.PATTERN)
    .withMessage(ERROR_MESSAGES.PASSWORD_INVALID_FORMAT),
];

// POST /api/users - Create new user (sign up)
router.post(
  '/',
  [...usernameValidation, ...passwordValidation],
  validate,
  createUser
);

// POST /api/users/login - Login user
router.post(
  '/login',
  ipLoginRateLimiter, // First layer: IP-based rate limiting (distributed attacks)
  usernameLoginRateLimiter, // Second layer: Username-based rate limiting (targeted attacks)
  [...usernameValidation, ...passwordValidation],
  validate,
  loginUser
);

// POST /api/users/logout - Logout user
router.post('/logout', logoutUser);

// POST /api/users/invalidate-sessions - Invalidate all sessions (requires auth)
router.post('/invalidate-sessions', authMiddleware, invalidateAllSessions);

// GET /api/users/:id - Get user by ID
router.get('/:id', [param('id').isUUID().withMessage('Invalid user ID')], validate, getUser);

// GET /api/users/:id/stats - Get user statistics
router.get(
  '/:id/stats',
  [param('id').isUUID().withMessage('Invalid user ID')],
  validate,
  getUserStats
);

export default router;

import { Router } from 'express';
import { body, param } from 'express-validator';
import { createUser, getUser, getUserStats, loginUser } from '../controllers/userController';
import { validate } from '../middleware/validator';

const router = Router();

router.post(
  '/',
  [body('username').trim().notEmpty().withMessage('Username is required')],
  validate,
  createUser
);

router.post(
  '/login',
  [body('username').trim().notEmpty().withMessage('Username is required')],
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

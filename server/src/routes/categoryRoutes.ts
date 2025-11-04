import { Router } from 'express';
import { param, body } from 'express-validator';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { validate } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth';
import { requireQuizManager } from '../middleware/authorization';

const router = Router();

// GET routes - accessible to all authenticated users
router.get('/', authMiddleware, getCategories);

router.get(
  '/:id',
  authMiddleware,
  [param('id').isUUID().withMessage('Invalid category ID')],
  validate,
  getCategory
);

// POST/PUT/DELETE routes - require QUIZ_MANAGER role
router.post(
  '/',
  authMiddleware,
  requireQuizManager,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('icon').trim().notEmpty().withMessage('Icon is required'),
  ],
  validate,
  createCategory
);

router.put(
  '/:id',
  authMiddleware,
  requireQuizManager,
  [
    param('id').isUUID().withMessage('Invalid category ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('icon').optional().trim().notEmpty().withMessage('Icon cannot be empty'),
  ],
  validate,
  updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  requireQuizManager,
  [param('id').isUUID().withMessage('Invalid category ID')],
  validate,
  deleteCategory
);

export default router;

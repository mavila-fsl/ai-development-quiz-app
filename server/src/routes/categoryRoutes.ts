import { Router } from 'express';
import { param } from 'express-validator';
import { getCategories, getCategory } from '../controllers/categoryController';
import { validate } from '../middleware/validator';

const router = Router();

router.get('/', getCategories);

router.get('/:id', [param('id').isUUID().withMessage('Invalid category ID')], validate, getCategory);

export default router;

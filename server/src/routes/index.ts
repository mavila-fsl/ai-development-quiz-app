import { Router } from 'express';
import userRoutes from './userRoutes';
import categoryRoutes from './categoryRoutes';
import quizRoutes from './quizRoutes';
import attemptRoutes from './attemptRoutes';
import aiRoutes from './aiRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/quizzes', quizRoutes);
router.use('/attempts', attemptRoutes);
router.use('/ai', aiRoutes);

export default router;

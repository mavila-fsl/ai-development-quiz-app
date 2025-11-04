import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@ai-quiz-app/shared';
import { AppError } from './errorHandler';
import { ERROR_MESSAGES } from '@ai-quiz-app/shared';

/**
 * Factory function that creates authorization middleware for specific roles
 * This middleware must be used AFTER authMiddleware to ensure req.userRole is set
 *
 * @param allowedRoles - Array of UserRole values that are permitted to access the route
 * @returns Express middleware function that validates user role
 *
 * @example
 * // Protect route for Quiz Managers only
 * router.post('/quizzes', authMiddleware, requireRole(UserRole.QUIZ_MANAGER), createQuiz);
 *
 * @example
 * // Protect route for both Quiz Managers and Quiz Takers
 * router.get('/dashboard', authMiddleware, requireRole(UserRole.QUIZ_MANAGER, UserRole.QUIZ_TAKER), getDashboard);
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Ensure authMiddleware was run first
      if (!req.userRole) {
        throw new AppError(401, ERROR_MESSAGES.MISSING_AUTH_TOKEN);
      }

      // Check if user's role is in the allowed roles list
      if (!allowedRoles.includes(req.userRole)) {
        throw new AppError(403, ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      // User has required role, proceed
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError(500, ERROR_MESSAGES.SERVER_ERROR));
      }
    }
  };
};

/**
 * Convenience middleware to protect routes requiring Quiz Manager role
 * Use this middleware AFTER authMiddleware
 *
 * @example
 * router.post('/quizzes', authMiddleware, requireQuizManager, createQuiz);
 * router.put('/categories/:id', authMiddleware, requireQuizManager, updateCategory);
 * router.delete('/questions/:id', authMiddleware, requireQuizManager, deleteQuestion);
 */
export const requireQuizManager = requireRole(UserRole.QUIZ_MANAGER);

/**
 * Convenience middleware to protect routes requiring Quiz Taker role
 * Use this middleware AFTER authMiddleware
 * Note: Most routes should allow both QUIZ_TAKER and QUIZ_MANAGER roles
 *
 * @example
 * router.post('/attempts/start', authMiddleware, requireQuizTaker, startAttempt);
 */
export const requireQuizTaker = requireRole(UserRole.QUIZ_TAKER);

/**
 * Middleware that allows both Quiz Managers and Quiz Takers
 * This is useful for routes that all authenticated users should access
 * Use this middleware AFTER authMiddleware
 *
 * @example
 * router.get('/quizzes', authMiddleware, requireAuthenticated, getQuizzes);
 * router.get('/categories', authMiddleware, requireAuthenticated, getCategories);
 */
export const requireAuthenticated = requireRole(UserRole.QUIZ_MANAGER, UserRole.QUIZ_TAKER);

import { Request, Response } from 'express';
import { prisma } from '@ai-quiz-app/database';
import { ApiResponse, User, UserRole, UserStats } from '@ai-quiz-app/shared';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ERROR_MESSAGES } from '@ai-quiz-app/shared';
import { hashPassword, verifyPassword } from '../services/passwordService';
import { generateToken, setAuthCookie, clearAuthCookie } from '../middleware/auth';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new AppError(400, ERROR_MESSAGES.USERNAME_ALREADY_EXISTS);
  }

  // Hash password before storing
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
    },
    select: {
      id: true,
      username: true,
      role: true,
      tokenVersion: true,
      createdAt: true,
    },
  });

  // Generate JWT token with role and tokenVersion
  const token = generateToken(user.id, user.role as UserRole, user.tokenVersion);

  // Set authentication cookie
  setAuthCookie(res, token);

  // Return user without tokenVersion
  const safeUser: User = {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    createdAt: user.createdAt,
  };

  const response: ApiResponse<User> = {
    success: true,
    data: safeUser,
    message: 'User created successfully',
  };

  res.status(201).json(response);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Cast role from Prisma string to UserRole enum
  const safeUser: User = {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    createdAt: user.createdAt,
  };

  const response: ApiResponse<User> = {
    success: true,
    data: safeUser,
  };

  res.json(response);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Fetch user with password hash, role, and tokenVersion
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      role: true,
      passwordHash: true,
      tokenVersion: true,
      createdAt: true,
    },
  });

  // Timing attack protection: Always perform bcrypt comparison even if user not found
  // This ensures the response time is consistent whether the user exists or not
  // Pre-computed bcrypt hash of "dummy_password_for_timing_attack_protection" with 12 rounds
  // This is a REAL bcrypt hash so the timing is identical to a valid comparison
  const DUMMY_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS/ZWL1Wm';
  const passwordHash = user?.passwordHash || DUMMY_HASH;
  const isValidPassword = await verifyPassword(password, passwordHash);

  // Additional timing attack protection: Add small random delay (10-50ms)
  // This further obscures any remaining timing differences
  const randomDelay = Math.floor(Math.random() * 40) + 10;
  await new Promise((resolve) => setTimeout(resolve, randomDelay));

  if (!user || !isValidPassword) {
    throw new AppError(401, ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Generate JWT token with role and tokenVersion
  const token = generateToken(user.id, user.role as UserRole, user.tokenVersion);

  // Set authentication cookie
  setAuthCookie(res, token);

  // Return user without password hash and tokenVersion
  const safeUser: User = {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    createdAt: user.createdAt,
  };

  const response: ApiResponse<User> = {
    success: true,
    data: safeUser,
    message: 'Login successful',
  };

  res.json(response);
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const authenticatedUserId = req.userId;

  // SECURITY: Verify the authenticated user is requesting their own stats (or is a Quiz Manager)
  if (id !== authenticatedUserId && req.userRole !== 'QUIZ_MANAGER') {
    throw new AppError(403, ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: id,
      completedAt: { not: null },
    },
    include: {
      quiz: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  const totalAttempts = attempts.length;
  const totalQuizzes = new Set(attempts.map((a) => a.quizId)).size;
  const averageScore = totalAttempts > 0
    ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
    : 0;
  const bestScore = totalAttempts > 0
    ? Math.max(...attempts.map((a) => a.percentage))
    : 0;

  // Calculate category performance
  const categoryMap = new Map();
  attempts.forEach((attempt) => {
    const categoryId = attempt.quiz.category.id;
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        category: attempt.quiz.category,
        attempts: 0,
        totalScore: 0,
      });
    }
    const data = categoryMap.get(categoryId);
    data.attempts += 1;
    data.totalScore += attempt.percentage;
  });

  const categoryPerformance = Array.from(categoryMap.values()).map((data) => ({
    category: data.category,
    attempts: data.attempts,
    averageScore: data.totalScore / data.attempts,
  }));

  // Map Prisma results to our typed QuizAttempt interface
  // Cast difficulty from string to literal union type
  const typedRecentAttempts = attempts.slice(0, 10).map((attempt) => ({
    ...attempt,
    quiz: {
      ...attempt.quiz,
      difficulty: attempt.quiz.difficulty as 'beginner' | 'intermediate' | 'advanced',
    },
  }));

  const stats: UserStats = {
    totalAttempts,
    totalQuizzes,
    averageScore,
    bestScore,
    recentAttempts: typedRecentAttempts,
    categoryPerformance,
  };

  const response: ApiResponse<UserStats> = {
    success: true,
    data: stats,
  };

  res.json(response);
});

/**
 * Logout user - clears authentication cookie
 */
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  // Clear the authentication cookie
  clearAuthCookie(res);

  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Logged out successfully',
  };

  res.json(response);
});

/**
 * Invalidate all sessions for the authenticated user
 * Increments the tokenVersion which invalidates all existing JWT tokens
 * Requires authentication
 */
export const invalidateAllSessions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError(401, ERROR_MESSAGES.MISSING_AUTH_TOKEN);
  }

  // Increment tokenVersion to invalidate all existing tokens
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      tokenVersion: {
        increment: 1,
      },
    },
    select: {
      id: true,
      username: true,
      role: true,
      tokenVersion: true,
      createdAt: true,
    },
  });

  // Generate new token with role and updated version
  const token = generateToken(user.id, user.role as UserRole, user.tokenVersion);

  // Set new authentication cookie
  setAuthCookie(res, token);

  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'All sessions invalidated successfully. You remain logged in with a new session.',
  };

  res.json(response);
});

import { Request, Response } from 'express';
import prisma from '../config/database';
import { ApiResponse, User, UserStats } from '@ai-quiz-app/shared';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ERROR_MESSAGES } from '@ai-quiz-app/shared';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new AppError(400, 'Username already exists');
  }

  const user = await prisma.user.create({
    data: { username },
  });

  const response: ApiResponse<User> = {
    success: true,
    data: user,
    message: 'User created successfully',
  };

  res.status(201).json(response);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(404, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const response: ApiResponse<User> = {
    success: true,
    data: user,
  };

  res.json(response);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.body;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new AppError(404, 'User not found. Please check your username or create a new account.');
  }

  const response: ApiResponse<User> = {
    success: true,
    data: user,
    message: 'Login successful',
  };

  res.json(response);
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
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

  const stats: UserStats = {
    totalAttempts,
    totalQuizzes,
    averageScore,
    bestScore,
    recentAttempts: attempts.slice(0, 10),
    categoryPerformance,
  };

  const response: ApiResponse<UserStats> = {
    success: true,
    data: stats,
  };

  res.json(response);
});

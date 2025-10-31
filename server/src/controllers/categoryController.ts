import { Request, Response } from 'express';
import { prisma } from '@ai-quiz-app/database';
import { ApiResponse, QuizCategory } from '@ai-quiz-app/shared';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ERROR_MESSAGES } from '@ai-quiz-app/shared';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.quizCategory.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  const response: ApiResponse<QuizCategory[]> = {
    success: true,
    data: categories,
  };

  res.json(response);
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await prisma.quizCategory.findUnique({
    where: { id },
    include: {
      quizzes: true,
    },
  });

  if (!category) {
    throw new AppError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
  }

  const response: ApiResponse<QuizCategory> = {
    success: true,
    data: category,
  };

  res.json(response);
});

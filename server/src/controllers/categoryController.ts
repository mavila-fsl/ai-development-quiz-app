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

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, icon } = req.body;

  const category = await prisma.quizCategory.create({
    data: {
      name,
      description,
      icon,
    },
  });

  const response: ApiResponse<QuizCategory> = {
    success: true,
    data: category,
  };

  res.status(201).json(response);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, icon } = req.body;

  // Verify category exists
  const existingCategory = await prisma.quizCategory.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new AppError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
  }

  const category = await prisma.quizCategory.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(icon && { icon }),
    },
  });

  const response: ApiResponse<QuizCategory> = {
    success: true,
    data: category,
  };

  res.json(response);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verify category exists
  const category = await prisma.quizCategory.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
  }

  // Delete category (cascade will handle quizzes, questions, attempts, answers)
  await prisma.quizCategory.delete({
    where: { id },
  });

  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'Category deleted successfully' },
  };

  res.json(response);
});

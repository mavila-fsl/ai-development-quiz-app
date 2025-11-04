import { Request, Response } from 'express';
import { prisma } from '@ai-quiz-app/database';
import { ApiResponse, Quiz, Question, QuestionOption } from '@ai-quiz-app/shared';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ERROR_MESSAGES } from '@ai-quiz-app/shared';

export const getQuizzes = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.query;

  const quizzes = await prisma.quiz.findMany({
    where: categoryId ? { categoryId: categoryId as string } : undefined,
    include: {
      category: true,
      _count: {
        select: { questions: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Map Prisma results to typed Quiz[] with proper difficulty type
  const typedQuizzes: Quiz[] = quizzes.map((quiz) => ({
    ...quiz,
    difficulty: quiz.difficulty as 'beginner' | 'intermediate' | 'advanced',
  }));

  const response: ApiResponse<Quiz[]> = {
    success: true,
    data: typedQuizzes,
  };

  res.json(response);
});

export const getQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!quiz) {
    throw new AppError(404, ERROR_MESSAGES.QUIZ_NOT_FOUND);
  }

  // Map Prisma result to typed Quiz with proper difficulty type
  const typedQuiz: Quiz = {
    ...quiz,
    difficulty: quiz.difficulty as 'beginner' | 'intermediate' | 'advanced',
  };

  const response: ApiResponse<Quiz> = {
    success: true,
    data: typedQuiz,
  };

  res.json(response);
});

export const getQuizQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
  });

  if (!quiz) {
    throw new AppError(404, ERROR_MESSAGES.QUIZ_NOT_FOUND);
  }

  const questions = await prisma.question.findMany({
    where: { quizId: id },
    orderBy: { order: 'asc' },
  });

  // Parse options JSON and exclude correct answer
  const sanitizedQuestions: Question[] = questions.map((q) => ({
    id: q.id,
    quizId: q.quizId,
    question: q.question,
    options: JSON.parse(q.options) as QuestionOption[],
    correctAnswer: '', // Don't send correct answer to client
    explanation: '', // Don't send explanation until answered
    order: q.order,
  }));

  const response: ApiResponse<Question[]> = {
    success: true,
    data: sanitizedQuestions,
  };

  res.json(response);
});

export const createQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, title, description, difficulty } = req.body;

  // Verify category exists
  const category = await prisma.quizCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
  }

  const quiz = await prisma.quiz.create({
    data: {
      categoryId,
      title,
      description,
      difficulty,
    },
    include: {
      category: true,
    },
  });

  const typedQuiz: Quiz = {
    ...quiz,
    difficulty: quiz.difficulty as 'beginner' | 'intermediate' | 'advanced',
  };

  const response: ApiResponse<Quiz> = {
    success: true,
    data: typedQuiz,
  };

  res.status(201).json(response);
});

export const updateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { categoryId, title, description, difficulty } = req.body;

  // Verify quiz exists
  const existingQuiz = await prisma.quiz.findUnique({
    where: { id },
  });

  if (!existingQuiz) {
    throw new AppError(404, ERROR_MESSAGES.QUIZ_NOT_FOUND);
  }

  // If categoryId is being updated, verify it exists
  if (categoryId) {
    const category = await prisma.quizCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }
  }

  const quiz = await prisma.quiz.update({
    where: { id },
    data: {
      ...(categoryId && { categoryId }),
      ...(title && { title }),
      ...(description && { description }),
      ...(difficulty && { difficulty }),
    },
    include: {
      category: true,
    },
  });

  const typedQuiz: Quiz = {
    ...quiz,
    difficulty: quiz.difficulty as 'beginner' | 'intermediate' | 'advanced',
  };

  const response: ApiResponse<Quiz> = {
    success: true,
    data: typedQuiz,
  };

  res.json(response);
});

export const deleteQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verify quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: { id },
  });

  if (!quiz) {
    throw new AppError(404, ERROR_MESSAGES.QUIZ_NOT_FOUND);
  }

  // Delete quiz (cascade will handle questions, attempts, answers)
  await prisma.quiz.delete({
    where: { id },
  });

  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'Quiz deleted successfully' },
  };

  res.json(response);
});

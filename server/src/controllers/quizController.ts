import { Request, Response } from 'express';
import prisma from '../config/database';
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

  const response: ApiResponse<Quiz[]> = {
    success: true,
    data: quizzes as any,
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

  const response: ApiResponse<Quiz> = {
    success: true,
    data: quiz,
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

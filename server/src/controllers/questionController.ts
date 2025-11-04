import { Request, Response } from 'express';
import { prisma } from '@ai-quiz-app/database';
import { ApiResponse, Question, QuestionOption } from '@ai-quiz-app/shared';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ERROR_MESSAGES } from '@ai-quiz-app/shared';

export const getQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.query;

  const questions = await prisma.question.findMany({
    where: quizId ? { quizId: quizId as string } : undefined,
    orderBy: { order: 'asc' },
  });

  // Parse options JSON for all questions
  const parsedQuestions: Question[] = questions.map((q) => ({
    id: q.id,
    quizId: q.quizId,
    question: q.question,
    options: JSON.parse(q.options) as QuestionOption[],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    order: q.order,
  }));

  const response: ApiResponse<Question[]> = {
    success: true,
    data: parsedQuestions,
  };

  res.json(response);
});

export const getQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const question = await prisma.question.findUnique({
    where: { id },
  });

  if (!question) {
    throw new AppError(404, 'Question not found');
  }

  // Parse options JSON
  const parsedQuestion: Question = {
    id: question.id,
    quizId: question.quizId,
    question: question.question,
    options: JSON.parse(question.options) as QuestionOption[],
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    order: question.order,
  };

  const response: ApiResponse<Question> = {
    success: true,
    data: parsedQuestion,
  };

  res.json(response);
});

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { quizId, question, options, correctAnswer, explanation, order } = req.body;

  // Verify quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    throw new AppError(404, ERROR_MESSAGES.QUIZ_NOT_FOUND);
  }

  // Validate that correctAnswer matches one of the option IDs
  const optionIds = options.map((opt: QuestionOption) => opt.id);
  if (!optionIds.includes(correctAnswer)) {
    throw new AppError(400, 'Correct answer must match one of the option IDs');
  }

  // Stringify options for storage
  const optionsJson = JSON.stringify(options);

  const newQuestion = await prisma.question.create({
    data: {
      quizId,
      question,
      options: optionsJson,
      correctAnswer,
      explanation,
      order: order || 0,
    },
  });

  // Parse options for response
  const parsedQuestion: Question = {
    id: newQuestion.id,
    quizId: newQuestion.quizId,
    question: newQuestion.question,
    options: JSON.parse(newQuestion.options) as QuestionOption[],
    correctAnswer: newQuestion.correctAnswer,
    explanation: newQuestion.explanation,
    order: newQuestion.order,
  };

  const response: ApiResponse<Question> = {
    success: true,
    data: parsedQuestion,
  };

  res.status(201).json(response);
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quizId, question, options, correctAnswer, explanation, order } = req.body;

  // Verify question exists
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
  });

  if (!existingQuestion) {
    throw new AppError(404, 'Question not found');
  }

  // If quizId is being updated, verify it exists
  if (quizId) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new AppError(404, ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }
  }

  // If options are being updated and correctAnswer is provided, validate
  if (options && correctAnswer) {
    const optionIds = options.map((opt: QuestionOption) => opt.id);
    if (!optionIds.includes(correctAnswer)) {
      throw new AppError(400, 'Correct answer must match one of the option IDs');
    }
  }

  // Stringify options if provided
  const optionsJson = options ? JSON.stringify(options) : undefined;

  const updatedQuestion = await prisma.question.update({
    where: { id },
    data: {
      ...(quizId && { quizId }),
      ...(question && { question }),
      ...(optionsJson && { options: optionsJson }),
      ...(correctAnswer && { correctAnswer }),
      ...(explanation !== undefined && { explanation }),
      ...(order !== undefined && { order }),
    },
  });

  // Parse options for response
  const parsedQuestion: Question = {
    id: updatedQuestion.id,
    quizId: updatedQuestion.quizId,
    question: updatedQuestion.question,
    options: JSON.parse(updatedQuestion.options) as QuestionOption[],
    correctAnswer: updatedQuestion.correctAnswer,
    explanation: updatedQuestion.explanation,
    order: updatedQuestion.order,
  };

  const response: ApiResponse<Question> = {
    success: true,
    data: parsedQuestion,
  };

  res.json(response);
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verify question exists
  const question = await prisma.question.findUnique({
    where: { id },
  });

  if (!question) {
    throw new AppError(404, 'Question not found');
  }

  // Delete question (cascade will handle answers)
  await prisma.question.delete({
    where: { id },
  });

  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'Question deleted successfully' },
  };

  res.json(response);
});

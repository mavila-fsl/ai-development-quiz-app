import { Request, Response } from 'express';
import { prisma } from '@ai-quiz-app/database';
import {
  ApiResponse,
  QuizAttempt,
  QuizResult,
  AnswerResult,
  UserRole,
  PERFORMANCE_THRESHOLDS,
  PERFORMANCE_MESSAGES,
} from '@ai-quiz-app/shared';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ERROR_MESSAGES } from '@ai-quiz-app/shared';

export const startAttempt = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.body;
  // SECURITY: Use authenticated user ID from JWT token, not from request body
  const userId = req.userId;

  if (!userId) {
    throw new AppError(401, ERROR_MESSAGES.MISSING_AUTH_TOKEN);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    throw new AppError(404, ERROR_MESSAGES.QUIZ_NOT_FOUND);
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
    },
    include: {
      quiz: {
        include: {
          category: true,
        },
      },
    },
  });

  // Map Prisma result to typed QuizAttempt with proper difficulty type
  const typedAttempt: QuizAttempt = {
    ...attempt,
    quiz: {
      ...attempt.quiz,
      difficulty: attempt.quiz.difficulty as 'beginner' | 'intermediate' | 'advanced',
    },
  };

  const response: ApiResponse<QuizAttempt> = {
    success: true,
    data: typedAttempt,
    message: 'Quiz attempt started',
  };

  res.status(201).json(response);
});

export const completeAttempt = asyncHandler(async (req: Request, res: Response) => {
  const { attemptId, answers } = req.body;
  const authenticatedUserId = req.userId;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: true,
    },
  });

  if (!attempt) {
    throw new AppError(404, ERROR_MESSAGES.ATTEMPT_NOT_FOUND);
  }

  // SECURITY: Verify the authenticated user owns this attempt
  if (attempt.userId !== authenticatedUserId) {
    throw new AppError(403, ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
  }

  if (attempt.completedAt) {
    throw new AppError(400, ERROR_MESSAGES.ATTEMPT_ALREADY_COMPLETED);
  }

  // Get all questions for this quiz
  const questions = await prisma.question.findMany({
    where: { quizId: attempt.quizId },
  });

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  // Process each answer
  let correctCount = 0;
  const answerResults: AnswerResult[] = [];

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    const isCorrect = answer.userAnswer === question.correctAnswer;
    if (isCorrect) correctCount++;

    // Save answer to database
    await prisma.answer.create({
      data: {
        attemptId,
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect,
      },
    });

    // Build answer result
    answerResults.push({
      question: {
        ...question,
        options: JSON.parse(question.options),
      },
      userAnswer: answer.userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
    });
  }

  // Calculate score
  const totalQuestions = questions.length;
  const percentage = (correctCount / totalQuestions) * 100;

  // Update attempt
  const updatedAttempt = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      score: correctCount,
      percentage,
      completedAt: new Date(),
    },
    include: {
      quiz: {
        include: {
          category: true,
        },
      },
      user: true,
    },
  });

  // Generate feedback - type as string to avoid literal type conflicts
  let feedback: string = PERFORMANCE_MESSAGES.NEEDS_IMPROVEMENT;
  if (percentage >= PERFORMANCE_THRESHOLDS.EXCELLENT) {
    feedback = PERFORMANCE_MESSAGES.EXCELLENT;
  } else if (percentage >= PERFORMANCE_THRESHOLDS.GOOD) {
    feedback = PERFORMANCE_MESSAGES.GOOD;
  } else if (percentage >= PERFORMANCE_THRESHOLDS.AVERAGE) {
    feedback = PERFORMANCE_MESSAGES.AVERAGE;
  }

  // Map Prisma result to typed QuizAttempt with proper difficulty and role types
  const typedUpdatedAttempt: QuizAttempt = {
    ...updatedAttempt,
    user: updatedAttempt.user ? {
      ...updatedAttempt.user,
      role: updatedAttempt.user.role as UserRole,
    } : undefined,
    quiz: {
      ...updatedAttempt.quiz,
      difficulty: updatedAttempt.quiz.difficulty as 'beginner' | 'intermediate' | 'advanced',
    },
  };

  const result: QuizResult = {
    attempt: typedUpdatedAttempt,
    score: correctCount,
    percentage,
    totalQuestions,
    correctAnswers: correctCount,
    incorrectAnswers: totalQuestions - correctCount,
    feedback,
    answers: answerResults,
  };

  const response: ApiResponse<QuizResult> = {
    success: true,
    data: result,
    message: 'Quiz completed successfully',
  };

  res.json(response);
});

export const getAttempt = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const authenticatedUserId = req.userId;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id },
    include: {
      quiz: {
        include: {
          category: true,
        },
      },
      user: true,
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError(404, ERROR_MESSAGES.ATTEMPT_NOT_FOUND);
  }

  // SECURITY: Verify the authenticated user owns this attempt (or is a Quiz Manager)
  if (attempt.userId !== authenticatedUserId && req.userRole !== 'QUIZ_MANAGER') {
    throw new AppError(403, ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
  }

  // Map Prisma result to typed QuizAttempt with proper difficulty and role types
  const typedAttempt: QuizAttempt = {
    ...attempt,
    user: attempt.user ? {
      ...attempt.user,
      role: attempt.user.role as UserRole,
    } : undefined,
    quiz: {
      ...attempt.quiz,
      difficulty: attempt.quiz.difficulty as 'beginner' | 'intermediate' | 'advanced',
    },
  };

  const response: ApiResponse<QuizAttempt> = {
    success: true,
    data: typedAttempt,
  };

  res.json(response);
});

export const getUserAttempts = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const authenticatedUserId = req.userId;

  // SECURITY: Verify the authenticated user is requesting their own attempts (or is a Quiz Manager)
  if (userId !== authenticatedUserId && req.userRole !== 'QUIZ_MANAGER') {
    throw new AppError(403, ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      quiz: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      startedAt: 'desc',
    },
  });

  // Map Prisma results to typed QuizAttempt[] with proper difficulty type
  const typedAttempts: QuizAttempt[] = attempts.map((attempt) => ({
    ...attempt,
    quiz: {
      ...attempt.quiz,
      difficulty: attempt.quiz.difficulty as 'beginner' | 'intermediate' | 'advanced',
    },
  }));

  const response: ApiResponse<QuizAttempt[]> = {
    success: true,
    data: typedAttempts,
  };

  res.json(response);
});

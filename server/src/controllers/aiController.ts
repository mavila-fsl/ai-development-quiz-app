import { Request, Response } from 'express';
import { prisma } from '@ai-quiz-app/database';
import aiService from '../services/aiService';
import { ApiResponse, AIRecommendation, AIEnhancedExplanation } from '@ai-quiz-app/shared';
import { asyncHandler } from '../middleware/errorHandler';

export const getRecommendation = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId,
      completedAt: { not: null },
    },
    include: {
      quiz: {
        include: {
          category: true,
        },
      },
    },
  });

  // Calculate performance metrics
  const averageScore = attempts.length > 0
    ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
    : 0;

  const categoryScores: Record<string, number> = {};
  const categoryCount: Record<string, number> = {};

  attempts.forEach((attempt) => {
    const categoryName = attempt.quiz.category.name;
    if (!categoryScores[categoryName]) {
      categoryScores[categoryName] = 0;
      categoryCount[categoryName] = 0;
    }
    categoryScores[categoryName] += attempt.percentage;
    categoryCount[categoryName] += 1;
  });

  Object.keys(categoryScores).forEach((category) => {
    categoryScores[category] = categoryScores[category] / categoryCount[category];
  });

  // Map Prisma results to typed QuizAttempt[] with proper difficulty type
  const typedAttempts = attempts.map((attempt) => ({
    ...attempt,
    quiz: {
      ...attempt.quiz,
      difficulty: attempt.quiz.difficulty as 'beginner' | 'intermediate' | 'advanced',
    },
  }));

  const recommendation = await aiService.generateRecommendation(typedAttempts, {
    averageScore,
    categoryScores,
  });

  const response: ApiResponse<AIRecommendation> = {
    success: true,
    data: recommendation,
  };

  res.json(response);
});

export const enhanceExplanation = asyncHandler(async (req: Request, res: Response) => {
  const { originalExplanation, userAnswer, correctAnswer, question } = req.body;

  const enhanced = await aiService.enhanceExplanation(
    originalExplanation,
    userAnswer,
    correctAnswer,
    question
  );

  const response: ApiResponse<AIEnhancedExplanation> = {
    success: true,
    data: enhanced,
  };

  res.json(response);
});

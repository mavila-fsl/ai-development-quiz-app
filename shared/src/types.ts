// User Types
export interface User {
  id: string;
  username: string;
  createdAt: Date;
}

export interface CreateUserDto {
  username: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

// Quiz Category Types
export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
}

// Quiz Types
export interface Quiz {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  category?: QuizCategory;
  questions?: Question[];
}

// Question Types
export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  quizId: string;
  question: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  order: number;
}

// Quiz Attempt Types
export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  percentage: number;
  startedAt: Date;
  completedAt: Date | null;
  user?: User;
  quiz?: Quiz;
  answers?: Answer[];
}

export interface CreateQuizAttemptDto {
  userId: string;
  quizId: string;
}

export interface CompleteQuizAttemptDto {
  attemptId: string;
  answers: SubmitAnswerDto[];
}

// Answer Types
export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  createdAt: Date;
}

export interface SubmitAnswerDto {
  questionId: string;
  userAnswer: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Quiz Results Types
export interface QuizResult {
  attempt: QuizAttempt;
  score: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  feedback: string;
  answers: AnswerResult[];
}

export interface AnswerResult {
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

// Dashboard Types
export interface UserStats {
  totalAttempts: number;
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  recentAttempts: QuizAttempt[];
  categoryPerformance: CategoryPerformance[];
}

export interface CategoryPerformance {
  category: QuizCategory;
  attempts: number;
  averageScore: number;
}

// AI Enhancement Types
export interface AIRecommendation {
  message: string;
  suggestedTopics: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}

export interface AIEnhancedExplanation {
  originalExplanation: string;
  enhancedExplanation: string;
  additionalContext: string;
}

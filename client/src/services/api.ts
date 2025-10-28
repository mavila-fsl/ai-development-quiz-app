import axios from 'axios';
import type {
  ApiResponse,
  User,
  QuizCategory,
  Quiz,
  Question,
  QuizAttempt,
  QuizResult,
  UserStats,
  AIRecommendation,
  AIEnhancedExplanation,
  CreateUserDto,
  CreateQuizAttemptDto,
  CompleteQuizAttemptDto,
} from '@ai-quiz-app/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users
export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await api.post<ApiResponse<User>>('/users', data);
  return response.data.data!;
};

export const loginUser = async (data: CreateUserDto): Promise<User> => {
  const response = await api.post<ApiResponse<User>>('/users/login', data);
  return response.data.data!;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data!;
};

export const getUserStats = async (id: string): Promise<UserStats> => {
  const response = await api.get<ApiResponse<UserStats>>(`/users/${id}/stats`);
  return response.data.data!;
};

// Categories
export const getCategories = async (): Promise<QuizCategory[]> => {
  const response = await api.get<ApiResponse<QuizCategory[]>>('/categories');
  return response.data.data!;
};

export const getCategory = async (id: string): Promise<QuizCategory> => {
  const response = await api.get<ApiResponse<QuizCategory>>(`/categories/${id}`);
  return response.data.data!;
};

// Quizzes
export const getQuizzes = async (categoryId?: string): Promise<Quiz[]> => {
  const response = await api.get<ApiResponse<Quiz[]>>('/quizzes', {
    params: categoryId ? { categoryId } : undefined,
  });
  return response.data.data!;
};

export const getQuiz = async (id: string): Promise<Quiz> => {
  const response = await api.get<ApiResponse<Quiz>>(`/quizzes/${id}`);
  return response.data.data!;
};

export const getQuizQuestions = async (quizId: string): Promise<Question[]> => {
  const response = await api.get<ApiResponse<Question[]>>(`/quizzes/${quizId}/questions`);
  return response.data.data!;
};

// Quiz Attempts
export const startAttempt = async (data: CreateQuizAttemptDto): Promise<QuizAttempt> => {
  const response = await api.post<ApiResponse<QuizAttempt>>('/attempts/start', data);
  return response.data.data!;
};

export const completeAttempt = async (data: CompleteQuizAttemptDto): Promise<QuizResult> => {
  const response = await api.post<ApiResponse<QuizResult>>('/attempts/complete', data);
  return response.data.data!;
};

export const getAttempt = async (id: string): Promise<QuizAttempt> => {
  const response = await api.get<ApiResponse<QuizAttempt>>(`/attempts/${id}`);
  return response.data.data!;
};

export const getUserAttempts = async (userId: string): Promise<QuizAttempt[]> => {
  const response = await api.get<ApiResponse<QuizAttempt[]>>(`/attempts/user/${userId}`);
  return response.data.data!;
};

// AI Features
export const getAIRecommendation = async (userId: string): Promise<AIRecommendation> => {
  const response = await api.post<ApiResponse<AIRecommendation>>('/ai/recommendation', {
    userId,
  });
  return response.data.data!;
};

export const enhanceExplanation = async (
  originalExplanation: string,
  userAnswer: string,
  correctAnswer: string,
  question: string
): Promise<AIEnhancedExplanation> => {
  const response = await api.post<ApiResponse<AIEnhancedExplanation>>('/ai/enhance-explanation', {
    originalExplanation,
    userAnswer,
    correctAnswer,
    question,
  });
  return response.data.data!;
};

export default api;

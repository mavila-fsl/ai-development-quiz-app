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
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuestionDto,
  UpdateQuestionDto,
} from '@ai-quiz-app/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies for JWT authentication
});

// Add response interceptor to handle 403 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // 403 Forbidden - user doesn't have permission
      console.error('Access denied:', error.response.data?.error || 'Insufficient permissions');

      // Let the error propagate so components can handle it
      // The RoleProtectedRoute component will redirect to /unauthorized
    }

    return Promise.reject(error);
  }
);

// Users
export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await api.post<ApiResponse<User>>('/users', data);
  return response.data.data!;
};

export const loginUser = async (data: CreateUserDto): Promise<User> => {
  const response = await api.post<ApiResponse<User>>('/users/login', data);
  return response.data.data!;
};

export const logoutUser = async (): Promise<void> => {
  await api.post<ApiResponse<null>>('/users/logout');
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

export const createCategory = async (data: CreateCategoryDto): Promise<QuizCategory> => {
  const response = await api.post<ApiResponse<QuizCategory>>('/categories', data);
  return response.data.data!;
};

export const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<QuizCategory> => {
  const response = await api.put<ApiResponse<QuizCategory>>(`/categories/${id}`, data);
  return response.data.data!;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
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

export const createQuiz = async (data: CreateQuizDto): Promise<Quiz> => {
  const response = await api.post<ApiResponse<Quiz>>('/quizzes', data);
  return response.data.data!;
};

export const updateQuiz = async (id: string, data: UpdateQuizDto): Promise<Quiz> => {
  const response = await api.put<ApiResponse<Quiz>>(`/quizzes/${id}`, data);
  return response.data.data!;
};

export const deleteQuiz = async (id: string): Promise<void> => {
  await api.delete(`/quizzes/${id}`);
};

// Questions
export const createQuestion = async (data: CreateQuestionDto): Promise<Question> => {
  const response = await api.post<ApiResponse<Question>>('/questions', data);
  return response.data.data!;
};

export const updateQuestion = async (id: string, data: UpdateQuestionDto): Promise<Question> => {
  const response = await api.put<ApiResponse<Question>>(`/questions/${id}`, data);
  return response.data.data!;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  await api.delete(`/questions/${id}`);
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

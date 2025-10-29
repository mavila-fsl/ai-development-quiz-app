// Quiz Difficulty Levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

// Performance Feedback Thresholds
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  AVERAGE: 60,
  NEEDS_IMPROVEMENT: 0,
} as const;

// Performance Feedback Messages
export const PERFORMANCE_MESSAGES = {
  EXCELLENT: 'Excellent work! You have a strong understanding of this topic.',
  GOOD: 'Good job! You have a solid grasp of the material.',
  AVERAGE: 'Not bad! Keep practicing to improve your understanding.',
  NEEDS_IMPROVEMENT: 'Keep studying! Review the material and try again.',
} as const;

// Quiz Categories
export const QUIZ_CATEGORIES = {
  AGENT_FUNDAMENTALS: 'agent-fundamentals',
  PROMPT_ENGINEERING: 'prompt-engineering',
  MODEL_SELECTION: 'model-selection',
} as const;

// API Routes
export const API_ROUTES = {
  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_STATS: (id: string) => `/api/users/${id}/stats`,

  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY_BY_ID: (id: string) => `/api/categories/${id}`,

  // Quizzes
  QUIZZES: '/api/quizzes',
  QUIZ_BY_ID: (id: string) => `/api/quizzes/${id}`,
  QUIZZES_BY_CATEGORY: (categoryId: string) => `/api/categories/${categoryId}/quizzes`,

  // Questions
  QUESTIONS_BY_QUIZ: (quizId: string) => `/api/quizzes/${quizId}/questions`,

  // Quiz Attempts
  ATTEMPTS: '/api/attempts',
  ATTEMPT_BY_ID: (id: string) => `/api/attempts/${id}`,
  START_ATTEMPT: '/api/attempts/start',
  COMPLETE_ATTEMPT: '/api/attempts/complete',
  USER_ATTEMPTS: (userId: string) => `/api/users/${userId}/attempts`,

  // AI Features
  AI_RECOMMENDATION: '/api/ai/recommendation',
  AI_ENHANCE_EXPLANATION: '/api/ai/enhance-explanation',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  CURRENT_USER: 'ai_quiz_current_user',
  CURRENT_ATTEMPT: 'ai_quiz_current_attempt',
  THEME_PREFERENCE: 'ai_quiz_theme',
} as const;

// Username Validation
export const USERNAME_VALIDATION = {
  MIN_LENGTH: 4,
  MAX_LENGTH: 40,
  PATTERN: /^[a-zA-Z0-9@._-]+$/,
  ALLOWED_SPECIAL_CHARS: '@._-',
  PATTERN_DESCRIPTION: 'Username must contain only letters, numbers, and special characters (@, -, _, .)',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  QUIZ_NOT_FOUND: 'Quiz not found',
  CATEGORY_NOT_FOUND: 'Category not found',
  ATTEMPT_NOT_FOUND: 'Quiz attempt not found',
  INVALID_ANSWER: 'Invalid answer provided',
  ATTEMPT_ALREADY_COMPLETED: 'Quiz attempt already completed',
  UNAUTHORIZED: 'Unauthorized access',
  SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  USERNAME_TOO_SHORT: 'Username must be at least 4 characters long',
  USERNAME_TOO_LONG: 'Username cannot exceed 40 characters',
  USERNAME_INVALID_FORMAT: 'Username must contain only letters, numbers, and special characters (@, -, _, .)',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
} as const;

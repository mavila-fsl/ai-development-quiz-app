// User Roles
export const USER_ROLES = {
  QUIZ_TAKER: 'QUIZ_TAKER',
  QUIZ_MANAGER: 'QUIZ_MANAGER',
} as const;

// User Role Display Names
export const ROLE_DISPLAY_NAMES = {
  QUIZ_TAKER: 'Quiz Taker',
  QUIZ_MANAGER: 'Quiz Manager',
} as const;

// User Role Descriptions
export const ROLE_DESCRIPTIONS = {
  QUIZ_TAKER: 'Can take quizzes and view their own results and statistics',
  QUIZ_MANAGER: 'Can manage quiz content, categories, questions, and view all user statistics',
} as const;

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

// Password Validation
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-{}\[\]:;"'<>,.\/\\|`~])[A-Za-z\d@$!%*?&#^()_+=\-{}\[\]:;"'<>,.\/\\|`~]{8,}$/,
  PATTERN_DESCRIPTION: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
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
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_TOO_LONG: 'Password cannot exceed 128 characters',
  PASSWORD_INVALID_FORMAT: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  INVALID_CREDENTIALS: 'Invalid username or password',
  RATE_LIMIT_EXCEEDED: 'Too many login attempts. Please try again later',
  MISSING_AUTH_TOKEN: 'Authentication token is missing',
  INVALID_AUTH_TOKEN: 'Authentication token is invalid or expired',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
  ROLE_REQUIRED_QUIZ_MANAGER: 'This action requires Quiz Manager role',
  INVALID_ROLE: 'Invalid user role specified',
  ROLE_CHANGE_UNAUTHORIZED: 'You are not authorized to change user roles',
} as const;

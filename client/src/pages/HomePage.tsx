import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getCategories } from '../services/api';
import { QuizCategory, USERNAME_VALIDATION, ERROR_MESSAGES } from '@ai-quiz-app/shared';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';

/**
 * Validates a username according to the application's requirements.
 * @param username - The username to validate
 * @returns An error message if validation fails, or null if valid
 */
const validateUsername = (username: string): string | null => {
  const trimmed = username.trim();

  if (trimmed.length === 0) {
    return 'Username is required';
  }

  if (trimmed.length < USERNAME_VALIDATION.MIN_LENGTH) {
    return ERROR_MESSAGES.USERNAME_TOO_SHORT;
  }

  if (trimmed.length > USERNAME_VALIDATION.MAX_LENGTH) {
    return ERROR_MESSAGES.USERNAME_TOO_LONG;
  }

  if (/\s/.test(trimmed)) {
    return 'Username cannot contain spaces';
  }

  if (!USERNAME_VALIDATION.PATTERN.test(trimmed)) {
    return ERROR_MESSAGES.USERNAME_INVALID_FORMAT;
  }

  return null; // Valid
};

const HomePage: React.FC = () => {
  const { user, createUser, loginUser } = useUser();
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [creating, setCreating] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setCreating(true);
    setError('');
    try {
      if (isLogin) {
        await loginUser(username.trim());
      } else {
        await createUser(username.trim());
      }
    } catch (error: any) {
      console.error(`Failed to ${isLogin ? 'login' : 'create user'}:`, error);
      const errorMessage = error.response?.data?.error ||
        (isLogin
          ? 'User not found. Please check your username or create a new account.'
          : 'Failed to create user. Username may already exist.');
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <Loading message="Loading quiz categories..." />;
  }

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome to AI Quiz App</h1>
            <p className="mb-6 text-gray-600">
              Test and reinforce your understanding of AI software development concepts
            </p>

            <div className="mb-6 flex rounded-lg border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isLogin
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  !isLogin
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-2 block text-left text-sm font-medium text-gray-700">
                  {isLogin ? 'Enter your username' : 'Choose a username'}
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your username"
                  className="input"
                  required
                  disabled={creating}
                  minLength={USERNAME_VALIDATION.MIN_LENGTH}
                  maxLength={USERNAME_VALIDATION.MAX_LENGTH}
                  pattern={USERNAME_VALIDATION.PATTERN.source}
                  title={USERNAME_VALIDATION.PATTERN_DESCRIPTION}
                />
                {!isLogin && (
                  <p className="mt-2 text-left text-xs text-gray-500">
                    {USERNAME_VALIDATION.MIN_LENGTH}-{USERNAME_VALIDATION.MAX_LENGTH} characters. Letters, numbers, and {USERNAME_VALIDATION.ALLOWED_SPECIAL_CHARS} allowed. No spaces.
                  </p>
                )}
              </div>
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? (isLogin ? 'Logging in...' : 'Creating account...') : (isLogin ? 'Login' : 'Create Account')}
              </Button>
            </form>
            {isLogin && (
              <p className="mt-4 text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Create one
                </button>
              </p>
            )}
            {!isLogin && (
              <p className="mt-4 text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">AI Development Quiz</h1>
        <p className="text-lg text-gray-600">
          Choose a quiz category below to test your knowledge
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            onClick={() => navigate(`/category/${category.id}`)}
            className="animate-slide-up"
          >
            <div className="mb-4 text-4xl">{category.icon}</div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">{category.name}</h2>
            <p className="text-gray-600">{category.description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 p-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="mb-2 text-3xl">1️⃣</div>
            <h3 className="mb-2 font-semibold text-gray-900">Choose a Quiz</h3>
            <p className="text-sm text-gray-600">
              Select from our curated collection of AI development quizzes
            </p>
          </div>
          <div>
            <div className="mb-2 text-3xl">2️⃣</div>
            <h3 className="mb-2 font-semibold text-gray-900">Answer Questions</h3>
            <p className="text-sm text-gray-600">
              Get immediate feedback and detailed explanations for each answer
            </p>
          </div>
          <div>
            <div className="mb-2 text-3xl">3️⃣</div>
            <h3 className="mb-2 font-semibold text-gray-900">Track Progress</h3>
            <p className="text-sm text-gray-600">
              View your scores, history, and personalized recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getCategories } from '../services/api';
import { QuizCategory, USERNAME_VALIDATION, ERROR_MESSAGES } from '@ai-quiz-app/shared';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import PasswordInput from '../components/PasswordInput';
import {
  calculatePasswordStrength,
  validatePassword,
  validatePasswordMatch,
} from '../utils/passwordValidation';

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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
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

  // Calculate password strength in real-time for sign-up
  const passwordStrength = !isLogin && password ? calculatePasswordStrength(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const usernameValidationError = validateUsername(username);
    if (usernameValidationError) {
      setError(usernameValidationError);
      return;
    }

    // Password validation
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    // For sign-up, check password match and strength
    if (!isLogin) {
      const matchError = validatePasswordMatch(password, confirmPassword);
      if (matchError) {
        setPasswordError(matchError);
        return;
      }

      const strength = calculatePasswordStrength(password);
      if (strength.score < 2) {
        setPasswordError('Password is too weak. Please choose a stronger password.');
        return;
      }
    }

    setCreating(true);
    setError('');
    setPasswordError('');
    try {
      if (isLogin) {
        await loginUser(username.trim(), password);
      } else {
        await createUser(username.trim(), password);
      }
    } catch (error: any) {
      console.error(`Failed to ${isLogin ? 'login' : 'create user'}:`, error);

      // Clear password on error for security
      setPassword('');
      setConfirmPassword('');

      // Handle specific error cases
      const status = error.response?.status;
      const errorMessage = error.response?.data?.error;

      if (status === 401) {
        setError(ERROR_MESSAGES.INVALID_CREDENTIALS);
      } else if (status === 429) {
        setError(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
      } else if (errorMessage) {
        setError(errorMessage);
      } else {
        setError(
          isLogin
            ? 'Login failed. Please check your credentials and try again.'
            : 'Failed to create account. Please try again.'
        );
      }
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
                  setPasswordError('');
                  setPassword('');
                  setConfirmPassword('');
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
                  setPasswordError('');
                  setPassword('');
                  setConfirmPassword('');
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
                  autoComplete="username"
                />
                {!isLogin && (
                  <p className="mt-2 text-left text-xs text-gray-500">
                    {USERNAME_VALIDATION.MIN_LENGTH}-{USERNAME_VALIDATION.MAX_LENGTH} characters. Letters, numbers, and {USERNAME_VALIDATION.ALLOWED_SPECIAL_CHARS} allowed. No spaces.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-left text-sm font-medium text-gray-700">
                  {isLogin ? 'Enter your password' : 'Create a password'}
                </label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Enter your password"
                  error={!!passwordError}
                  required
                  disabled={creating}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                {!isLogin && passwordStrength && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Password strength:</span>
                      <span
                        className={`text-xs font-semibold ${
                          passwordStrength.color === 'red'
                            ? 'text-red-600'
                            : passwordStrength.color === 'orange'
                            ? 'text-orange-600'
                            : passwordStrength.color === 'yellow'
                            ? 'text-yellow-600'
                            : passwordStrength.color === 'green'
                            ? 'text-green-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.color === 'red'
                            ? 'bg-red-500'
                            : passwordStrength.color === 'orange'
                            ? 'bg-orange-500'
                            : passwordStrength.color === 'yellow'
                            ? 'bg-yellow-500'
                            : passwordStrength.color === 'green'
                            ? 'bg-green-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                        role="progressbar"
                        aria-valuenow={passwordStrength.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Password strength: ${passwordStrength.label}`}
                      />
                    </div>
                    <p className="mt-2 text-left text-xs text-gray-500">
                      Must contain uppercase, lowercase, number, and special character
                    </p>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-left text-sm font-medium text-gray-700">
                    Confirm your password
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Confirm your password"
                    error={!!passwordError}
                    required
                    disabled={creating}
                    autoComplete="new-password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-2 text-left text-xs text-red-600">
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}

              {(error || passwordError) && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error || passwordError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  creating ||
                  (!isLogin &&
                    (password !== confirmPassword ||
                      (passwordStrength ? passwordStrength.score < 2 : true)))
                }
              >
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
                    setPasswordError('');
                    setPassword('');
                    setConfirmPassword('');
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
                    setPasswordError('');
                    setPassword('');
                    setConfirmPassword('');
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

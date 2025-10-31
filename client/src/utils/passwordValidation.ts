/**
 * Password validation utilities for client-side password strength checking
 * and validation.
 */

export interface PasswordStrength {
  score: number; // 0-4 (very weak to very strong)
  label: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'emerald';
  percentage: number; // 0-100 for progress bar
}

/**
 * Calculates the strength of a password based on various criteria.
 * @param password - The password to evaluate
 * @returns An object containing the password strength score, label, color, and percentage
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;

  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'red',
      percentage: 0,
    };
  }

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; // Has both upper and lowercase
  if (/\d/.test(password)) score++; // Has numbers
  if (/[^a-zA-Z0-9]/.test(password)) score++; // Has special characters

  // Cap score at 4
  score = Math.min(score, 4);

  // Map score to label, color, and percentage
  const strengthMap: Record<number, Omit<PasswordStrength, 'score'>> = {
    0: { label: 'Very Weak', color: 'red', percentage: 20 },
    1: { label: 'Weak', color: 'orange', percentage: 40 },
    2: { label: 'Fair', color: 'yellow', percentage: 60 },
    3: { label: 'Good', color: 'green', percentage: 80 },
    4: { label: 'Strong', color: 'emerald', percentage: 100 },
  };

  return {
    score,
    ...strengthMap[score],
  };
};

/**
 * Validates a password against the application's password requirements.
 * @param password - The password to validate
 * @returns An error message if validation fails, or null if valid
 */
export const validatePassword = (password: string): string | null => {
  if (!password || password.length === 0) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (password.length > 128) {
    return 'Password must not exceed 128 characters';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  return null; // Valid
};

/**
 * Validates that two passwords match.
 * @param password - The original password
 * @param confirmPassword - The confirmation password to match against
 * @returns An error message if passwords don't match, or null if they match
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword || confirmPassword.length === 0) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null; // Valid
};

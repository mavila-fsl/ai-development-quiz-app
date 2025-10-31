import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { ERROR_MESSAGES } from '@ai-quiz-app/shared';

/**
 * Rate limiter for login attempts based on IP address
 * Limits each IP to 5 login attempts per 15 minutes
 * First line of defense against distributed brute-force attacks
 */
export const ipLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 requests per windowMs per IP
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests against the limit
});

/**
 * Rate limiter for login attempts based on username
 * Limits each username to 5 login attempts per 15 minutes
 * Prevents targeted brute-force attacks on specific accounts
 * This is critical because attackers can bypass IP limits by using multiple IPs
 */
export const usernameLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 requests per windowMs per username
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  // Use username from request body as the key
  keyGenerator: (req: Request): string => {
    // Extract username from request body for rate limiting
    const username = req.body?.username;
    if (!username) {
      // If no username provided, fall back to IP (shouldn't happen due to validation)
      return req.ip || 'unknown';
    }
    // Use username as the key to track attempts per account
    return `username:${username}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Legacy export for backward compatibility
 * @deprecated Use ipLoginRateLimiter and usernameLoginRateLimiter together
 */
export const loginRateLimiter = ipLoginRateLimiter;

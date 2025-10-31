import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import { ERROR_MESSAGES } from '@ai-quiz-app/shared';
import { prisma } from '@ai-quiz-app/database';

const JWT_SECRET = env.jwtSecret || '';
const JWT_EXPIRATION = '7d'; // 7 days

interface JwtPayload {
  userId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Generates a JWT token for a user
 * @param userId - The user's unique identifier
 * @param tokenVersion - The user's current token version for session invalidation
 * @returns A signed JWT token valid for 7 days
 */
export const generateToken = (userId: string, tokenVersion: number): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ userId, tokenVersion }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
};

/**
 * Verifies and decodes a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded payload with userId and tokenVersion, or null if invalid
 */
export const verifyToken = (token: string): { userId: string; tokenVersion: number } | null => {
  try {
    if (!JWT_SECRET) {
      // Critical configuration error - log and throw
      console.error('CRITICAL: JWT_SECRET is not configured');
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return { userId: decoded.userId, tokenVersion: decoded.tokenVersion };
  } catch (error) {
    // Log the error for debugging (but don't expose to client)
    if (error instanceof Error && error.message === 'JWT_SECRET is not configured') {
      // Re-throw configuration errors
      throw error;
    }
    // Return null for invalid tokens (expected behavior)
    return null;
  }
};

/**
 * Express middleware that protects routes by verifying JWT tokens from cookies
 * Attaches userId to the request object if token is valid
 * Also validates tokenVersion to enable session invalidation
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from cookies
    const token = req.cookies?.authToken;

    if (!token) {
      throw new AppError(401, ERROR_MESSAGES.MISSING_AUTH_TOKEN);
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      throw new AppError(401, ERROR_MESSAGES.INVALID_AUTH_TOKEN);
    }

    // Verify tokenVersion against database to check if session is still valid
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { tokenVersion: true },
    });

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      // Token version mismatch means all previous sessions were invalidated
      throw new AppError(401, ERROR_MESSAGES.INVALID_AUTH_TOKEN);
    }

    // Attach userId to request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, ERROR_MESSAGES.INVALID_AUTH_TOKEN));
    }
  }
};

/**
 * Sets an authentication cookie with the JWT token
 * @param res - Express response object
 * @param token - JWT token to set in cookie
 */
export const setAuthCookie = (res: Response, token: string): void => {
  const isProduction = env.nodeEnv === 'production';

  res.cookie('authToken', token, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: isProduction, // Only use secure cookies in production (HTTPS only)
    sameSite: isProduction ? 'strict' : 'lax', // Strict in production for CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/api', // Restrict cookie to API routes only
  });
};

/**
 * Clears the authentication cookie
 * @param res - Express response object
 */
export const clearAuthCookie = (res: Response): void => {
  const isProduction = env.nodeEnv === 'production';

  // Must match the options used when setting the cookie
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/api',
  });
};

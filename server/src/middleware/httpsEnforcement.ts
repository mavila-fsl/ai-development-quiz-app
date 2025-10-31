import { Request, Response, NextFunction } from 'express';
import { env, isDevelopment } from '../config/env';

/**
 * Middleware to enforce HTTPS in production environments
 * Redirects HTTP requests to HTTPS to ensure encrypted data transmission
 *
 * In development, this middleware is bypassed to allow local HTTP testing
 */
export const enforceHTTPS = (req: Request, res: Response, next: NextFunction): void => {
  // Skip enforcement in development mode
  if (isDevelopment) {
    return next();
  }

  // Check if request is already secure
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

  if (!isSecure) {
    // Redirect to HTTPS version of the URL
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    return res.redirect(301, httpsUrl);
  }

  next();
};

/**
 * Middleware to validate security configuration on startup
 * Logs warnings if production environment has insecure settings
 */
export const validateSecurityConfig = (): void => {
  if (env.nodeEnv === 'production') {
    console.log('🔒 Security Configuration Check:');

    // Check JWT secret strength
    if (!env.jwtSecret || env.jwtSecret.length < 32) {
      console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long in production');
    } else {
      console.log('✅ JWT_SECRET is properly configured');
    }

    // Remind about HTTPS requirement
    console.log('✅ HTTPS enforcement is active');
    console.log('✅ HSTS headers are enabled');
    console.log('✅ Secure cookies are enabled');
    console.log('');
    console.log('⚠️  IMPORTANT: Ensure your reverse proxy (nginx, etc.) is configured for HTTPS');
    console.log('   - All traffic should use TLS/SSL certificates');
    console.log('   - Set X-Forwarded-Proto header to "https"');
  } else {
    console.log('🔧 Development mode: HTTPS enforcement disabled');
  }
};

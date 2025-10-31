import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env, isDevelopment } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { enforceHTTPS, validateSecurityConfig } from './middleware/httpsEnforcement';
import prisma from './config/database';

const app = express();

// Security Middleware
// Enforce HTTPS in production (must be before other middleware)
app.use(enforceHTTPS);

// Enhanced Helmet configuration with HSTS
app.use(
  helmet({
    // HTTP Strict Transport Security - forces HTTPS for 1 year
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for development
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (isDevelopment) {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Check for required environment variables
    if (!env.jwtSecret) {
      console.error('❌ JWT_SECRET is not configured in environment variables');
      console.error('   Please set JWT_SECRET in your .env file');
      process.exit(1);
    }

    // Validate security configuration
    validateSecurityConfig();

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
      console.log(`📍 Environment: ${env.nodeEnv}`);
      console.log(`🌐 API: http://localhost:${env.port}/api`);
      if (isDevelopment) {
        console.log(`🔧 Health check: http://localhost:${env.port}/health`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

// Export the Prisma client as the main database interface
export { default as prisma } from './client';

// Re-export Prisma types for use throughout the application
export type { PrismaClient } from '@prisma/client';

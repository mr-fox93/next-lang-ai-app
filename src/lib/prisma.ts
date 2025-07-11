import { PrismaClient } from '@prisma/client';

// Najlepsze praktyki dla Prisma z Next.js dla uniknięcia wielu instancji w dev
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'], // Only log critical errors, never queries or user data
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 
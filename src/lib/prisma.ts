import { PrismaClient } from '@prisma/client';

// Next.js 환경에서 개발 중 HMR로 인한 다중 인스턴스 생성을 방지하기 위한 싱글톤
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;




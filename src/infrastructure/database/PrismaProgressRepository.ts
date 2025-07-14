import { PrismaClient } from "@prisma/client";
import { ProgressRepository, ProgressData, Progress } from "@/core/interfaces/repositories/ProgressRepository";
import { prisma } from "@/lib/prisma"; // Use secure configured client

export class PrismaProgressRepository implements ProgressRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma; // Use imported secure client instead of new instance
  }

  async createProgress(data: ProgressData): Promise<Progress> {
    return await this.prisma.progress.create({
      data
    });
  }

  async getProgressByFlashcardId(flashcardId: number, userId: string): Promise<Progress | null> {
    return await this.prisma.progress.findFirst({
      where: {
        flashcardId,
        userId
      }
    });
  }

  async updateProgress(flashcardId: number, userId: string, data: Partial<ProgressData>): Promise<Progress> {
    return await this.prisma.progress.update({
      where: {
        flashcardId_userId: {
          flashcardId,
          userId
        }
      },
      data
    });
  }

  async getReviewedTodayCount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.prisma.progress.count({
      where: {
        userId: userId,
        lastReviewed: {
          gte: today,
        },
      },
    });

    return count;
  }
} 
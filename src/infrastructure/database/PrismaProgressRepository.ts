import { PrismaClient } from "@prisma/client";
import { ProgressRepository, ProgressData, Progress } from "@/core/interfaces/repositories/ProgressRepository";

export class PrismaProgressRepository implements ProgressRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
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

  async getUserProgress(userId: string): Promise<Progress[]> {
    return await this.prisma.progress.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        flashcardId: true,
        userId: true,
        correctAnswers: true,
        incorrectAnswers: true,
        lastReviewed: true,
        nextReviewDate: true,
        masteryLevel: true
      }
    });
  }
} 
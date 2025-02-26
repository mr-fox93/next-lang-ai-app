import { PrismaClient } from "@prisma/client";
import { ProgressRepository, ProgressData } from "@/core/interfaces/repositories/ProgressRepository";

export class PrismaProgressRepository implements ProgressRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createProgress(data: ProgressData): Promise<any> {
    return await this.prisma.progress.create({
      data
    });
  }

  async getProgressByFlashcardId(flashcardId: number, userId: string): Promise<any> {
    return await this.prisma.progress.findFirst({
      where: {
        flashcardId,
        userId
      }
    });
  }

  async updateProgress(flashcardId: number, userId: string, data: Partial<ProgressData>): Promise<any> {
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
} 
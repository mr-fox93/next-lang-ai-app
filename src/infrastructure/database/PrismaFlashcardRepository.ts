import { PrismaClient } from "@prisma/client";
import { Flashcard } from "@/core/entities/Flashcard";
import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";

export class PrismaFlashcardRepository implements FlashcardRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getFlashcardsByUserId(userId: string): Promise<Flashcard[]> {
    return await this.prisma.flashcard.findMany({
      where: { 
        userId: userId,
      },
      orderBy: {
        id: 'desc'
      }
    });
  }

  async createFlashcard(flashcard: Omit<Flashcard, "id">): Promise<Flashcard> {
    return await this.prisma.flashcard.create({
      data: flashcard
    });
  }

  async updateFlashcard(id: number, flashcard: Partial<Flashcard>): Promise<Flashcard> {
    return await this.prisma.flashcard.update({
      where: { id },
      data: flashcard
    });
  }

  async deleteFlashcard(id: number): Promise<boolean> {
    await this.prisma.flashcard.delete({
      where: { id }
    });
    return true;
  }
} 
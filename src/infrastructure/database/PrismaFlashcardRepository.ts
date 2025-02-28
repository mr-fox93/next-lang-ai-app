import { PrismaClient } from "@prisma/client";
import { Flashcard } from "@/core/entities/Flashcard";
import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";

export class PrismaFlashcardRepository implements FlashcardRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getFlashcardsByUserId(userId: string): Promise<Flashcard[]> {
    const flashcards = await this.prisma.flashcard.findMany({
      where: {
        userId
      }
    });

    return flashcards;
  }
  
  // Metoda getUserFlashcards jest aliasem dla getFlashcardsByUserId dla zachowania spójności API
  async getUserFlashcards(userId: string): Promise<Flashcard[]> {
    return this.getFlashcardsByUserId(userId);
  }

  async createFlashcard(flashcard: Omit<Flashcard, "id">): Promise<Flashcard> {
    return await this.prisma.flashcard.create({
      data: flashcard
    });
  }
  
  async createFlashcards(flashcards: Omit<Flashcard, "id" | "userId">[], userId: string): Promise<Flashcard[]> {
    const createdFlashcards = [];
    
    for (const flashcard of flashcards) {
      const created = await this.prisma.flashcard.create({
        data: {
          ...flashcard,
          userId
        }
      });
      
      createdFlashcards.push(created);
    }
    
    return createdFlashcards;
  }

  async updateFlashcard(id: number, flashcard: Partial<Flashcard>): Promise<Flashcard> {
    return await this.prisma.flashcard.update({
      where: { id },
      data: flashcard
    });
  }

  async deleteFlashcard(id: number): Promise<boolean> {
    try {
      await this.prisma.flashcard.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
  
  async deleteFlashcardsByCategory(userId: string, category: string): Promise<number> {
    try {
      const result = await this.prisma.flashcard.deleteMany({
        where: {
          userId,
          category
        }
      });
      
      return result.count;
    } catch (error) {
      console.error("Błąd podczas usuwania fiszek z kategorii:", error);
      return 0;
    }
  }
} 
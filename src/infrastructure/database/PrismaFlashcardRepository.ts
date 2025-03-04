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
    const { 
      origin_text, 
      translate_text, 
      example_using, 
      translate_example, 
      category, 
      userId, 
      sourceLanguage, 
      targetLanguage, 
      difficultyLevel 
    } = flashcard;

    return await this.prisma.flashcard.create({
      data: {
        origin_text,
        translate_text,
        example_using,
        translate_example,
        category,
        userId,
        sourceLanguage,
        targetLanguage,
        difficultyLevel
      }
    });
  }
  
  async createFlashcards(flashcards: Omit<Flashcard, "id" | "userId">[], userId: string): Promise<Flashcard[]> {
    const createdFlashcards = [];
    
    for (const flashcard of flashcards) {
      const { 
        origin_text, 
        translate_text, 
        example_using, 
        translate_example, 
        category, 
        sourceLanguage, 
        targetLanguage, 
        difficultyLevel 
      } = flashcard;

      const created = await this.prisma.flashcard.create({
        data: {
          origin_text,
          translate_text,
          example_using,
          translate_example,
          category,
          userId,
          sourceLanguage,
          targetLanguage,
          difficultyLevel
        }
      });
      
      createdFlashcards.push(created);
    }
    
    return createdFlashcards;
  }

  async updateFlashcard(id: number, flashcard: Partial<Flashcard>): Promise<Flashcard> {
    // Zapewniamy, że pola są poprawnie przekazane
    const updateData: any = {};
    
    if (flashcard.origin_text !== undefined) updateData.origin_text = flashcard.origin_text;
    if (flashcard.translate_text !== undefined) updateData.translate_text = flashcard.translate_text;
    if (flashcard.example_using !== undefined) updateData.example_using = flashcard.example_using;
    if (flashcard.translate_example !== undefined) updateData.translate_example = flashcard.translate_example;
    if (flashcard.category !== undefined) updateData.category = flashcard.category;
    if (flashcard.sourceLanguage !== undefined) updateData.sourceLanguage = flashcard.sourceLanguage;
    if (flashcard.targetLanguage !== undefined) updateData.targetLanguage = flashcard.targetLanguage;
    if (flashcard.difficultyLevel !== undefined) updateData.difficultyLevel = flashcard.difficultyLevel;
    
    return await this.prisma.flashcard.update({
      where: { id },
      data: updateData
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
import { PrismaClient, Prisma } from "@prisma/client";
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
  
  async updateFlashcard(id: number, flashcard: Partial<Flashcard>): Promise<Flashcard> {
    const updateData: Partial<Prisma.FlashcardUpdateInput> = {};
    
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
      console.error("Category deletion database error:", error);
      return 0;
    }
  }
  
  async getUserTargetLanguages(userId: string): Promise<string[]> {
    try {
      const languages = await this.prisma.flashcard.findMany({
        where: { userId },
        select: { targetLanguage: true },
        distinct: ['targetLanguage']
      });
      
      return languages.map(lang => lang.targetLanguage);
    } catch (error) {
      console.error("Get user languages database error:", error);
      return [];
    }
  }
} 
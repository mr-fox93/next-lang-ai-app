import { PrismaClient, Prisma } from "@prisma/client";
import { Flashcard } from "@/core/entities/Flashcard";
import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";
import { CategoryProgress } from "@/types/progress";

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
  
  async getUserFlashcardStats(userId: string): Promise<{
    totalFlashcards: number;
    masteredFlashcards: number;
    inProgressFlashcards: number;
    untouchedFlashcards: number;
    categories: CategoryProgress[];
  }> {
    try {
      // 1. Pobierz ogólne liczby fiszek z różnymi poziomami
      type StatsResult = {
        total: bigint;
        mastered: bigint;
        in_progress: bigint;
        untouched: bigint;
      }[];

      const overallStats = await this.prisma.$queryRaw<StatsResult>`
        SELECT
          COUNT(f.id) as total,
          COUNT(CASE WHEN p."masteryLevel" >= 4 THEN 1 END) as mastered,
          COUNT(CASE WHEN p."masteryLevel" BETWEEN 1 AND 3 THEN 1 END) as in_progress,
          COUNT(CASE WHEN p."masteryLevel" IS NULL OR p."masteryLevel" = 0 THEN 1 END) as untouched
        FROM "Flashcard" f
        LEFT JOIN "Progress" p ON f.id = p."flashcardId" AND p."userId" = ${userId}
        WHERE f."userId" = ${userId}
      `;

      // 2. Pobierz statystyki dla każdej kategorii
      type CategoryStatsResult = {
        category: string;
        total: bigint;
        mastered: bigint;
        in_progress: bigint;
        untouched: bigint;
        avg_mastery: number;
      }[];

      const categoryStats = await this.prisma.$queryRaw<CategoryStatsResult>`
        SELECT
          f.category,
          COUNT(f.id) as total,
          COUNT(CASE WHEN p."masteryLevel" >= 4 THEN 1 END) as mastered,
          COUNT(CASE WHEN p."masteryLevel" BETWEEN 1 AND 3 THEN 1 END) as in_progress,
          COUNT(CASE WHEN p."masteryLevel" IS NULL OR p."masteryLevel" = 0 THEN 1 END) as untouched,
          COALESCE(AVG(p."masteryLevel"), 0)::float as avg_mastery
        FROM "Flashcard" f
        LEFT JOIN "Progress" p ON f.id = p."flashcardId" AND p."userId" = ${userId}
        WHERE f."userId" = ${userId}
        GROUP BY f.category
        ORDER BY f.category
      `;

      // 3. Formatuj dane wyjściowe
      const categories: CategoryProgress[] = categoryStats.map(cat => ({
        name: cat.category,
        total: Number(cat.total),
        mastered: Number(cat.mastered),
        inProgress: Number(cat.in_progress),
        untouched: Number(cat.untouched),
        averageMasteryLevel: cat.avg_mastery
      }));

      return {
        totalFlashcards: Number(overallStats[0]?.total || 0),
        masteredFlashcards: Number(overallStats[0]?.mastered || 0),
        inProgressFlashcards: Number(overallStats[0]?.in_progress || 0),
        untouchedFlashcards: Number(overallStats[0]?.untouched || 0),
        categories
      };
    } catch (error) {
      console.error("Error fetching flashcard stats:", error);
      // Zwróć dane domyślne w przypadku błędu
      return {
        totalFlashcards: 0,
        masteredFlashcards: 0,
        inProgressFlashcards: 0,
        untouchedFlashcards: 0,
        categories: []
      };
    }
  }
} 
import { PrismaClient } from "@prisma/client";
import { FavoriteRepository, Favorite, FavoriteDetails } from "@/core/interfaces/repositories/FavoriteRepository";
import { prisma } from "@/lib/prisma";
import { Flashcard } from "@/core/entities/Flashcard";

export class PrismaFavoriteRepository implements FavoriteRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async addFavorite(userId: string, flashcardId: number): Promise<Favorite> {
    return await this.prisma.favorite.upsert({
      where: {
        userId_flashcardId: {
          userId,
          flashcardId
        }
      },
      update: {},
      create: {
        userId,
        flashcardId
      }
    });
  }

  async removeFavorite(userId: string, flashcardId: number): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: {
        userId,
        flashcardId
      }
    });
  }

  async getFavoritesByUserId(userId: string): Promise<FavoriteDetails[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId
      },
      include: {
        flashcard: {
          include: {
            progress: {
              where: { userId }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return favorites.map((favorite) => {
      const { progress, ...flashcard } = favorite.flashcard;

      return {
        id: favorite.id,
        userId: favorite.userId,
        flashcardId: favorite.flashcardId,
        createdAt: favorite.createdAt,
        flashcard: {
          ...flashcard,
          translate_category: flashcard.translate_category || flashcard.category
        } as Flashcard,
        progress: progress[0] || null
      };
    });
  }
}

import { PrismaClient } from "@prisma/client";
import { UserRepository, User, UserPreferences } from "@/core/interfaces/repositories/UserRepository";

export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username || undefined,
      email: user.email || undefined,
      preferences: {
        theme: user.preferredLanguage || undefined,
        notifications: true
      }
    };
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return null;

    return {
      theme: user.preferredLanguage || undefined,
      notifications: true
    };
  }
} 
import { PrismaClient } from "@prisma/client";
import { UserRepository, UserData } from "@/core/interfaces/repositories/UserRepository";

export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async upsertUser(userData: UserData): Promise<any> {
    return await this.prisma.user.upsert({
      where: { id: userData.id },
      update: {
        email: userData.email,
        preferredLanguage: userData.preferredLanguage
      },
      create: {
        id: userData.id,
        email: userData.email,
        preferredLanguage: userData.preferredLanguage || "pl"
      }
    });
  }

  async getUserById(id: string): Promise<any> {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  }
} 
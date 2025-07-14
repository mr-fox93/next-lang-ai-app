/**
 * User Management Service
 * Centralizes logic for user creation and management
 * Used across flashcard generation and authentication flows
 */

import { UserRepository } from "@/core/interfaces/repositories/UserRepository";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface UserManagementService {
  upsertUser(userId: string, userEmail: string, additionalData?: Partial<UserData>): Promise<void>;
  ensureUserExists(userId: string, userEmail: string, additionalData?: Partial<UserData>): Promise<boolean>;
}

export interface UserData {
  username: string;
  email: string;
  dailyGoal?: number;
}

export class UserManagementServiceImpl implements UserManagementService {
  private prisma: PrismaClient;

  constructor(private userRepository: UserRepository) {
    this.prisma = prisma;
  }

  /**
   * Create user if doesn't exist, throw error on failure
   * Used in critical flows where user existence is required
   */
  async upsertUser(userId: string, userEmail: string, additionalData?: Partial<UserData>): Promise<void> {
    const existingUser = await this.userRepository.getUserById(userId);

    if (!existingUser) {
      try {
        await this.prisma.user.create({
          data: {
            id: userId,
            email: userEmail,
            username: additionalData?.username || userEmail.split('@')[0] || "User",
            dailyGoal: additionalData?.dailyGoal || 10,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error("User creation error:", error);
        throw new Error(
          `Failed to create user: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`
        );
      }
    }
  }

  /**
   * Ensure user exists, return boolean indicating success
   * Used in non-critical flows where we can handle failure gracefully
   */
  async ensureUserExists(userId: string, userEmail: string, additionalData?: Partial<UserData>): Promise<boolean> {
    try {
      const existingUser = await this.userRepository.getUserById(userId);

      if (!existingUser) {
        await this.prisma.user.create({
          data: {
            id: userId,
            email: userEmail,
            username: additionalData?.username || userEmail.split('@')[0] || "User",
            dailyGoal: additionalData?.dailyGoal || 10,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring user exists:", error);
      return false;
    }
  }
}

// Factory function for DI container
export const createUserManagementService = (userRepository: UserRepository): UserManagementService => {
  return new UserManagementServiceImpl(userRepository);
}; 
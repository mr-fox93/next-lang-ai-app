import { PrismaFlashcardRepository } from "@/infrastructure/database/PrismaFlashcardRepository";
import { PrismaProgressRepository } from "@/infrastructure/database/PrismaProgressRepository";
import { PrismaUserRepository } from "@/infrastructure/database/PrismaUserRepository";
import { GetUserFlashcardsUseCase } from "@/core/useCases/flashcards/GetUserFlashcards";
import { GenerateFlashcardsUseCase } from "@/core/useCases/flashcards/GenerateFlashcards";
import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";
import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";
import { UserRepository } from "@/core/interfaces/repositories/UserRepository";

// Prosty kontener DI
class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    // Inicjalizacja repozytoriów
    this.services.set('FlashcardRepository', new PrismaFlashcardRepository());
    this.services.set('ProgressRepository', new PrismaProgressRepository());
    this.services.set('UserRepository', new PrismaUserRepository());
    
    // Inicjalizacja przypadków użycia
    this.services.set(
      'GetUserFlashcardsUseCase', 
      new GetUserFlashcardsUseCase(this.get('FlashcardRepository'))
    );
    
    this.services.set(
      'GenerateFlashcardsUseCase',
      new GenerateFlashcardsUseCase(
        this.get('FlashcardRepository'),
        this.get('ProgressRepository'),
        this.get('UserRepository')
      )
    );
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  get<T>(serviceName: string): T {
    if (!this.services.has(serviceName)) {
      throw new Error(`Service ${serviceName} not found in container`);
    }
    return this.services.get(serviceName);
  }
}

export const container = Container.getInstance();

// Eksportowane helpery
export const getFlashcardRepository = (): FlashcardRepository => 
  container.get('FlashcardRepository');

export const getProgressRepository = (): ProgressRepository =>
  container.get('ProgressRepository');

export const getUserRepository = (): UserRepository =>
  container.get('UserRepository');

export const getUserFlashcardsUseCase = (): GetUserFlashcardsUseCase => 
  container.get('GetUserFlashcardsUseCase');
  
export const getGenerateFlashcardsUseCase = (): GenerateFlashcardsUseCase =>
  container.get('GenerateFlashcardsUseCase'); 
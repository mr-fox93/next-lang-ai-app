import { PrismaFlashcardRepository } from "@/infrastructure/database/PrismaFlashcardRepository";
import { PrismaProgressRepository } from "@/infrastructure/database/PrismaProgressRepository";
import { PrismaUserRepository } from "@/infrastructure/database/PrismaUserRepository";
import { LocalStorageDemoProgressRepository } from "@/infrastructure/repositories/LocalStorageDemoProgressRepository";
import { GetUserFlashcardsUseCase } from "@/core/useCases/flashcards/GetUserFlashcards";
import { GenerateFlashcardsUseCase } from "@/core/useCases/flashcards/GenerateFlashcards";
import { UpdateFlashcardProgressUseCase } from "@/core/useCases/flashcards/UpdateFlashcardProgress";
import { GetUserProgressStatsUseCase } from "@/core/useCases/progress/GetUserProgressStats";
import { GetDemoFlashcards } from "@/core/useCases/demo/GetDemoFlashcards";
import { UpdateDemoProgress } from "@/core/useCases/demo/UpdateDemoProgress";
import { GetDemoProgress, ClearDemoProgress } from "@/core/useCases/demo/GetDemoProgress";
import { FlashcardRepository } from "@/core/interfaces/repositories/FlashcardRepository";
import { ProgressRepository } from "@/core/interfaces/repositories/ProgressRepository";
import { UserRepository } from "@/core/interfaces/repositories/UserRepository";
import { DemoProgressRepository } from "@/core/interfaces/repositories/DemoProgressRepository";

// Prosty kontener DI z lazy initialization
class Container {
  private static instance: Container;
  private services: Map<string, unknown> = new Map();
  private factories: Map<string, () => unknown> = new Map();

  private constructor() {
    // Zarejestruj fabryki dla repozytoriów
    this.factories.set('FlashcardRepository', () => new PrismaFlashcardRepository());
    this.factories.set('ProgressRepository', () => new PrismaProgressRepository());
    this.factories.set('UserRepository', () => new PrismaUserRepository());
    this.factories.set('DemoProgressRepository', () => new LocalStorageDemoProgressRepository());
    
    // Zarejestruj fabryki dla przypadków użycia
    this.factories.set('GetUserFlashcardsUseCase', () => 
      new GetUserFlashcardsUseCase(this.get('FlashcardRepository'))
    );
    
    this.factories.set('GenerateFlashcardsUseCase', () =>
      new GenerateFlashcardsUseCase(
        this.get('FlashcardRepository'),
        this.get('ProgressRepository'),
        this.get('UserRepository')
      )
    );
    
    this.factories.set('UpdateFlashcardProgressUseCase', () =>
      new UpdateFlashcardProgressUseCase(
        this.get('ProgressRepository')
      )
    );
    
    this.factories.set('GetUserProgressStatsUseCase', () =>
      new GetUserProgressStatsUseCase(
        this.get('FlashcardRepository'),
        this.get('ProgressRepository')
      )
    );

    // Demo Use Cases
    this.factories.set('GetDemoFlashcards', () =>
      new GetDemoFlashcards(this.get('GetUserFlashcardsUseCase'))
    );

    this.factories.set('UpdateDemoProgress', () =>
      new UpdateDemoProgress(this.get('DemoProgressRepository'))
    );

    this.factories.set('GetDemoProgress', () =>
      new GetDemoProgress(this.get('DemoProgressRepository'))
    );

    this.factories.set('ClearDemoProgress', () =>
      new ClearDemoProgress(this.get('DemoProgressRepository'))
    );
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  get<T>(serviceName: string): T {
    // Sprawdź czy serwis już istnieje w cache
    if (this.services.has(serviceName)) {
      return this.services.get(serviceName) as T;
    }

    // Jeśli nie, sprawdź czy mamy fabrykę
    if (!this.factories.has(serviceName)) {
      throw new Error(`Service ${serviceName} not found in container`);
    }

    // Utwórz serwis za pomocą fabryki
    const factory = this.factories.get(serviceName)!;
    const service = factory();
    
    // Zapisz w cache dla przyszłych użyć
    this.services.set(serviceName, service);
    
    return service as T;
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

export const getDemoProgressRepository = (): DemoProgressRepository =>
  container.get('DemoProgressRepository');

export const getUserFlashcardsUseCase = (): GetUserFlashcardsUseCase => 
  container.get('GetUserFlashcardsUseCase');
  
export const getGenerateFlashcardsUseCase = (): GenerateFlashcardsUseCase =>
  container.get('GenerateFlashcardsUseCase');
  
export const getUpdateFlashcardProgressUseCase = (): UpdateFlashcardProgressUseCase =>
  container.get('UpdateFlashcardProgressUseCase'); 
  
export const getUserProgressStatsUseCase = (): GetUserProgressStatsUseCase =>
  container.get('GetUserProgressStatsUseCase'); 

// Demo Use Case helpers
export const getDemoFlashcardsUseCase = (): GetDemoFlashcards =>
  container.get('GetDemoFlashcards');

export const getUpdateDemoProgressUseCase = (): UpdateDemoProgress =>
  container.get('UpdateDemoProgress');

export const getDemoProgressUseCase = (): GetDemoProgress =>
  container.get('GetDemoProgress');

export const getClearDemoProgressUseCase = (): ClearDemoProgress =>
  container.get('ClearDemoProgress'); 
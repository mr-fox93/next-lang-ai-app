import { UserProgressStats } from './progress';

export type SidebarVariant = "authenticated" | "demo" | "guest";

export type TopBarVariant = "authenticated" | "demo" | "guest";

export type CookieConsent = {
  necessary: boolean;
  accepted: boolean;
};

export interface CookieConsentContextType {
  openBanner: () => void;
  consent: CookieConsent | null;
}

export interface TopBarProps {
  variant?: TopBarVariant;
  onMobileSidebarToggle?: () => void;
  onExitDemo?: () => void;
  onImportAndSignIn?: () => void;
  isImporting?: boolean;
  progressStats?: {
    success: boolean;
    data?: UserProgressStats;
    error?: string;
  };
  onProgressClick?: () => void;
}

export interface LanguageSettings {
  sourceLanguage: string;
  targetLanguage: string;
  difficultyLevel: string;
} 
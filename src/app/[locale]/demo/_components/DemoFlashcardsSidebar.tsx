"use client";

import { FlashcardsSidebar } from "@/components/flashcards-sidebar";
import { Flashcard } from "@/core/entities/Flashcard";

interface DemoFlashcardsSidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  flashcards: Flashcard[];
  onNewFlashcardsClick: () => void;
  onDeleteCategoryClick: () => void;
  onGenerateMoreClick: () => void;
}

export function DemoFlashcardsSidebar({
  selectedCategory,
  onSelectCategory,
  isCollapsed,
  onToggleCollapse,
  flashcards,
  onNewFlashcardsClick,
  onDeleteCategoryClick,
  onGenerateMoreClick,
}: DemoFlashcardsSidebarProps) {
  // Empty handlers for demo mode - FlashcardsSidebar handles filtering internally
  const handleLanguageSelectClick = () => {
    // Language filtering works directly in FlashcardsSidebar for demo mode
  };

  const handleLearningFilterClick = () => {
    // Learning filtering works directly in FlashcardsSidebar for demo mode
  };

  return (
    <FlashcardsSidebar
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      flashcards={flashcards}
      isGuestMode={true}
      isDemoMode={true}
      onLanguageSelectClick={handleLanguageSelectClick}
      onNewFlashcardsClick={onNewFlashcardsClick}
      onLearningFilterClick={handleLearningFilterClick}
      onFlashcardsUpdate={() => {}}
      onDeleteCategoryClick={onDeleteCategoryClick}
      onGenerateMoreClick={onGenerateMoreClick}
    />
  );
} 
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Grid, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardView } from "@/components/flaschard-view";
import { FlashcardGrid } from "@/components/flashcard-grid";
import { FlashcardsSidebar } from "@/components/flashcards-sidebar";
import { markFlashcardProgress } from "@/app/actions/flashcards";
import type { FlashCard } from "@/lib/flashcard.schema";

interface FlashcardsClientProps {
  initialFlashcards: FlashCard[];
}

export function FlashcardsClient({ initialFlashcards }: FlashcardsClientProps) {
  const [flashcards] = useState<FlashCard[]>(initialFlashcards);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");

  const handleNext = async (known: boolean) => {
    if (currentCard) {
      await markFlashcardProgress(currentCard.id, known);
      setCurrentCardIndex((prev) => (prev + 1) % categoryCards.length);
    }
  };

  const categoryCards = selectedCategory
    ? flashcards.filter((card) => card.category === selectedCategory)
    : flashcards;

  const currentCard = categoryCards[currentCardIndex] ?? null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 text-white"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div
        className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          md:relative md:transform-none
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <FlashcardsSidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => {
            setSelectedCategory(category);
            setIsMobileSidebarOpen(false);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          flashcards={flashcards}
        />
      </div>

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-4 sm:p-8 pt-20 md:pt-8 relative">
        {selectedCategory || flashcards.length > 0 ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-white hover:bg-purple-500/20 transition-colors ${
                    viewMode === "single" ? "bg-purple-500/20" : ""
                  }`}
                  onClick={() => setViewMode("single")}
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-white hover:bg-purple-500/20 transition-colors ${
                    viewMode === "grid" ? "bg-purple-500/20" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {viewMode === "single" ? (
                  currentCard ? (
                    <FlashcardView 
                      card={currentCard} 
                      onNext={handleNext} 
                      allFlashcards={flashcards} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                      <p className="text-gray-400">
                        Brak fiszek w tej kategorii.
                      </p>
                    </div>
                  )
                ) : (
                  <FlashcardGrid cards={categoryCards} />
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
            <p className="text-gray-400">
              Brak dostępnych fiszek. Utwórz nowe fiszki, aby rozpocząć naukę.
            </p>
          </div>
        )}
      </main>
    </>
  );
} 
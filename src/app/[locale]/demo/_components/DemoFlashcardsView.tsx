"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Grid, Maximize2, PanelLeftOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardView } from "@/components/flaschard-view";
import { FlashcardGrid } from "@/components/flashcard-grid";
import { ProgressPreview } from "@/components/progress-preview";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorMessage } from "@/shared/ui/error-message";
import { LoginPromptPopup } from "@/components/login-prompt-popup";
import { toast } from "@/components/ui/use-toast";

import { DemoFlashcardsViewProps } from "@/shared/types/demo";
import { DemoModeIndicator } from "./DemoModeIndicator";
import { DemoFlashcardsSidebar } from "./DemoFlashcardsSidebar";
import { useDemoProgress } from "@/shared/hooks/useDemoProgress";

export default function DemoFlashcardsView({
  initialFlashcards,
  serverError,
  initialCategory,
  progressStats,
}: DemoFlashcardsViewProps) {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const router = useRouter();
  const { updateProgress, getProgressStats } = useDemoProgress();

  const [flashcards] = useState(initialFlashcards);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryFromUrl ? decodeURIComponent(categoryFromUrl) : initialCategory || null
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");
  const [error] = useState<string | null>(serverError || null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  const [localProgressStats, setLocalProgressStats] = useState(progressStats?.data);

  // Auto-select first category
  useEffect(() => {
    if (flashcards.length > 0 && !selectedCategory && !categoryFromUrl) {
      const categories = [...new Set(flashcards.map((card) => card.category))];
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [flashcards, selectedCategory, categoryFromUrl]);

  // Reset card index when category changes
  useEffect(() => {
    setCurrentCardIndex(0);
  }, [selectedCategory]);

  // Update URL with category
  useEffect(() => {
    if (selectedCategory) {
      const params = new URLSearchParams(window.location.search);
      params.set("category", selectedCategory);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, "", newUrl);
    }
  }, [selectedCategory]);

  // Update local progress stats
  useEffect(() => {
    if (flashcards.length > 0) {
      const updateLocalStats = async () => {
        const flashcardIds = flashcards.map(card => card.id);
        const stats = await getProgressStats(flashcardIds);
        
        setLocalProgressStats({
          totalFlashcards: stats.totalFlashcards,
          masteredFlashcards: stats.masteredFlashcards,
          inProgressFlashcards: stats.inProgressFlashcards,
          untouchedFlashcards: stats.untouchedFlashcards,
          categories: [],
          userLevel: 1,
          experiencePoints: 0,
          nextLevelPoints: 100,
          dailyGoal: 5,
        });
      };

      updateLocalStats();
    }
  }, [flashcards, getProgressStats]);

  // Filter by category only (let FlashcardsSidebar handle language filtering internally)
  const categoryCards = selectedCategory
    ? flashcards.filter((card) => card.category === selectedCategory)
    : [];
    
  const currentCard = categoryCards[currentCardIndex];

  const handleNext = async (known: boolean) => {
    if (currentCard) {
      try {
        await updateProgress(currentCard.id, known);
        
        // Refresh local stats
        const flashcardIds = flashcards.map(card => card.id);
        const newStats = await getProgressStats(flashcardIds);
        
        setLocalProgressStats(prev => prev ? {
          ...prev,
          masteredFlashcards: newStats.masteredFlashcards,
          inProgressFlashcards: newStats.inProgressFlashcards,
          untouchedFlashcards: newStats.untouchedFlashcards,
        } : undefined);

        toast({
          title: known ? "Correct!" : "Keep practicing",
          description: `Progress updated!`,
          variant: known ? "success" : "destructive",
          duration: 1000,
        });
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }

    setCurrentCardIndex((prev) => (prev + 1) % categoryCards.length);
  };

  const handleProgressClick = () => {
    const currentPath = window.location.pathname;
    const locale = currentPath.split('/')[1] || 'en';
    router.push(`/${locale}/demo/progress`);
  };

  const showLoginPromptWithMessage = (message: string) => {
    setLoginPromptMessage(message);
    setShowLoginPrompt(true);
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Demo Flashcards Available</h2>
          <p className="text-gray-400 mb-6">
            Sorry, we could not load the demo flashcards. Please try again later.
          </p>
          <Button onClick={() => router.push("/")} className="bg-purple-600 hover:bg-purple-700">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Main content container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          md:relative md:transform-none
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        >
          <DemoFlashcardsSidebar
            selectedCategory={selectedCategory}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setIsMobileSidebarOpen(false);
            }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            flashcards={flashcards}
            onNewFlashcardsClick={() => showLoginPromptWithMessage(
              "Sign in to create your own flashcards! This is just a demo with sample flashcards."
            )}
            onDeleteCategoryClick={() => showLoginPromptWithMessage(
              "Sign in to delete categories! This demo uses a fixed set of sample flashcards."
            )}
            onGenerateMoreClick={() => showLoginPromptWithMessage(
              "Sign in to generate more flashcards! This demo uses a fixed set of sample flashcards."
            )}
          />
        </div>

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </Button>
              
              <DemoModeIndicator />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* View mode toggle - moved here from header */}
            <div className="flex justify-center mt-2 mb-1 flex-shrink-0">
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

            {/* Flashcard content area */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-hidden"
                >
                  {viewMode === "single" ? (
                    currentCard ? (
                      <FlashcardView
                        card={currentCard}
                        onNext={handleNext}
                        allFlashcards={flashcards}
                        isGuestMode={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">
                          No flashcards available for this category.
                        </p>
                      </div>
                    )
                  ) : (
                    <FlashcardGrid
                      cards={categoryCards}
                      onGenerateFlashcards={() => showLoginPromptWithMessage(
                        "Sign in to generate additional flashcards! This demo uses a fixed set of sample flashcards."
                      )}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Fixed progress preview */}
      <ProgressPreview
        progressStats={{
          success: true,
          data: localProgressStats,
        }}
        isGuestMode={true}
        onProgressClick={handleProgressClick}
      />

      <LoginPromptPopup
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message={loginPromptMessage}
      />
    </div>
  );
} 
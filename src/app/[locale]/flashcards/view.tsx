"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flashcard } from "@/core/entities/Flashcard";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks";
import { Grid, Maximize2, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { FlashcardsSidebar } from "@/components/flashcards-sidebar";
import { FlashcardView } from "@/components/flaschard-view";
import { FlashcardGrid } from "@/components/flashcard-grid";
import { TopBar } from "@/components/ui/top-bar";
import { ErrorMessage } from "@/shared/ui/error-message";
import { UserProgressStats } from "@/types/progress";
import { toast } from "@/components/ui/use-toast";
import { generateMoreFlashcardsAction } from "@/app/actions/flashcard-actions";
import { LoginPromptPopup } from "@/components/login-prompt-popup";
import { WelcomeNewUserModal } from "@/components/welcome-new-user-modal";
import { useDemoMode, getMasteredCategoriesFromDemo } from "@/hooks";
import { useTranslations } from "next-intl";

interface FlashcardsViewProps {
  initialFlashcards: Flashcard[];
  serverError?: string | null;
  initialCategory?: string | null;
  progressStats?: {
    success: boolean;
    data?: UserProgressStats;
    error?: string;
  };
  masteredCategories?: string[];
}

export default function FlashcardsView({
  initialFlashcards,
  serverError,
  initialCategory,
  progressStats,
  masteredCategories = [],
}: FlashcardsViewProps) {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryFromUrl
      ? decodeURIComponent(categoryFromUrl)
      : initialCategory || null
  );

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  // Start with collapsed state, will be updated based on screen size
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");
  const [error, setError] = useState<string | null>(serverError || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const router = useRouter();
  const { isDemoMode, exitDemoMode } = useDemoMode();
  const { isSignedIn } = useUser();
  const t = useTranslations('Flashcards');

  // Calculate masteredCategories for demo mode from localStorage
  const calculatedMasteredCategories = isDemoMode && progressStats?.data 
    ? getMasteredCategoriesFromDemo(progressStats.data)
    : masteredCategories;

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsSidebarCollapsed(isMobile);
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (initialFlashcards.length > 0 && !selectedCategory && !categoryFromUrl) {
      const categories = [
        ...new Set(initialFlashcards.map((card) => card.category)),
      ];
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [initialFlashcards, selectedCategory, categoryFromUrl]);

  useEffect(() => {
    setCurrentCardIndex(0);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      const params = new URLSearchParams(window.location.search);
      params.set("category", selectedCategory);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, "", newUrl);
    }
  }, [selectedCategory]);

  // Check if user is new (no flashcards and signed in, not in demo mode)
  useEffect(() => {
    if (isSignedIn && !isDemoMode && initialFlashcards.length === 0) {
      // Check if we've already shown the welcome modal for this session
      const hasShownWelcome = sessionStorage.getItem('hasShownWelcomeModal');
      if (!hasShownWelcome) {
        setShowWelcomeModal(true);
        sessionStorage.setItem('hasShownWelcomeModal', 'true');
      }
    }
  }, [isSignedIn, isDemoMode, initialFlashcards.length]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNext = (known: boolean) => {
    setCurrentCardIndex((prev) => (prev + 1) % categoryCards.length);
  };

  const handleGenerateFlashcards = async (category: string) => {
    // Check if in demo mode and show login prompt
    if (isDemoMode) {
      setLoginPromptMessage("Sign in to generate new flashcards and unlock unlimited access to all features!");
      setShowLoginPrompt(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Zbieramy istniejące fiszki dla tej kategorii
      const existingFlashcards = initialFlashcards.filter(
        (card) => card.category === category
      );

      const targetLanguage = existingFlashcards[0]?.targetLanguage || "en";
      const sourceLanguage = existingFlashcards[0]?.sourceLanguage || "pl";
      const difficultyLevel = existingFlashcards[0]?.difficultyLevel || "easy";

      // Zbieramy istniejące terminy, aby uniknąć duplikatów
      const existingTerms = Array.from(
        new Set(
          existingFlashcards.map((card) => card.origin_text.toLowerCase())
        )
      );

      const result = await generateMoreFlashcardsAction({
        category,
        existingTerms,
        count: 10,
        sourceLanguage,
        targetLanguage,
        difficultyLevel,
      });

      if (result.success) {
        router.refresh();
        toast({
          title: "Flashcards Added",
          description: `Successfully added new flashcards to the "${category}" category.`,
          variant: "success",
          duration: 1000,
        });
      } else {
        setError(result.error || "Failed to generate new flashcards");
        toast({
          title: "Error",
          description: result.error || "Failed to generate new flashcards",
          variant: "destructive",
          duration: 1000,
        });
      }
    } catch (error) {
      console.error("Error generating additional flashcards:", error);
      const errorMessage =
        error instanceof Error
          ? `Flashcard generation failed: ${error.message}`
          : "An unexpected error occurred during flashcard generation";

      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for demo mode actions that should show login prompt
  const handleDemoModeAction = (actionType: string) => {
    let message = "";
    switch (actionType) {
      case "newFlashcards":
        message = "Sign in to create new flashcards and save your progress!";
        break;
      case "generateMore":
        message = "Sign in to generate more flashcards for this category!";
        break;
      case "deleteCategory":
        message = "Sign in to manage your flashcard categories!";
        break;
      default:
        message = "Sign in to unlock all features including saving flashcards, tracking progress, and generating new content!";
    }
    setLoginPromptMessage(message);
    setShowLoginPrompt(true);
  };

  const categoryCards = selectedCategory
    ? initialFlashcards.filter((card) => card.category === selectedCategory)
    : initialFlashcards;

  const currentCard = categoryCards[currentCardIndex] ?? null;

  return (
    <div className="min-h-screen h-screen bg-black text-white flex flex-col overflow-hidden">
      <TopBar 
        variant={isDemoMode ? "demo" : "authenticated"}
        onMobileSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        progressStats={progressStats}
        onExitDemo={() => {
          // Use hook function to exit demo mode
          exitDemoMode();
          router.push("/");
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          md:relative md:transform-none
          ${
            isSidebarCollapsed
              ? "-translate-x-full md:translate-x-0"
              : "translate-x-0"
          }
        `}
        >
          <FlashcardsSidebar
            selectedCategory={selectedCategory}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              // On mobile, collapse sidebar after selecting category
              if (window.innerWidth < 768) {
                setIsSidebarCollapsed(true);
              }
            }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            flashcards={initialFlashcards}
            variant={isDemoMode ? "demo" : "authenticated"}
            masteredCategories={calculatedMasteredCategories}
            onNewFlashcardsClick={isDemoMode ? () => handleDemoModeAction("newFlashcards") : undefined}
            onDemoModeAction={isDemoMode ? handleDemoModeAction : undefined}
            onExitDemo={() => {
              // Use hook function to exit demo mode
              exitDemoMode();
              router.push("/");
            }}
          />
        </div>
        
        {/* Mobile overlay - only show when sidebar is not collapsed on mobile */}
        {!isSidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarCollapsed(true)}
          />
        )}

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <ErrorMessage message={error} onClose={() => setError(null)} />

          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {selectedCategory || initialFlashcards.length > 0 ? (
            <>
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
                          allFlashcards={initialFlashcards}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                          <p className="text-gray-400">
                            {t('noFlashcardsTitle')}
                          </p>
                        </div>
                      )
                    ) : (
                      <FlashcardGrid
                        cards={categoryCards}
                        onGenerateFlashcards={handleGenerateFlashcards}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-12rem)] p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-sm sm:max-w-lg mx-auto px-2 sm:px-4 relative z-10"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 leading-relaxed">
                  {t('noFlashcardsTitle')}
                </h2>

                <div className="flex justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => router.push("/")}
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm sm:text-lg px-4 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg shadow-purple-500/20 font-medium inline-flex items-center justify-center"
                    >
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {t('startLearningButton')}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}
        </main>
      </div>

      {/* Login Prompt Popup */}
      <LoginPromptPopup
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message={loginPromptMessage}
      />

      {/* Welcome Modal */}
      <WelcomeNewUserModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </div>
  );
}

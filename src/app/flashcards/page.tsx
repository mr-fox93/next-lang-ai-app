"use client";

import { useState, useEffect } from "react";
import { FlashcardsSidebar } from "@/components/flashcards-sidebar";
import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, Grid, Maximize2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardView } from "@/components/flaschard-view";
import { FlashcardGrid } from "@/components/flashcard-grid";
import { useFlashcards } from "../context/flashcards-context";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";

export default function FlashcardsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");
  const [isLoading, setIsLoading] = useState(true);

  const { flashcards, setFlashcards } = useFlashcards();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      const fetchFlashcards = async () => {
        setIsLoading(true);
        try {
          console.log("Rozpoczynam pobieranie fiszek...");
          const userId = user?.id;
          const timestamp = new Date().getTime();
          const response = await fetch(`/api/generate-flashcards?userId=${userId}&_=${timestamp}`, {
            method: "GET",
            headers: { 
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0"
            },
            cache: 'no-store'
          });

          if (!response.ok) {
            console.error("Odpowiedź nie jest OK:", response.status, response.statusText);
            throw new Error(`Błąd pobierania fiszek: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log(`Pobrano ${data.flashcards.length} fiszek dla użytkownika ${userId}`);
          
          if (data.flashcards.length > 0) {
            console.log(`Sprawdzam, czy fiszki należą do użytkownika ${userId}`);
          }
          
          setFlashcards(data.flashcards);
          
          if (data.flashcards.length > 0 && !selectedCategory) {
            const categories = [...new Set(data.flashcards.map((card: { category: string }) => card.category))];
            console.log("Dostępne kategorie:", categories);
            if (categories.length > 0) {
              setSelectedCategory(categories[0] as string);
            }
          }
        } catch (error) {
          console.error("Błąd podczas pobierania fiszek:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchFlashcards();
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn, setFlashcards, selectedCategory, user?.id]);

  useEffect(() => {
    setCurrentCardIndex(0);
  }, []);

  const handleNext = (known: boolean) => {
    console.log(
      `Card ${currentCardIndex} marked as ${known ? "known" : "unknown"}`
    );
    setCurrentCardIndex((prev) => (prev + 1) % categoryCards.length);
  };

  const handleSignOut = async () => {
    try {
      console.log("Rozpoczynam proces wylogowania...");
      await signOut();
      console.log("Wylogowanie zakończone, przekierowuję na stronę główną...");
      
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
      router.push("/");
    }
  };

  const categoryCards = selectedCategory
    ? flashcards.filter((card) => card.category === selectedCategory)
    : flashcards;

  const currentCard = categoryCards[currentCardIndex] ?? null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <div className="flex items-center space-x-4">
          {isSignedIn && (
            <>
              <UserButton />
              <span className="text-white font-medium">{user?.fullName}</span>
              <Button
                variant="ghost"
                className="text-white"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex">
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
          ${
            isMobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
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
          />
        </div>
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 sm:p-8 pt-20 md:pt-8 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader />
            </div>
          ) : selectedCategory || flashcards.length > 0 ? (
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
                          No flashcards available for this category.
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
      </div>
    </div>
  );
}

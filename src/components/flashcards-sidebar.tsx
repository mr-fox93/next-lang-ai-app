"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFlashcards } from "@/app/context/flashcards-context";
import Link from "next/link";

interface FlashcardsSidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function FlashcardsSidebar({
  selectedCategory,
  onSelectCategory,
  isCollapsed,
  onToggleCollapse,
}: FlashcardsSidebarProps) {
  const { flashcards } = useFlashcards();

  // Pobierz unikalne kategorie z fiszek
  const categories = [...new Set(flashcards.map((card) => card.category))];

  return (
    <div className="relative h-screen">
      <motion.div
        className={cn(
          "h-full bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col",
          isCollapsed ? "w-[60px]" : "w-[240px]"
        )}
        animate={{ width: isCollapsed ? 60 : 240 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
          {!isCollapsed && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70"
            >
              Categories
            </motion.h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-white hover:bg-purple-500/20 transition-all duration-300 hover:text-purple-400 md:flex ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Przycisk do generowania nowych fiszek - przeniesiony na górę */}
        <div className="p-2 border-b border-white/10">
          <Link href="/" className="block w-full">
            <Button 
              variant="outline" 
              className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group flex items-center justify-center"
            >
              <PlusCircle className="h-4 w-4 mr-2 group-hover:text-purple-300" />
              {!isCollapsed && <span>Nowe fiszki</span>}
            </Button>
          </Link>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start mb-1 relative group overflow-hidden transition-all duration-300",
                    selectedCategory === category
                      ? "bg-purple-500/20 text-white hover:bg-purple-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                  onClick={() => onSelectCategory(category)}
                >
                  <span className="relative z-10">
                    {isCollapsed ? category.charAt(0) : category}
                  </span>
                  {/* Active indicator */}
                  {selectedCategory === category && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500" />
                  )}
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">
                No categories available
              </p>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}

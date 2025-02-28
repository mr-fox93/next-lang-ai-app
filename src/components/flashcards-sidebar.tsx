"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Trash2 
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { Flashcard } from "@/core/entities/Flashcard";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { deleteCategoryAction } from "@/app/actions/flashcard-actions";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "@/shared/ui/error-message";

interface FlashcardsSidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  flashcards: Flashcard[];
}

export function FlashcardsSidebar({
  selectedCategory,
  onSelectCategory,
  isCollapsed,
  onToggleCollapse,
  flashcards,
}: FlashcardsSidebarProps) {
  // Stan dialogu usuwania
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const router = useRouter();
  
  // Pobierz unikalne kategorie z fiszek
  const categories = [...new Set(flashcards.map((card) => card.category))];

  // Funkcja otwierająca dialog usuwania
  const handleDeleteCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Zapobiega kliknięciu przycisku kategorii
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };
  
  // Funkcja zamykająca dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  // Funkcja obsługująca potwierdzenie usunięcia
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    setErrorMessage(null);
    
    try {
      const result = await deleteCategoryAction(categoryToDelete);
      
      if (result.success) {
        closeDeleteDialog();
        // Odśwież stronę, aby zaktualizować listę kategorii
        router.refresh();
      } else {
        setErrorMessage(result.error || "Nie udało się usunąć kategorii");
      }
    } catch (error) {
      setErrorMessage("Wystąpił nieoczekiwany błąd podczas usuwania kategorii");
      console.error("Błąd usuwania kategorii:", error);
    } finally {
      setIsDeleting(false);
    }
  };

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

        {/* Pokaż komunikat o błędzie, jeśli wystąpił */}
        {errorMessage && (
          <div className="p-2">
            <ErrorMessage 
              message={errorMessage} 
              onClose={() => setErrorMessage(null)} 
            />
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category} className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex-1 justify-start mb-1 relative group overflow-hidden transition-all duration-300",
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
                  
                  {/* Przycisk usuwania kategorii - widoczny tylko gdy sidebar nie jest zwinięty */}
                  {!isCollapsed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={(e) => handleDeleteCategory(category, e)}
                      title="Usuń kategorię"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">
                No categories available
              </p>
            )}
          </div>
        </ScrollArea>
      </motion.div>
      
      {/* Dialog potwierdzający usunięcie kategorii */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć kategorię "{categoryToDelete}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Wszystkie fiszki z tej kategorii zostaną trwale usunięte.
              Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog} disabled={isDeleting}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} disabled={isDeleting}>
              {isDeleting ? "Usuwanie..." : "Usuń kategorię"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
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
import { deleteCategoryAction, getUserLanguagesAction } from "@/app/actions/flashcard-actions";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "@/shared/ui/error-message";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLoadingLanguages(true);
      try {
        const result = await getUserLanguagesAction();
        if (result.success) {
          setLanguages(result.languages);
          setSelectedLanguage('all');
        } else {
          setErrorMessage(result.error || "Nie udało się pobrać dostępnych języków");
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
        setErrorMessage("Wystąpił błąd podczas pobierania dostępnych języków");
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    
    fetchLanguages();
  }, []);
  
  const getLanguageName = (languageCode: string): string => {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'pl': 'Polski',
      'es': 'Español',
      'de': 'Deutsch',
      'fr': 'Français',
      'it': 'Italiano',
      'pt': 'Português',
      'ru': 'Русский',
      'zh': '中文',
      'ja': '日本語',
      'ko': '한국어'
    };
    
    return languageNames[languageCode] || languageCode;
  };
  
  const filteredFlashcards = selectedLanguage && selectedLanguage !== 'all'
    ? flashcards.filter(card => card.targetLanguage === selectedLanguage)
    : flashcards;
  
  const categories = [...new Set(filteredFlashcards.map((card) => card.category))];

  const handleDeleteCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    setErrorMessage(null);
    
    try {
      const result = await deleteCategoryAction(categoryToDelete);
      
      if (result.success) {
        closeDeleteDialog();
        router.refresh();
        
        toast({
          title: "Kategoria usunięta",
          description: `Pomyślnie usunięto kategorię "${categoryToDelete}" wraz z ${result.deletedCount} fiszkami.`,
          variant: "success",
        });
      } else {
        setErrorMessage(result.error || "Failed to delete category");
        
        toast({
          title: "Error",
          description: result.error || "Failed to delete category",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Category deletion error:", error);
      const errorMessage = error instanceof Error 
        ? `Category deletion failed: ${error.message}` 
        : "An unexpected error occurred while deleting the category";
      
      setErrorMessage(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);

    const newCategories = [...new Set(value === 'all' 
      ? flashcards.map(card => card.category)
      : flashcards.filter(card => card.targetLanguage === value).map(card => card.category))];

    if (!newCategories.includes(selectedCategory || '')) {
      if (newCategories.length > 0) {
        onSelectCategory(newCategories[0]);
      } else {
        onSelectCategory('');
      }
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
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
          
          {!isCollapsed && (languages.length > 0 || isLoadingLanguages) && (
            <div className="mt-2">
              <Select
                value={selectedLanguage || undefined}
                onValueChange={handleLanguageChange}
                disabled={isLoadingLanguages}
              >
                <SelectTrigger className="w-full bg-black/20 border-white/10 text-white">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-purple-400" />
                    <SelectValue placeholder="Wybierz język" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="all" className="hover:bg-purple-500/20">
                    Wszystkie języki
                  </SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang} className="hover:bg-purple-500/20">
                      {getLanguageName(lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

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
                    {selectedCategory === category && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                  
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
                {isLoadingLanguages 
                  ? "Ładowanie kategorii..." 
                  : selectedLanguage === 'all'
                    ? "Brak dostępnych kategorii"
                    : selectedLanguage 
                      ? `Brak kategorii dla języka ${getLanguageName(selectedLanguage)}` 
                      : "Brak dostępnych kategorii"}
              </p>
            )}
          </div>
        </ScrollArea>
      </motion.div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć kategorię &quot;{categoryToDelete}&quot;?</AlertDialogTitle>
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

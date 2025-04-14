"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Globe,
  Plus,
  BookOpen,
  CheckCircle,
  ListFilter,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
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
import {
  deleteCategoryAction,
  getUserLanguagesAction,
  generateMoreFlashcardsAction,
  generateMoreGuestFlashcardsAction,
} from "@/app/actions/flashcard-actions";
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
import { guestFlashcardsStorage } from "@/utils/guest-flashcards-storage";
import { AIGenerationLoader } from "@/components/ui/ai-generation-loader";
import { GenerateFlashcardsDialog } from "@/components/generate-flashcards-dialog";

interface FlashcardsSidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  flashcards: Flashcard[];
  isGuestMode?: boolean;
  onLanguageSelectClick?: () => void;
  onNewFlashcardsClick?: () => void;
  onFlashcardsUpdate?: (updatedFlashcards: Flashcard[]) => void;
  masteredCategories?: string[];
  onLearningFilterClick?: () => void;
}

export function FlashcardsSidebar({
  selectedCategory,
  onSelectCategory,
  isCollapsed,
  onToggleCollapse,
  flashcards,
  isGuestMode = false,
  onLanguageSelectClick,
  onNewFlashcardsClick,
  onFlashcardsUpdate,
  masteredCategories = [],
  onLearningFilterClick,
}: FlashcardsSidebarProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCategory, setGeneratingCategory] = useState<string | null>(
    null
  );
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [categoryToGenerate, setCategoryToGenerate] = useState<string | null>(
    null
  );
  const [learningFilter, setLearningFilter] = useState<string>("all");

  const router = useRouter();
  const { toast } = useToast();

  const fetchLanguages = useCallback(async () => {
    if (isGuestMode) {
      setSelectedLanguage("all");
      return;
    }

    setIsLoadingLanguages(true);
    try {
      const result = await getUserLanguagesAction();
      if (result.success) {
        setLanguages(result.languages);
        if (!selectedLanguage) {
          setSelectedLanguage("all");
        }
      } else {
        setErrorMessage(result.error || "Failed to fetch available languages");
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
      setErrorMessage("An error occurred while fetching available languages");
    } finally {
      setIsLoadingLanguages(false);
    }
  }, [isGuestMode, selectedLanguage]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    if (selectedLanguage && selectedLanguage !== "all") {
      const hasLanguageCategories = flashcards.some(
        (card) => card.targetLanguage === selectedLanguage
      );

      if (!hasLanguageCategories && languages.length > 0) {
        setSelectedLanguage("all");
      }
    }
  }, [languages, flashcards, selectedLanguage]);

  const getLanguageName = (languageCode: string): string => {
    const languageNames: Record<string, string> = {
      en: "English",
      pl: "Polski",
      es: "Español",
      de: "Deutsch",
      fr: "Français",
      it: "Italiano",
      pt: "Português",
      ru: "Русский",
      zh: "中文",
      ja: "日本語",
      ko: "한국어",
    };

    return languageNames[languageCode] || languageCode;
  };

  const filteredFlashcards =
    selectedLanguage && selectedLanguage !== "all"
      ? flashcards.filter((card) => card.targetLanguage === selectedLanguage)
      : flashcards;

  const categories = [
    ...new Set(filteredFlashcards.map((card) => card.category)),
  ];

  const getFilteredCategoriesByLearningStatus = () => {
    if (learningFilter === "all") {
      return categories;
    } else if (learningFilter === "mastered") {
      return categories.filter((category) =>
        masteredCategories.includes(category)
      );
    } else if (learningFilter === "learning") {
      return categories.filter(
        (category) => !masteredCategories.includes(category)
      );
    }
    return categories;
  };

  const displayedCategories = getFilteredCategoriesByLearningStatus();

  const handleDeleteCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleGenerateClick = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToGenerate(category);
    setIsGenerateDialogOpen(true);
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
      if (isGuestMode) {
        const deletedCount =
          guestFlashcardsStorage.deleteFlashcardsByCategory(categoryToDelete);

        closeDeleteDialog();
        router.refresh();

        toast({
          title: "Category deleted",
          description: `Successfully deleted category "${categoryToDelete}" with ${deletedCount} flashcards.`,
          variant: "success",
          duration: 1000,
        });

        const updatedFlashcards = guestFlashcardsStorage.getFlashcards();
        if (onFlashcardsUpdate) {
          onFlashcardsUpdate(updatedFlashcards);
        }
      } else {
        const result = await deleteCategoryAction(categoryToDelete);

        if (result.success) {
          closeDeleteDialog();
          router.refresh();
          await fetchLanguages();

          toast({
            title: "Category deleted",
            description: `Successfully deleted category "${categoryToDelete}" with ${result.deletedCount} flashcards.`,
            variant: "success",
            duration: 1000,
          });
        } else {
          setErrorMessage(result.error || "Failed to delete category");

          toast({
            title: "Error",
            description: result.error || "Failed to delete category",
            variant: "destructive",
            duration: 1000,
          });
        }
      }
    } catch (error) {
      console.error("Category deletion error:", error);
      const errorMessage =
        error instanceof Error
          ? `Category deletion failed: ${error.message}`
          : "An unexpected error occurred while deleting the category";

      setErrorMessage(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    if (isGuestMode && onLanguageSelectClick) {
      onLanguageSelectClick();
      return;
    }

    setSelectedLanguage(value);

    const newCategories = [
      ...new Set(
        value === "all"
          ? flashcards.map((card) => card.category)
          : flashcards
              .filter((card) => card.targetLanguage === value)
              .map((card) => card.category)
      ),
    ];

    if (!newCategories.includes(selectedCategory || "")) {
      if (newCategories.length > 0) {
        onSelectCategory(newCategories[0]);
      } else {
        onSelectCategory("");
      }
    }
  };

  const handleGenerateMoreFlashcards = async () => {
    if (!categoryToGenerate) return;

    setIsGenerating(true);
    setGeneratingCategory(categoryToGenerate);
    setErrorMessage(null);
    closeGenerateDialog();

    try {
      const existingFlashcards = flashcards.filter(
        (card) => card.category === categoryToGenerate
      );

      const targetLanguage = existingFlashcards[0]?.targetLanguage || "en";
      const sourceLanguage = existingFlashcards[0]?.sourceLanguage || "pl";
      const difficultyLevel = existingFlashcards[0]?.difficultyLevel || "easy";

      const existingTerms = Array.from(
        new Set(
          existingFlashcards.map((card) => card.origin_text.toLowerCase())
        )
      );

      if (isGuestMode) {
        const result = await generateMoreGuestFlashcardsAction({
          category: categoryToGenerate,
          existingTerms,
          count: 5,
          sourceLanguage,
          targetLanguage,
          difficultyLevel,
        });

        if (result.success && result.flashcards) {
          const updatedFlashcards = guestFlashcardsStorage.addFlashcards(
            result.flashcards
          );

          if (onFlashcardsUpdate) {
            onFlashcardsUpdate(updatedFlashcards);
          }

          toast({
            title: "Flashcards Added",
            description: `Successfully added ${result.flashcards.length} new flashcards to the "${categoryToGenerate}" category.`,
            variant: "success",
            duration: 1000,
          });
        } else {
          setErrorMessage(result.error || "Failed to generate new flashcards");

          toast({
            title: "Error",
            description: result.error || "Failed to generate new flashcards",
            variant: "destructive",
            duration: 1000,
          });
        }
      } else {
        const result = await generateMoreFlashcardsAction({
          category: categoryToGenerate,
          existingTerms,
          count: 5,
          sourceLanguage,
          targetLanguage,
          difficultyLevel,
        });

        if (result.success) {
          router.refresh();

          toast({
            title: "Flashcards Added",
            description: `Successfully added new flashcards to the "${categoryToGenerate}" category.`,
            variant: "success",
            duration: 1000,
          });
        } else {
          setErrorMessage(result.error || "Failed to generate new flashcards");

          toast({
            title: "Error",
            description: result.error || "Failed to generate new flashcards",
            variant: "destructive",
            duration: 1000,
          });
        }
      }
    } catch (error) {
      console.error("Error generating additional flashcards:", error);
      const errorMessage =
        error instanceof Error
          ? `Flashcard generation failed: ${error.message}`
          : "An unexpected error occurred during flashcard generation";

      setErrorMessage(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsGenerating(false);
      setGeneratingCategory(null);
    }
  };

  const closeGenerateDialog = () => {
    setIsGenerateDialogOpen(false);
    setCategoryToGenerate(null);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {isGenerating && <AIGenerationLoader />}

      <motion.div
        className={cn(
          "h-full bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col",
          isCollapsed ? "w-[60px]" : "w-[280px]"
        )}
        animate={{ width: isCollapsed ? 60 : 280 }}
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
          {isGuestMode && onNewFlashcardsClick ? (
            <Button
              variant="outline"
              className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group flex items-center justify-center rounded-md"
              onClick={onNewFlashcardsClick}
            >
              <PlusCircle className="h-4 w-4 mr-2 group-hover:text-purple-300" />
              {!isCollapsed && <span>New Flashcards</span>}
            </Button>
          ) : (
            <Link href="/" className="block w-full">
              <Button
                variant="outline"
                className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group flex items-center justify-center rounded-md"
              >
                <PlusCircle className="h-4 w-4 mr-2 group-hover:text-purple-300" />
                {!isCollapsed && <span>New Flashcards</span>}
              </Button>
            </Link>
          )}

          {!isCollapsed &&
            (isGuestMode || languages.length > 0 || isLoadingLanguages) && (
              <div className="space-y-2 mt-2">
                {isGuestMode ? (
                  <div
                    className="w-full bg-black/20 border border-white/10 text-white rounded-md h-10 flex items-center px-3 cursor-pointer hover:bg-purple-500/10 transition-colors duration-200"
                    onClick={onLanguageSelectClick}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-purple-400" />
                      <span className="text-white">All languages</span>
                    </div>
                    <div className="ml-auto">
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </div>
                  </div>
                ) : (
                  <Select
                    value={selectedLanguage || undefined}
                    onValueChange={handleLanguageChange}
                    disabled={isLoadingLanguages}
                  >
                    <SelectTrigger className="w-full bg-black/20 border-white/10 text-white">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-purple-400" />
                        <SelectValue placeholder="Change language" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white">
                      <SelectItem
                        value="all"
                        className="hover:bg-purple-500/20"
                      >
                        All languages
                      </SelectItem>
                      {languages.map((lang) => (
                        <SelectItem
                          key={lang}
                          value={lang}
                          className="hover:bg-purple-500/20"
                        >
                          {getLanguageName(lang)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {!isGuestMode && (
                  <div>
                    <Select
                      value={learningFilter}
                      onValueChange={setLearningFilter}
                    >
                      <SelectTrigger className="w-full bg-black/20 border-white/10 text-white">
                        <div className="flex items-center gap-2">
                          <ListFilter className="h-4 w-4 text-purple-400" />
                          <SelectValue placeholder="Filtruj postęp" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white">
                        <SelectItem
                          value="all"
                          className="hover:bg-purple-500/20"
                        >
                          Wszystkie kategorie
                        </SelectItem>
                        <SelectItem
                          value="learning"
                          className="hover:bg-blue-500/20"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-400" />
                            <span>Uczę się</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="mastered"
                          className="hover:bg-green-500/20"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Już umiem</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {isGuestMode && onLearningFilterClick && (
                  <div
                    className="w-full bg-black/20 border border-white/10 text-white rounded-md h-10 flex items-center px-3 cursor-pointer hover:bg-purple-500/10 transition-colors duration-200 mt-2"
                    onClick={onLearningFilterClick}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <ListFilter className="h-4 w-4 text-purple-400" />
                      <span className="text-white">Wszystkie kategorie</span>
                    </div>
                    <div className="ml-auto">
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </div>
                  </div>
                )}
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
            {displayedCategories.length > 0 ? (
              displayedCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
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
                    {!isCollapsed && masteredCategories.includes(category) && (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    )}
                    <span className="relative z-10 truncate">
                      {isCollapsed ? category.charAt(0) : category}
                    </span>
                    {selectedCategory === category && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500" />
                    )}
                    {masteredCategories.includes(category) && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-green-400" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>

                  {!isCollapsed && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 min-w-8 p-0 shrink-0 text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                        onClick={(e) => handleGenerateClick(category, e)}
                        title="Add more flashcards to this category"
                        disabled={
                          isGenerating || generatingCategory === category
                        }
                      >
                        <Plus className="h-4 w-4" />
                        {generatingCategory === category && (
                          <span className="sr-only">Generating...</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 min-w-8 p-0 shrink-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => handleDeleteCategory(category, e)}
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">
                {isLoadingLanguages
                  ? "Ładowanie kategorii..."
                  : learningFilter === "mastered"
                  ? "Nie ma jeszcze opanowanych kategorii"
                  : learningFilter === "learning"
                  ? "Nie ma kategorii w trakcie nauki"
                  : selectedLanguage === "all"
                  ? "Brak dostępnych kategorii"
                  : selectedLanguage
                  ? `Brak kategorii dla języka ${getLanguageName(
                      selectedLanguage
                    )}`
                  : "Brak dostępnych kategorii"}
              </p>
            )}
          </div>
        </ScrollArea>
      </motion.div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete category &quot;{categoryToDelete}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              All flashcards in this category will be permanently deleted. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={closeDeleteDialog}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GenerateFlashcardsDialog
        isOpen={isGenerateDialogOpen}
        onOpenChange={setIsGenerateDialogOpen}
        onConfirm={handleGenerateMoreFlashcards}
        categoryName={categoryToGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}

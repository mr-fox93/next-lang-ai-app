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
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
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

export type SidebarVariant = "authenticated" | "demo" | "guest";

interface FlashcardsSidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  flashcards: Flashcard[];
  variant?: SidebarVariant;
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
  variant = "authenticated",
  onLanguageSelectClick,
  onNewFlashcardsClick,
  onFlashcardsUpdate,
  masteredCategories = [],
  onLearningFilterClick,
}: FlashcardsSidebarProps) {
  const t = useTranslations('Sidebar');
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

  // Determine if component is in guest mode
  const isGuestMode = variant === "guest" || variant === "demo";

  // Memoized language fetcher
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

  // Memoized language name getter
  const getLanguageName = useCallback((languageCode: string): string => {
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
  }, []);

  // Memoized filtered flashcards
  const filteredFlashcards = useMemo(() => 
    selectedLanguage && selectedLanguage !== "all"
      ? flashcards.filter((card) => card.targetLanguage === selectedLanguage)
      : flashcards,
    [flashcards, selectedLanguage]
  );

  // Memoized categories
  const categories = useMemo(() => 
    [...new Set(filteredFlashcards.map((card) => card.category))],
    [filteredFlashcards]
  );

  // Memoized filtered categories by learning status
  const getFilteredCategoriesByLearningStatus = useCallback(() => {
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
  }, [learningFilter, categories, masteredCategories]);

  const displayedCategories = useMemo(() => 
    getFilteredCategoriesByLearningStatus(),
    [getFilteredCategoriesByLearningStatus]
  );

  // Memoized handlers
  const handleDeleteCategory = useCallback((category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleGenerateClick = useCallback((category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToGenerate(category);
    setIsGenerateDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  }, []);

  const confirmDeleteCategory = useCallback(async () => {
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
          title: t('categoryDeleted'),
          description: t('categoryDeletedSuccess', { 
            category: categoryToDelete, 
            count: deletedCount.toString()
          }),
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
            title: t('categoryDeleted'),
            description: t('categoryDeletedSuccess', { 
              category: categoryToDelete, 
              count: (result.deletedCount || 0).toString()
            }),
            variant: "success",
            duration: 1000,
          });
        } else {
          setErrorMessage(result.error || t('failedToDeleteCategory'));

          toast({
            title: t('error'),
            description: result.error || t('failedToDeleteCategory'),
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
        title: t('error'),
        description: errorMessage,
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [categoryToDelete, isGuestMode, closeDeleteDialog, router, toast, t, onFlashcardsUpdate, fetchLanguages]);

  const handleLanguageChange = useCallback((value: string) => {
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
  }, [isGuestMode, onLanguageSelectClick, flashcards, selectedCategory, onSelectCategory]);

  const handleGenerateMoreFlashcards = useCallback(async () => {
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
            title: t('flashcardsAdded'),
            description: t('flashcardsAddedSuccess', { 
              count: result.flashcards.length, 
              category: categoryToGenerate 
            }),
            variant: "success",
            duration: 1000,
          });
        } else {
          setErrorMessage(result.error || t('failedToGenerateFlashcards'));

          toast({
            title: t('error'),
            description: result.error || t('failedToGenerateFlashcards'),
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
            title: t('flashcardsAdded'),
            description: t('addedNewFlashcards', { category: categoryToGenerate }),
            variant: "success",
            duration: 1000,
          });
        } else {
          setErrorMessage(result.error || t('failedToGenerateFlashcards'));

          toast({
            title: t('error'),
            description: result.error || t('failedToGenerateFlashcards'),
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
        title: t('error'),
        description: errorMessage,
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsGenerating(false);
      setGeneratingCategory(null);
    }
  }, [categoryToGenerate, isGuestMode, flashcards, onFlashcardsUpdate, toast, t, router]);

  const closeGenerateDialog = useCallback(() => {
    setIsGenerateDialogOpen(false);
    setCategoryToGenerate(null);
  }, []);

  // Memoized empty state message
  const emptyStateMessage = useMemo(() => {
    if (isLoadingLanguages) return t('loadingCategories');
    if (learningFilter === "mastered") return t('noMasteredCategories');
    if (learningFilter === "learning") return t('noLearningCategories');
    if (selectedLanguage === "all") return t('noCategoriesAvailable');
    if (selectedLanguage) {
      return t('noCategoriesForLanguage', { language: getLanguageName(selectedLanguage) });
    }
    return t('noCategoriesAvailable');
  }, [isLoadingLanguages, learningFilter, selectedLanguage, t, getLanguageName]);

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
              {t('categories')}
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
              {!isCollapsed && <span>{t('newFlashcards')}</span>}
            </Button>
          ) : (
            <Link href="/" className="block w-full">
              <Button
                variant="outline"
                className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group flex items-center justify-center rounded-md"
              >
                <PlusCircle className="h-4 w-4 mr-2 group-hover:text-purple-300" />
                {!isCollapsed && <span>{t('newFlashcards')}</span>}
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
                      <span className="text-white">{t('allLanguages')}</span>
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
                        <SelectValue placeholder={t('changeLanguage')} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white">
                      <SelectItem
                        value="all"
                        className="hover:bg-purple-500/20"
                      >
                        {t('allLanguages')}
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
                          <SelectValue placeholder={t('filterProgress')} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white">
                        <SelectItem
                          value="all"
                          className="hover:bg-purple-500/20"
                        >
                          {t('allCategories')}
                        </SelectItem>
                        <SelectItem
                          value="learning"
                          className="hover:bg-blue-500/20"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-400" />
                            <span>{t('learning')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="mastered"
                          className="hover:bg-green-500/20"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>{t('mastered')}</span>
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
                      <span className="text-white">{t('allCategories')}</span>
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
                        title={t('addMoreFlashcards')}
                        disabled={
                          isGenerating || generatingCategory === category
                        }
                      >
                        <Plus className="h-4 w-4" />
                        {generatingCategory === category && (
                          <span className="sr-only">{t('generating')}</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 min-w-8 p-0 shrink-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => handleDeleteCategory(category, e)}
                        title={t('deleteCategory')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">
                {emptyStateMessage}
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
              {t('deleteCategoryTitle', { category: categoryToDelete || '' })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteCategoryDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={closeDeleteDialog}
              disabled={isDeleting}
            >
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              disabled={isDeleting}
            >
              {isDeleting ? t('deleting') : t('deleteButton')}
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

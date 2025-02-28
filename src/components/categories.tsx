"use client";

import { motion } from "framer-motion";
import { GraduationCap, Palmtree, UtensilsCrossed, Hotel } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader } from "@/components/ui/loader";
import { generateFlashcardsAction } from "@/app/actions/flashcard-actions";
import { ErrorMessage } from "@/shared/ui/error-message";
import { CategoryButton } from "@/shared/ui/category-button";

const CATEGORIES = [
  {
    icon: Palmtree,
    label: "Travel",
  },
  {
    icon: GraduationCap,
    label: "Job Interview",
  },
  {
    icon: UtensilsCrossed,
    label: "Ordering Food",
  },
  {
    icon: Hotel,
    label: "Booking Hotel",
  },
] as const;

export function Categories() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCategoryClick = async (categoryLabel: string) => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect=/");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const result = await generateFlashcardsAction({ 
        count: 5, 
        message: `Stwórz fiszki do nauki języka na temat: ${categoryLabel}`,
        level: "beginner"
      });
      
      if (result.success) {
        router.push("/flashcards");
      } else {
        setErrorMessage(result.error || "Nie udało się wygenerować fiszek");
        console.error("Błąd generowania fiszek:", result.error);
      }
    } catch (error) {
      setErrorMessage("Wystąpił nieoczekiwany błąd");
      console.error("Nie udało się wygenerować fiszek:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <ErrorMessage message={errorMessage} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap gap-2 justify-center mb-6 max-w-2xl mx-auto w-full px-4 md:px-0"
      >
        {CATEGORIES.map((category) => (
          <CategoryButton
            key={category.label}
            icon={category.icon}
            label={category.label}
            onClick={() => handleCategoryClick(category.label)}
            disabled={isLoading}
          />
        ))}
      </motion.div>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import { GraduationCap, Palmtree, UtensilsCrossed, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader } from "@/components/ui/loader";

const categories = [
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
];

export function Categories() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCategoryClick = async (categoryLabel: string) => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect=/");
      return;
    }

    setIsLoading(true);
    
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/generate-flashcards?_=${timestamp}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
        body: JSON.stringify({ 
          count: 5, 
          message: `Stwórz fiszki do nauki języka na temat: ${categoryLabel}`,
          level: "beginner"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Błąd generowania fiszek");
      }

      await response.json();
      router.push("/flashcards");
    } catch (error) {
      console.error("Nie udało się wygenerować fiszek:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap gap-2 justify-center mb-6 max-w-2xl mx-auto w-full px-4 md:px-0"
      >
        {categories.map((category) => (
          <Button
            key={category.label}
            variant="ghost"
            className="h-10 sm:h-12 px-3 sm:px-6 bg-white/[0.08] hover:bg-white/[0.12] border-2 border-white/10 rounded-lg group transition-all duration-300 flex-1 min-w-[120px] max-w-[160px] sm:max-w-none"
            onClick={() => handleCategoryClick(category.label)}
            disabled={isLoading}
          >
            <motion.div
              initial={{ scale: 1 }}
              className="flex items-center gap-1 sm:gap-2"
            >
              <category.icon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-white text-sm sm:text-base group-hover:text-purple-400 transition-colors">
                {category.label}
              </span>
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg -z-10 blur-sm" />
          </Button>
        ))}
      </motion.div>
    </>
  );
}

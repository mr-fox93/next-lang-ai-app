"use client";

import { createContext, useState, useContext, ReactNode } from "react";
import { FlashCard } from "@/lib/flashcard.schema";

interface FlashcardsContextType {
  flashcards: FlashCard[];
  userInput: string;
  setFlashcards: (flashcards: FlashCard[]) => void;
  setUserInput: (input: string) => void;
}

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(
  undefined
);

export const FlashcardsProvider = ({ children }: { children: ReactNode }) => {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [userInput, setUserInput] = useState("");

  return (
    <FlashcardsContext.Provider
      value={{ flashcards, setFlashcards, userInput, setUserInput }}
    >
      {children}
    </FlashcardsContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardsContext);
  if (!context) {
    throw new Error("useFlashcards must be used within a FlashcardsProvider");
  }
  return context;
};

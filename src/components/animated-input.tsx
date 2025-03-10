"use client";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";

const CURSOR = "|";
const TYPING_TEXTS = [
  "Potrzebuję fiszek na egzamin z angielskiego...",
  "I need flashcards for my Spanish exam...",
  "Ayúdame a aprender terminología de programación...",
  "Przygotowuję się do prezentacji biznesowej...",
  "Help me learn programming terminology...",
  "Estoy preparando vocabulario para mi viaje a Japón...",
];

export function AnimatedInput({
  isInputFocused,
  userInput,
}: {
  isInputFocused: boolean;
  userInput: string;
}) {
  const isActive = !isInputFocused && userInput.length === 0;
  
  const { displayText, showCursor } = useTypingAnimation(
    TYPING_TEXTS,
    isActive,
    {
      typingDelayMin: 50,
      typingDelayMax: 150,
      deletingDelay: 30,
      pauseDelay: 2000,
      cursorBlinkSpeed: 800,
    }
  );

  if (!isActive) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-6 left-6 text-lg text-white/90">
        {displayText}
        <span
          className={`inline-block ml-[1px] -mr-[1px] transition-opacity duration-100 ${
            showCursor ? "opacity-100" : "opacity-0"
          }`}
        >
          {CURSOR}
        </span>
      </div>
    </div>
  );
}

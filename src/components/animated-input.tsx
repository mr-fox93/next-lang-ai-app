"use client";
import { useEffect, useState } from "react";

const CURSOR = "|";
const TYPING_TEXTS = [
  "Mam rozmowe o prace w dziale ESG...",
  "Przygotowuje się do egzaminu z zarządzania...",
  "Wylatuję na wakacje do Londynu...",
];

export function AnimatedInput({
  isInputFocused,
  userInput,
}: {
  isInputFocused: boolean;
  userInput: string;
}) {
  const [displayText, setDisplayText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 800);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const animateTyping = async () => {
      while (isMounted) {
        if (isInputFocused || userInput.length > 0) {
          setDisplayText("");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const text = TYPING_TEXTS[currentTextIndex];

        let currentText = "";
        for (let i = 0; i < text.length; i++) {
          if (!isMounted || isInputFocused || userInput.length > 0) break;
          currentText += text[i];
          setDisplayText(currentText);
          await new Promise((resolve) =>
            setTimeout(resolve, 50 + Math.random() * 100)
          );
        }

        if (!isInputFocused && !userInput.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          while (
            currentText.length > 0 &&
            isMounted &&
            !isInputFocused &&
            !userInput.length
          ) {
            currentText = currentText.slice(0, -1);
            setDisplayText(currentText);
            await new Promise((resolve) => setTimeout(resolve, 30));
          }

          if (isMounted && !isInputFocused && !userInput.length) {
            setCurrentTextIndex((prev) => (prev + 1) % TYPING_TEXTS.length);
          }
        }
      }
    };

    animateTyping();

    return () => {
      isMounted = false;
    };
  }, [currentTextIndex, isInputFocused, userInput]);

  if (isInputFocused || userInput.length > 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Simulated input text */}
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

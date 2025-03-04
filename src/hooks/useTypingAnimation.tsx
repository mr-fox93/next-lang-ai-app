"use client";
import { useEffect, useState } from "react";

/**
 * Hook do animowanego wyświetlania i usuwania tekstu
 * 
 * @param texts - Tablica tekstów do animacji
 * @param isActive - Czy animacja powinna być aktywna
 * @param options - Opcjonalne parametry konfiguracyjne
 * @returns Aktualnie wyświetlany tekst oraz informację o pokazywaniu kursora
 */
export function useTypingAnimation(
  texts: string[],
  isActive: boolean,
  options: {
    typingDelayMin?: number;
    typingDelayMax?: number;
    deletingDelay?: number;
    pauseDelay?: number;
    cursorBlinkSpeed?: number;
  } = {}
) {
  const [displayText, setDisplayText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const {
    typingDelayMin = 50,
    typingDelayMax = 150,
    deletingDelay = 30,
    pauseDelay = 2000,
    cursorBlinkSpeed = 800,
  } = options;

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, cursorBlinkSpeed);

    return () => clearInterval(cursorInterval);
  }, [cursorBlinkSpeed]);

  useEffect(() => {
    if (!isActive || texts.length === 0) return;
    
    let isMounted = true;

    const animateTyping = async () => {
      while (isMounted) {
        if (!isActive) {
          setDisplayText("");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, pauseDelay / 2));

        const text = texts[currentTextIndex];

        let currentText = "";
        for (let i = 0; i < text.length; i++) {
          if (!isMounted || !isActive) break;
          currentText += text[i];
          setDisplayText(currentText);
          
          await new Promise((resolve) =>
            setTimeout(resolve, typingDelayMin + Math.random() * (typingDelayMax - typingDelayMin))
          );
        }

        if (isActive) {
          await new Promise((resolve) => setTimeout(resolve, pauseDelay));

          while (
            currentText.length > 0 &&
            isMounted &&
            isActive
          ) {
            currentText = currentText.slice(0, -1);
            setDisplayText(currentText);
            await new Promise((resolve) => setTimeout(resolve, deletingDelay));
          }

          if (isMounted && isActive) {
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          }
        }
      }
    };

    animateTyping();

    return () => {
      isMounted = false;
    };
  }, [currentTextIndex, isActive, texts, typingDelayMin, typingDelayMax, deletingDelay, pauseDelay]);

  return {
    displayText,
    showCursor,
  };
} 
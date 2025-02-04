"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

const examplePrompts = [
  "I have a recruitment interview for the ESG department...",
  "Need to learn about sustainable finance...",
  "Preparing for environmental policy exam...",
];

export function AnimatedPlaceholder() {
  const controls = useAnimation();
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const animateText = async () => {
      const text = examplePrompts[currentPrompt];
      setDisplayText(""); // Reset tekstu

      // Animacja wygaszenia
      await controls.start({
        opacity: 0,
        transition: { duration: 0.3 },
      });

      await controls.start({
        opacity: 1,
        transition: { duration: 0.3 },
      });

      // Efekt "pisania" litera po literze
      for (let i = 0; i <= text.length; i++) {
        setDisplayText(text.substring(0, i));
        await new Promise((resolve) => setTimeout(resolve, 50)); // Małe opóźnienie
      }

      // Krótkie oczekiwanie
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Animacja wygaszenia przed zmianą tekstu
      await controls.start({
        opacity: 0,
        transition: { duration: 0.3 },
      });

      // Przejście do kolejnego promptu
      setCurrentPrompt((prev) => (prev + 1) % examplePrompts.length);
    };

    animateText();
  }, [controls, currentPrompt]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={controls}
      className="pointer-events-none text-gray-400"
    >
      {displayText}
    </motion.span>
  );
}

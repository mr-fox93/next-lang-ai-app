// src/utils/speak.ts

// Rozszerzamy typy języków
export type SupportedTTSLanguage = "pl-PL" | "en-US" | "es-ES" | "it-IT";

export const speak = (text: string, lang: SupportedTTSLanguage = "en-US") => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
};

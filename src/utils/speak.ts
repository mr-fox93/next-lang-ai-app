// src/utils/speak.ts

export const speak = (text: string, lang: "pl-PL" | "en-US" = "en-US") => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
};

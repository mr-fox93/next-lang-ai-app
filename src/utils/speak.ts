// src/utils/speak.ts

export type SupportedTTSLanguage = "pl-PL" | "en-US" | "es-ES" | "it-IT";

let cachedVoices: SpeechSynthesisVoice[] | null = null;

const initVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (cachedVoices) {
      resolve(cachedVoices);
      return;
    }

    const voices = speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
      resolve(voices);
      return;
    }

    speechSynthesis.onvoiceschanged = () => {
      const availableVoices = speechSynthesis.getVoices();
      cachedVoices = availableVoices;
      resolve(availableVoices);
    };
  });
};

export const speak = async (
  text: string,
  lang: SupportedTTSLanguage = "en-US"
) => {
  if (!window.speechSynthesis) {
    console.error("Speech synthesis not supported");
    return;
  }

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;

  try {
    const voices = await initVoices();

    if (voices.length > 0) {
      const exactVoice = voices.find((voice) => voice.lang === lang);
      if (exactVoice) {
        utterance.voice = exactVoice;
      } else {
        const langCode = lang.split("-")[0];
        const similarVoice = voices.find((voice) =>
          voice.lang.startsWith(langCode)
        );
        if (similarVoice) {
          utterance.voice = similarVoice;
        }
      }
    }
  } catch (e) {
    console.error("Error while selecting voice:", e);
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    utterance.rate = 0.9;
  }

  speechSynthesis.speak(utterance);
};

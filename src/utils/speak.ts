// src/utils/speak.ts

import { SupportedTTSLanguage } from '@/types/locale';

let cachedVoices: SpeechSynthesisVoice[] | null = null;

// Detect Safari browser
const isSafari = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('chromium');
};

// Safari-specific voice preferences
const getSafariVoicePreferences = (language: SupportedTTSLanguage): string[] => {
  const preferences: Record<SupportedTTSLanguage, string[]> = {
    'en-US': ['Samantha', 'Alex', 'Daniel', 'Fred', 'Karen', 'Moira', 'Tessa', 'Veena', 'Victoria'],
    'es-ES': ['Monica', 'Paulina', 'Jorge', 'Juan'],
    'pl-PL': ['Zosia', 'Krzysztof'],
    'it-IT': ['Alice', 'Luca']
  };
  
  return preferences[language] || [];
};

// General voice preferences for other browsers (prioritizing female voices for Spanish)
const getVoicePreferences = (language: SupportedTTSLanguage): string[] => {
  const preferences: Record<SupportedTTSLanguage, string[]> = {
    'en-US': ['Microsoft Zira', 'Google US English', 'Microsoft David', 'Alex', 'Karen'],
    'es-ES': ['Microsoft Helena', 'Microsoft Sabina', 'Google español', 'Microsoft Pablo', 'Spanish Female'], // Female voices first
    'pl-PL': ['Microsoft Paulina', 'Google polski', 'Microsoft Adam', 'Polish Female'],
    'it-IT': ['Microsoft Elsa', 'Google italiano', 'Microsoft Cosimo', 'Italian Female']
  };
  
  return preferences[language] || [];
};

const initVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (cachedVoices) {
      resolve(cachedVoices);
      return;
    }

    // For Safari, we need to wait longer for voices to load
    const maxWaitTime = isSafari() ? 3000 : 1000;
    let waitTime = 0;
    const checkInterval = 100;

    const checkVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        cachedVoices = voices;
        resolve(voices);
        return;
      }

      waitTime += checkInterval;
      if (waitTime >= maxWaitTime) {
        // Timeout - resolve with empty array
        cachedVoices = [];
        resolve([]);
        return;
      }

      setTimeout(checkVoices, checkInterval);
    };

    // Start checking immediately
    checkVoices();

    // Also listen for the voices changed event (may not fire on Safari)
    speechSynthesis.onvoiceschanged = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices && availableVoices.length > 0) {
        cachedVoices = availableVoices;
        resolve(availableVoices);
      }
    };
  });
};

export const speak = async (
  text: string,
  language: SupportedTTSLanguage = "en-US"
) => {
  if (!window.speechSynthesis) {
    console.error("Speech synthesis not supported");
    return;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  // Short delay for Safari to process the cancel
  if (isSafari()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;

  try {
    const voices = await initVoices();

    if (voices.length > 0) {
      let selectedVoice: SpeechSynthesisVoice | null = null;

      // Safari-specific voice selection
      if (isSafari()) {
        const safariVoiceNames = getSafariVoicePreferences(language);
        
        // Try to find preferred Safari voices by name
        for (const voiceName of safariVoiceNames) {
          selectedVoice = voices.find(voice => 
            voice.name.includes(voiceName) && 
            (voice.lang === language || voice.lang.startsWith(language.split("-")[0]))
          ) || null;
          if (selectedVoice) break;
        }
        
        // Fallback to language match for Safari
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang === language) || null;
        }
        
        // Further fallback to language code match for Safari
        if (!selectedVoice) {
          const langCode = language.split("-")[0];
          selectedVoice = voices.find(voice => voice.lang.startsWith(langCode)) || null;
        }
      } else {
        // Standard voice selection for other browsers with preferences
        const voicePreferences = getVoicePreferences(language);
        
        // Try to find preferred voices by name (prioritizing female voices for Spanish)
        for (const voiceName of voicePreferences) {
          selectedVoice = voices.find(voice => 
            voice.name.includes(voiceName) && 
            (voice.lang === language || voice.lang.startsWith(language.split("-")[0]))
          ) || null;
          if (selectedVoice) break;
        }
        
        // If no preferred voice found, try gender-based selection for Spanish
        if (!selectedVoice && language === 'es-ES') {
          // Look for female voices (common keywords that indicate female voices)
          const femaleKeywords = ['female', 'mujer', 'helena', 'sabina', 'monica', 'paulina', 'carmen', 'lola'];
          selectedVoice = voices.find(voice => 
            (voice.lang === language || voice.lang.startsWith('es')) &&
            femaleKeywords.some(keyword => voice.name.toLowerCase().includes(keyword))
          ) || null;
        }
        
        // Fallback to exact language match
        if (!selectedVoice) {
          selectedVoice = voices.find((voice) => voice.lang === language) || null;
        }
        
        // Final fallback to language code match
        if (!selectedVoice) {
          const langCode = language.split("-")[0];
          selectedVoice = voices.find((voice) =>
            voice.lang.startsWith(langCode)
          ) || null;
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
  } catch (e) {
    console.error("Error while selecting voice:", e);
  }

  // Platform-specific settings
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isSafari()) {
    // Safari-specific settings
    utterance.rate = isMobile ? 0.8 : 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
  } else if (isMobile) {
    // Mobile settings for other browsers
    utterance.rate = 0.9;
  }

  // Error handling for Safari
  utterance.onerror = (event) => {
    const errorMessage = event.error || 'Unknown error';
    
    // Ignore common canceled errors on Safari - check FIRST before logging
    if (isSafari() && (errorMessage === 'canceled' || errorMessage === 'interrupted')) {
      return;
    }
    
    // Only log errors that are not ignored
    console.error('Speech synthesis error:', errorMessage);
    
    // Log additional info for debugging
    console.warn('TTS Error Details:', {
      error: errorMessage,
      language: language,
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      browser: isSafari() ? 'Safari' : 'Other'
    });
  };

  // Attempt to speak
  try {
    speechSynthesis.speak(utterance);
    
    // Safari sometimes needs a small delay to start speaking properly
    if (isSafari()) {
      setTimeout(() => {
        if (speechSynthesis.paused) {
          speechSynthesis.resume();
        }
      }, 100);
    }
  } catch (error) {
    console.error('Failed to speak:', error);
  }
};

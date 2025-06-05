"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { X, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';
import type { 
  CookieConsent, 
  CookieConsentContextType 
} from "@/types/component-props";

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const useCookieConsent = (): CookieConsentContextType => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

// Komponent Provider, który będzie opakowywał aplikację
export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  
  // Pobieramy tłumaczenia używając next-intl
  const t = useTranslations('Cookie');

  // Funkcja do otwierania banera dostępna przez kontekst
  const openBanner = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    // Sprawdzenie, czy użytkownik już ustawił preferencje
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem("cookie-consent");
      if (savedConsent) {
        // Jeśli tak, używamy zapisanych preferencji
        setConsent(JSON.parse(savedConsent));
      } else {
        // Jeśli nie, pokazujemy baner
        setIsOpen(true);
      }
    }
  }, []);

  const handleAccept = () => {
    const newConsent = {
      necessary: true,
      accepted: true,
    };
    localStorage.setItem("cookie-consent", JSON.stringify(newConsent));
    setConsent(newConsent);
    setIsOpen(false);
  };

  const handleReject = () => {
    const newConsent = {
      necessary: true, // Niezbędne cookies zawsze włączone
      accepted: false,
    };
    localStorage.setItem("cookie-consent", JSON.stringify(newConsent));
    setConsent(newConsent);
    setIsOpen(false);
  };

  const handleClose = () => {
    // Jeśli użytkownik zamyka baner bez wyboru, traktujemy to jako odrzucenie
    if (!consent) {
      handleReject();
    } else {
      setIsOpen(false);
    }
  };

  return (
    <CookieConsentContext.Provider value={{ openBanner, consent }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <div className="max-w-6xl mx-auto bg-black border border-purple-500/30 rounded-xl shadow-xl shadow-purple-500/10 backdrop-blur-lg overflow-hidden">
              <div className="p-5 md:p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-medium">{t('title')}</h3>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 text-gray-300 text-sm">
                  <p>{t('description')}</p>
                  
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-3"
                    >
                      <div className="border border-white/10 rounded-lg p-3 bg-black/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{t('necessary')}</p>
                            <p className="text-xs text-gray-400">{t('necessaryDesc')}</p>
                          </div>
                          <div className="border border-purple-500 rounded-full p-1 bg-purple-500/20">
                            <Check className="h-4 w-4 text-purple-400" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-end items-center">
                  <Button
                    variant="link"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    {showDetails ? t('hideDetails') : t('showDetails')}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      {t('onlyNecessary')}
                    </Button>
                    <Button
                      onClick={handleAccept}
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400"
                    >
                      {t('acceptAll')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CookieConsentContext.Provider>
  );
}

// Komponent, który będzie używany w aplikacji
export function CookieConsent() {
  return null; // Ten komponent nie renderuje nic, ponieważ banner jest renderowany przez Provider
} 
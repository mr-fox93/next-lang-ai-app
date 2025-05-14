"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Languages, Mail } from "lucide-react";
import { useCookieConsent } from "./cookie-consent";
import { useLanguage } from "@/shared/language-context";
import { Button } from "./ui/button";
import { useContactModal } from "@/shared/contact-modal-context";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { openBanner } = useCookieConsent();
  const { language, setLanguage, translations } = useLanguage();
  const { openContactModal } = useContactModal();
  
  const t = translations.footer[language];

  return (
    <footer className="w-full py-8 border-t border-white/10 bg-black/40">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-500 text-sm">
            © {currentYear} Flashcards AI. {t.allRightsReserved}.
          </p>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <button
              onClick={openContactModal}
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              <Mail size={16} />
              <span>{t.contact}</span>
            </button>
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
            >
              {t.privacyPolicy}
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
            >
              {t.termsOfUse}
            </Link>
            <button
              onClick={() => openBanner()}
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              <Shield size={16} />
              <span>{t.cookieSettings}</span>
            </button>
            <div className="flex items-center gap-2 ml-2">
              <Languages size={16} className="text-gray-500" />
              <div className="flex gap-1">
                <Button
                  onClick={() => setLanguage("pl")}
                  variant="ghost"
                  className={`text-xs py-1 px-2 h-auto ${language === "pl" ? "bg-purple-500/20 text-purple-400" : "text-gray-500"}`}
                >
                  PL
                </Button>
                <Button
                  onClick={() => setLanguage("en")}
                  variant="ghost"
                  className={`text-xs py-1 px-2 h-auto ${language === "en" ? "bg-purple-500/20 text-purple-400" : "text-gray-500"}`}
                >
                  EN
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

"use client";

import { motion } from "framer-motion";
import { Shield, Languages, Mail } from "lucide-react";
import { useCookieConsent } from "./cookie-consent";
import { Button } from "./ui/button";
import { useContactModal } from "@/shared/contact-modal-context";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { Locale } from '@/types/locale';

const localeNames = {
  en: 'English',
  pl: 'Polski',
  es: 'Español',
  it: 'Italiano'
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { openBanner } = useCookieConsent();
  const { openContactModal } = useContactModal();
  const t = useTranslations('Footer');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as Locale) || 'en';

  const changeLanguage = (locale: Locale) => {
    router.push(pathname, { locale });
  };
  
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
            © {currentYear} Flashcards AI. {t('allRightsReserved')}.
          </p>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <button
              onClick={openContactModal}
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              <Mail size={16} />
              <span>{t('contact')}</span>
            </button>
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
            >
              {t('privacyPolicy')}
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
            >
              {t('termsOfUse')}
            </Link>
            <button
              onClick={() => openBanner()}
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              <Shield size={16} />
              <span>{t('cookieSettings')}</span>
            </button>
            <div className="flex items-center gap-2 ml-2">
              <Languages size={16} className="text-gray-500" />
              <div className="flex gap-1">
                {Object.keys(localeNames).map((locale) => (
                  <Button
                    key={locale}
                    onClick={() => changeLanguage(locale as Locale)}
                    variant="ghost"
                    className={`text-xs py-1 px-2 h-auto ${
                      currentLocale === locale ? "bg-purple-500/20 text-purple-400" : "text-gray-500"
                    }`}
                  >
                    {locale.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

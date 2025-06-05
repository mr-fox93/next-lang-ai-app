"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Locale } from '@/types/locale';

const localeNames = {
  en: 'English',
  pl: 'Polski',
  es: 'Español',
  it: 'Italiano'
};

export function LanguageSwitcher() {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as Locale || 'en';
  const langMenuRef = useRef<HTMLDivElement>(null);
  const langButtonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Set mounted state on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleLangMenu = () => {
    if (langButtonRef.current) {
      const rect = langButtonRef.current.getBoundingClientRect();
      setMenuPosition({ 
        top: rect.bottom + window.scrollY + 10, 
        left: rect.left + window.scrollX
      });
    }
    setLangMenuOpen(!langMenuOpen);
  };

  const changeLanguage = (locale: Locale) => {
    router.push(pathname, { locale });
    setLangMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node) &&
          langButtonRef.current && !langButtonRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative z-[9999]" ref={langMenuRef}>
      <Button 
        variant="ghost" 
        size="sm"
        className="bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-md border border-white/10 hover:border-purple-500/50 text-gray-300 hover:text-white transition-all flex items-center gap-1 relative shadow-lg shadow-purple-500/5 rounded-xl h-[48px] px-3"
        onClick={toggleLangMenu}
        ref={langButtonRef}
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-medium">{currentLocale.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
      </Button>
      {langMenuOpen && isMounted && createPortal(
        <div ref={langMenuRef} className="fixed w-48 rounded-md shadow-lg bg-black/95 ring-1 ring-black ring-opacity-5 p-1 backdrop-blur-md border border-white/10 z-[9999] overflow-visible" style={{
          top: menuPosition.top,
          left: menuPosition.left
        }}>
          <div className="py-1">
            {Object.entries(localeNames).map(([locale, name]) => (
              <button
                key={locale}
                className={`w-full text-left block px-4 py-2 text-sm ${locale === currentLocale ? 'text-purple-400 bg-purple-900/20' : 'text-gray-300'} hover:bg-white/10 hover:text-white rounded-md cursor-pointer`}
                onClick={() => changeLanguage(locale as Locale)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
} 
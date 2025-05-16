"use client";
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, Layers, Cpu, X, Globe, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import type React from "react";

type Locale = 'en' | 'pl' | 'es' | 'it';

const localeNames = {
  en: 'English',
  pl: 'Polski',
  es: 'Español',
  it: 'Italiano'
};

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = useTranslations('Navbar');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as Locale || 'en';
  const langMenuRef = useRef<HTMLDivElement>(null);
  const langButtonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleLangMenu = () => {
    if (langButtonRef.current) {
      const rect = langButtonRef.current.getBoundingClientRect();
      setMenuPosition({ 
        top: rect.bottom + window.scrollY + 10, 
        right: window.innerWidth - rect.right
      });
    }
    setLangMenuOpen(!langMenuOpen);
  };

  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const howItWorksSection = document.getElementById("how-it-works");
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: "smooth" });
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
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
    <div className="w-full px-4 pt-4">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="max-w-7xl mx-auto grid grid-cols-3 items-center px-6 py-4 backdrop-blur-sm border border-white/10 rounded-full bg-black/50"
        style={{ "--navbar-height": "72px" } as React.CSSProperties}
      >
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Layers className="w-8 h-8 text-purple-500 absolute" />
              <Cpu className="w-4 h-4 text-pink-500 absolute bottom-0 right-0" />
            </div>
            <p className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl font-bold">
              Languito
            </p>
          </Link>
        </div>

        <div className="hidden md:flex items-center justify-center space-x-8">
          <Link 
            href={isSignedIn ? "flashcards" : "sign-in"} 
            className="text-gray-300 hover:text-white transition-colors relative group"
          >
            {t('flashcards')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
          </Link>
          <a
            href="#how-it-works"
            onClick={scrollToHowItWorks}
            className="text-gray-300 hover:text-white transition-colors relative group"
          >
            {t('howItWorks')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
          </a>
        </div>

        <div className="hidden md:flex items-center justify-end space-x-4">
          {/* Language switcher */}
          <div className="relative z-[9999]" ref={langMenuRef}>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 relative"
              onClick={toggleLangMenu}
              ref={langButtonRef}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs">{currentLocale.toUpperCase()}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </Button>
            {langMenuOpen && isMounted && createPortal(
              <div ref={langMenuRef} className="fixed w-48 rounded-md shadow-lg bg-black/95 ring-1 ring-black ring-opacity-5 p-1 backdrop-blur-md border border-white/10 z-[9999] overflow-visible" style={{
                top: menuPosition.top,
                right: menuPosition.right
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

          {isSignedIn ? (
            <>
              <div className="flex items-center space-x-2">
                <UserButton />
                <span className="text-white font-medium">{user?.fullName}</span>
              </div>

              <SignOutButton>
                <Button className="relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity" />
                  <div className="absolute inset-0 bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">{t('logOut')}</span>
                </Button>
              </SignOutButton>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="sign-in">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity relative overflow-hidden group">
                  <div className="absolute inset-0 bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">{t('signIn')}</span>
                </Button>
              </Link>
              <Link href="https://nearby-mackerel-82.accounts.dev/sign-up">
                <Button className="relative overflow-hidden group bg-purple-700 hover:bg-purple-600 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-100 group-hover:opacity-0 transition-opacity" />
                  <span className="relative">{t('createAccount')}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white col-start-3 justify-self-end"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </motion.nav>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 z-[9999] bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="flex flex-col items-center justify-start px-6 py-10">
            <div className="flex flex-col items-center w-full">
              <Link
                href={isSignedIn ? "flashcards" : "sign-in"}
                className="w-full border-b border-white/10 py-6 text-center text-xl font-medium text-gray-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('flashcards')}
              </Link>
              <a
                href="#how-it-works"
                className="w-full border-b border-white/10 py-6 text-center text-xl font-medium text-gray-300 hover:text-white transition-colors"
                onClick={scrollToHowItWorks}
              >
                {t('howItWorks')}
              </a>
            </div>

            {/* Language selector for mobile */}
            <div className="mt-6 w-full">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(localeNames).map(([locale, name]) => (
                  <Button
                    key={locale}
                    variant="ghost"
                    className={`${locale === currentLocale ? 'text-purple-400 bg-purple-900/20' : 'text-gray-300'} hover:bg-white/10 hover:text-white`}
                    onClick={() => {
                      changeLanguage(locale as Locale);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-12 w-full max-w-sm">
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-white text-xl font-medium mb-1">
                    {t('yourAccount')}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t('manageAccount')}
                  </p>
                </div>

                {isSignedIn ? (
                  <>
                    <div className="flex items-center justify-center space-x-4 mb-6 p-4 rounded-lg bg-white/5">
                      <UserButton />
                      <span className="text-white font-medium">
                        {user?.fullName || "User"}
                      </span>
                    </div>
                    <SignOutButton>
                      <Button className="w-full h-12 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity" />
                        <div className="absolute inset-0 bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative">{t('logOut')}</span>
                      </Button>
                    </SignOutButton>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3 w-full">
                    <Link href="sign-in" className="w-full">
                      <Button className="w-full h-12 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity" />
                        <div className="absolute inset-0 bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative">{t('signIn')}</span>
                      </Button>
                    </Link>
                    <Link
                      href="https://nearby-mackerel-82.accounts.dev/sign-up"
                      className="w-full"
                    >
                      <Button className="w-full h-12 relative overflow-hidden group bg-purple-700 hover:bg-purple-600 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-100 group-hover:opacity-0 transition-opacity" />
                        <span className="relative">{t('createAccount')}</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
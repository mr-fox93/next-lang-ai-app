"use client";

import { useCallback, useMemo } from "react";
import { useUser, useSupabase } from "@/hooks";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, LogOut, Save, Heart, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { defaultLocale } from "@/i18n/routing";
import { Locale } from "@/types/locale";
import { ProgressPreview } from "@/components/progress-preview";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useDemoMode } from "@/hooks";
import { TopBarProps } from "@/types/component-props";
import { useTranslations } from "next-intl";

export function TopBar({
  variant,
  onMobileSidebarToggle,
  onExitDemo,
  onImportAndSignIn,
  isImporting = false,
  progressStats,
  onProgressClick,
}: TopBarProps) {
  const { isSignedIn, user } = useUser();
  const { signOut } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as Locale) || defaultLocale;
  const { isDemoMode, exitDemoMode } = useDemoMode();
  const t = useTranslations("TopBar");

  // Memoized handlers to prevent unnecessary re-renders
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [signOut, router]);

  const handleExitDemo = useCallback(() => {
    // Use hook function to exit demo mode
    exitDemoMode();
    
    // Redirect to home page
    router.push("/");
    
    // Call external handler if provided
    onExitDemo?.();
  }, [router, onExitDemo, exitDemoMode]);

  const isFavoritesRoute = pathname?.includes("/favorite");

  const handleFavoritesClick = useCallback(() => {
    router.push(isFavoritesRoute ? "/flashcards" : "/favorite", {
      locale: currentLocale
    });
  }, [router, isFavoritesRoute, currentLocale]);

  // Memoized user section to prevent unnecessary re-renders
  const userSection = useMemo(() => {
    switch (variant) {
      case "authenticated":
        if (isDemoMode && !isSignedIn) {
          return (
            <>
              <div className="relative overflow-hidden group bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-lg px-3 py-1.5">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative text-green-400 font-medium text-sm">DEMO MODE</span>
              </div>
              <Button
                onClick={handleExitDemo}
                className="border border-red-500 text-red-400 hover:text-red-300 hover:border-red-400 bg-transparent transition-colors"
              >
                Exit Demo
              </Button>
            </>
          );
        }
        
        if (isSignedIn) {
          return (
            <>
              {/* Simple User Avatar */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.fullName?.charAt(0)?.toUpperCase() || user?.primaryEmailAddress?.emailAddress?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-white font-medium">{user?.fullName}</span>
              </div>
              <Button
                variant="ghost"
                className="text-white"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          );
        }
        return null;

      case "demo":
        return (
          <>
            <div className="relative overflow-hidden group bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-lg px-3 py-1.5">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-green-400 font-medium text-sm">DEMO MODE</span>
            </div>
            <Button
              onClick={handleExitDemo}
              className="border border-red-500 text-red-400 hover:text-red-300 hover:border-red-400 bg-transparent transition-colors"
            >
              Exit Demo
            </Button>
          </>
        );

      case "guest":
        return (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 0 rgba(168, 85, 247, 0.4)",
                "0 0 10px rgba(168, 85, 247, 0.7)",
                "0 0 0 rgba(168, 85, 247, 0.4)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              },
            }}
          >
            <Button
              variant="outline"
              className="text-white border-purple-500 hover:bg-purple-500/20 bg-gradient-to-r from-purple-500/10 to-purple-500/0"
              onClick={onImportAndSignIn}
              disabled={isImporting}
            >
              <Save className="w-4 h-4 mr-2 text-purple-400" />
              {isImporting ? "Importing..." : "Log in to save flashcards"}
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  }, [variant, isDemoMode, isSignedIn, user?.fullName, handleExitDemo, handleSignOut, onImportAndSignIn, isImporting]);

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center p-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden text-white bg-purple-700/80 border-purple-500 hover:bg-purple-600 hover:border-purple-400 mr-2"
            onClick={onMobileSidebarToggle}
          >
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
          
          {/* Mobile: Show only DEMO MODE indicator */}
          <div className="md:hidden">
            {(variant === "demo" || (variant === "authenticated" && isDemoMode && !isSignedIn)) && (
              <div className="relative overflow-hidden group bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-lg px-2 py-1">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative text-green-400 font-medium text-xs">DEMO</span>
              </div>
            )}
          </div>
          
          {/* Desktop: Show full user section */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {userSection}
          </div>
        </div>
      </div>

      {/* Desktop only: Favorites shortcut + Language Switcher */}
      <div className="hidden md:flex fixed top-2 right-[240px] z-10 items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-md border border-white/10 hover:border-purple-500/50 text-gray-300 hover:text-white transition-all flex items-center gap-1 relative shadow-lg shadow-purple-500/5 rounded-xl h-[48px] px-3"
          onClick={handleFavoritesClick}
        >
          {isFavoritesRoute ? (
            <BookOpen className="h-4 w-4" />
          ) : (
            <Heart className="h-4 w-4 text-red-400" />
          )}
          <span className="text-xs font-medium">
            {isFavoritesRoute ? t("flashcards") : t("favorites")}
          </span>
        </Button>
        <LanguageSwitcher />
      </div>

      {/* Progress Preview - visible on all devices */}
      <ProgressPreview 
        progressStats={progressStats}
        isGuestMode={variant === "guest"}
        onProgressClick={onProgressClick}
      />
    </>
  );
} 
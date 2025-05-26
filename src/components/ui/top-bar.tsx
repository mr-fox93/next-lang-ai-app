"use client";

import { useCallback, useMemo } from "react";
import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, LogOut, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ProgressPreview } from "@/components/progress-preview";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { UserProgressStats } from "@/types/progress";
import { useDemoMode } from "@/hooks";

export type TopBarVariant = "authenticated" | "demo" | "guest";

interface TopBarProps {
  variant: TopBarVariant;
  onMobileSidebarToggle: () => void;
  onExitDemo?: () => void;
  onImportAndSignIn?: () => void;
  isImporting?: boolean;
  progressStats?: {
    success: boolean;
    data?: UserProgressStats;
    error?: string;
  };
  onProgressClick?: () => void;
}

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
  const { signOut } = useClerk();
  const router = useRouter();
  const { isDemoMode, exitDemoMode } = useDemoMode();

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
              <UserButton />
              <span className="text-white font-medium">{user?.fullName}</span>
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

      {/* Desktop only: Language Switcher positioned next to Progress Preview */}
      <div className="hidden md:block fixed top-2 right-[240px] z-10">
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
"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useDemoMode } from "@/hooks";

export function ProgressTopBar() {
  const { isSignedIn, user } = useUser();
  const t = useTranslations('Progress');
  const { isDemoMode } = useDemoMode();

  return (
    <header className="border-b border-white/10 p-3 bg-black">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="flashcards">
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30"
            >
              {t('backToLearning')}
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          {/* Show UserButton only for real users, not for demo */}
          {isSignedIn && (
            <>
              <UserButton />
              <span className="text-white font-medium hidden sm:inline-block">
                {user?.fullName}
              </span>
            </>
          )}
          {/* Show demo mode info */}
          {isDemoMode && !isSignedIn && (
            <span className="text-green-400 font-medium text-sm">
              DEMO MODE
            </span>
          )}
        </div>
      </div>
    </header>
  );
} 
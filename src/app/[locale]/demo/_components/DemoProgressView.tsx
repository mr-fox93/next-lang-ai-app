"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DemoProgressViewProps } from "@/shared/types/demo";
import { DemoModeIndicator } from "./DemoModeIndicator";
import { useDemoProgress } from "@/shared/hooks/useDemoProgress";

interface DemoProgressStats {
  totalFlashcards: number;
  masteredFlashcards: number;
  inProgressFlashcards: number;
  untouchedFlashcards: number;
}

export function DemoProgressView({ onBackClick, onClearProgress, onSignInClick }: DemoProgressViewProps) {
  const { getProgressStats, clearProgress, isLoading } = useDemoProgress();
  const [progressStats, setProgressStats] = useState<DemoProgressStats>({
    totalFlashcards: 0,
    masteredFlashcards: 0,
    inProgressFlashcards: 0,
    untouchedFlashcards: 0,
  });

  useEffect(() => {
    const loadProgressStats = async () => {
      // Try to get flashcard IDs from localStorage to calculate stats
      try {
        const storedProgress = localStorage.getItem("demo_progress");
        if (storedProgress) {
          const progressData = JSON.parse(storedProgress);
          const flashcardIds = Object.keys(progressData).map(id => parseInt(id));
          
          if (flashcardIds.length > 0) {
            const stats = await getProgressStats(flashcardIds);
            setProgressStats(stats);
          }
        }
      } catch (error) {
        console.error("Error loading progress stats:", error);
      }
    };

    loadProgressStats();
  }, [getProgressStats]);

  const handleClearProgress = async () => {
    try {
      await clearProgress();
      setProgressStats({
        totalFlashcards: 0,
        masteredFlashcards: 0,
        inProgressFlashcards: 0,
        untouchedFlashcards: 0,
      });
      onClearProgress();
    } catch (error) {
      console.error("Error clearing progress:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBackClick}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Demo
          </Button>
          
          <DemoModeIndicator />
        </div>

        <h1 className="text-3xl font-bold mb-8">Your Demo Learning Progress</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Total Flashcards</h3>
            <p className="text-3xl font-bold text-white">{progressStats.totalFlashcards}</p>
          </div>

          <div className="bg-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
            <h3 className="text-lg font-medium text-green-300 mb-2">Mastered</h3>
            <p className="text-3xl font-bold text-green-400">{progressStats.masteredFlashcards}</p>
          </div>

          <div className="bg-yellow-800/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-300 mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-400">{progressStats.inProgressFlashcards}</p>
          </div>

          <div className="bg-gray-800/20 backdrop-blur-sm border border-gray-500/30 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Untouched</h3>
            <p className="text-3xl font-bold text-gray-400">{progressStats.untouchedFlashcards}</p>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Demo Mode Notice</h2>
          <p className="text-gray-300 mb-4">
            This is demo progress stored locally in your browser. Your progress will be lost when you clear browser data.
            Sign in to save your real progress across devices and sessions.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={handleClearProgress}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              disabled={isLoading}
            >
              {isLoading ? "Clearing..." : "Clear Demo Progress"}
            </Button>
            <Button
              onClick={onSignInClick}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Sign In to Save Progress
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
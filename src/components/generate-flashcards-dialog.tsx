"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface GenerateFlashcardsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  categoryName: string | null;
  isGenerating: boolean;
}

export function GenerateFlashcardsDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  categoryName,
  isGenerating,
}: GenerateFlashcardsDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-br from-purple-950/95 to-purple-900/95 border-purple-600/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-fuchsia-500/20 to-purple-600/30 blur-xl" />
        </motion.div>

        <AlertDialogHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="text-fuchsia-400"
            >
              <Sparkles className="h-5 w-5" />
            </motion.div>
            <AlertDialogTitle className="text-fuchsia-100">
              Generate New Flashcards
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-purple-200/80">
            Would you like to generate 5 new flashcards for the{" "}
            <span className="font-medium text-fuchsia-300">
              &quot;{categoryName}&quot;
            </span>{" "}
            category? This will help expand your vocabulary.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="relative z-10 border-t border-purple-500/20 pt-4 mt-2">
          <AlertDialogCancel className="bg-purple-950 hover:bg-purple-900 text-purple-200 border-purple-700/30 hover:border-purple-600/50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isGenerating}
            className="bg-gradient-to-r from-fuchsia-600/90 to-purple-600/90 hover:from-fuchsia-500 hover:to-purple-500 text-white border-0 shadow-md shadow-purple-900/50"
          >
            {isGenerating ? "Generating..." : "Generate Flashcards"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

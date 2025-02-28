"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface CategoryButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}

export function CategoryButton({
  label,
  icon: Icon,
  onClick,
  disabled = false
}: CategoryButtonProps) {
  return (
    <Button
      variant="ghost"
      className="h-10 sm:h-12 px-3 sm:px-6 bg-white/[0.08] hover:bg-white/[0.12] border-2 border-white/10 rounded-lg group transition-all duration-300 flex-1 min-w-[120px] max-w-[160px] sm:max-w-none"
      onClick={onClick}
      disabled={disabled}
    >
      <motion.div
        initial={{ scale: 1 }}
        className="flex items-center gap-1 sm:gap-2"
      >
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
        <span className="text-white text-sm sm:text-base group-hover:text-purple-400 transition-colors">
          {label}
        </span>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg -z-10 blur-sm" />
    </Button>
  );
} 
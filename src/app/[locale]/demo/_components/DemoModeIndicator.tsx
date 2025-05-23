"use client";

import { DemoModeIndicatorProps } from "@/shared/types/demo";
import { cn } from "@/lib/utils";

export function DemoModeIndicator({ className }: DemoModeIndicatorProps) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        <span className="text-amber-400 text-xs font-medium tracking-wide">Demo</span>
      </div>
    </div>
  );
} 
"use client";

import { X } from "lucide-react";

interface ErrorMessageProps {
  message: string | null;
  onClose?: () => void;
}

export function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-center relative">
      {message}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-1 right-1 p-1 hover:bg-red-500/20 rounded-full"
          aria-label="Zamknij komunikat o błędzie"
        >
          <X className="h-4 w-4 text-red-400" />
        </button>
      )}
    </div>
  );
} 
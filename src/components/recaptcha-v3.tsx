"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { useRecaptchaV3 } from "@/hooks/useRecaptchaV3";

interface RecaptchaV3Props {
  onVerified: (token: string) => void;
  onError: (error: string) => void;
  trigger?: boolean; // When true, executes reCAPTCHA
  action?: string; // reCAPTCHA action name
}

export function RecaptchaV3({
  onVerified,
  onError,
  trigger = false,
  action = "generate_flashcards"
}: RecaptchaV3Props) {
  const { isLoaded, error, executeRecaptcha } = useRecaptchaV3({ action });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerification = useCallback(async () => {
    setIsVerifying(true);
    
    try {
      const token = await executeRecaptcha();
      
      if (token) {
        setIsVerified(true);
        onVerified(token);
      } else {
        onError("Failed to get reCAPTCHA token");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "reCAPTCHA verification failed";
      onError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  }, [executeRecaptcha, onVerified, onError]);

  useEffect(() => {
    if (trigger && isLoaded && !isVerifying && !isVerified) {
      handleVerification();
    }
  }, [trigger, isLoaded, isVerifying, isVerified, handleVerification]);

  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  // Show loading state while reCAPTCHA is loading or verifying
  if (!isLoaded || isVerifying) {
    return (
      <div className="flex items-center justify-center gap-2 text-blue-200 text-sm">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-blue-400"
        >
          <Shield className="h-4 w-4" />
        </motion.div>
        <span>
          {!isLoaded ? "Loading security check..." : "Verifying you're human..."}
        </span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded-lg border border-red-500/30"
      >
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </motion.div>
    );
  }

  // Show success state
  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-green-400 text-sm"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle className="h-4 w-4" />
        </motion.div>
        <span>Security verified!</span>
      </motion.div>
    );
  }

  // Ready state - reCAPTCHA is loaded and ready
  return (
    <div className="flex items-center justify-center gap-2 text-blue-300 text-sm">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-blue-400"
      >
        <Shield className="h-4 w-4" />
      </motion.div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="text-blue-500"
      >
        <Sparkles className="h-3 w-3" />
      </motion.div>
      <span>Security ready</span>
    </div>
  );
} 
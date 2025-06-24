"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/shared/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Mail, Send, AlertCircle, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { z } from "zod";
import { Filter } from "bad-words";
import { debugLog, debugError } from '@/utils/debug';

interface ContactFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Email validation schema with custom error messages
const emailSchema = z
  .string()
  .email({
    message: "Invalid email format",
  });

// Additional Polish profanities and threatening words
const additionalProfanities = [
  // Polish profanities (obscured with * to avoid offensiveness)
  'k*rwa', 'ch*j', 'p*erdole', 'j*bać', 'p*zda', 'sk*rwysyn', 
  // Threatening words
  'zabije', 'zabiję', 'zabić', 'śmierć', 'grożę', 'groźba', 'nienawidzę', 'nienawiść'
];



export function ContactFormModal({ isOpen, onOpenChange }: ContactFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<{
    success: boolean;
    message: string;
    detail?: string;
  } | null>(null);
  const t = useTranslations('ContactForm');
  
  // Create enhanced filter with additional words once
  const filter = useMemo(() => {
    const customFilter = new Filter();
    // Add custom words to the filter
    customFilter.addWords(...additionalProfanities);
    return customFilter;
  }, []);
  
  // Validate email as user types
  useEffect(() => {
    if (email) {
      try {
        emailSchema.parse(email);
        setEmailError(null);
      } catch {
        setEmailError(t('emailValidationError'));
      }
    } else {
      setEmailError(null);
    }
  }, [email, t]);
  
  // More sophisticated content check
  const validateMessage = useCallback((text: string): boolean => {
    try {
      // Check using bad-words filter
      if (filter.isProfane(text)) {
        setMessageError(t('offensiveContentError'));
        return false;
      }
      
      // Additional checks for patterns that might evade the filter
      // Check for patterns with numbers replacing letters (l33t speak)
      const l33tPatterns = [
        /[kc]+(\d|[^\w\s])*[u4]+(\d|[^\w\s])*r+(\d|[^\w\s])*[v\/]+(\d|[^\w\s])*[a@4]+/i, // k*rwa variations
        /[fd]+(\d|[^\w\s])*[u4]+(\d|[^\w\s])*[ck]+(\d|[^\w\s])*[k]*/i, // f*ck variations
        /[a@4]+(\d|[^\w\s])*[s$5]+(\d|[^\w\s])*[s$5]+/i, // a*s variations
        /[b8]+(\d|[^\w\s])*[i1]+(\d|[^\w\s])*[t+]+(\d|[^\w\s])*[c]+(\d|[^\w\s])*[h]+/i, // b*tch variations
      ];
      
      for (const pattern of l33tPatterns) {
        if (pattern.test(text)) {
          setMessageError(t('offensiveContentError'));
          return false;
        }
      }
      
      // Check for threatening content
      const threateningPatterns = [
        /zabij[e|ę]|zabić|śmierć|gro[żz][e|ę]|nienavwidz[e|ę]/i,
      ];
      
      for (const pattern of threateningPatterns) {
        if (pattern.test(text)) {
          setMessageError(t('offensiveContentError'));
          return false;
        }
      }
      
      setMessageError(null);
      return true;
    } catch (err) {
      debugError("Error checking content:", err);
      return true; // Allow the message if the filter fails
    }
  }, [filter, t]);
  
  // Check message as user types
  useEffect(() => {
    if (message) {
      validateMessage(message);
    } else {
      setMessageError(null);
    }
  }, [message, validateMessage, t]);
  
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault(); // Zapobiegaj domyślnemu zamknięciu modalu
    
    // Validate inputs before sending
    try {
      emailSchema.parse(email);
    } catch {
      setEmailError(t('emailValidationError'));
      return;
    }
    
    if (!validateMessage(message)) {
      return;
    }
    
    // Start AI moderation process
    setIsCheckingAI(true);
    
    try {
      debugLog("Sending message...");
      
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message
        }),
      });
      
      debugLog("Response status:", response.status);
      const data = await response.json();
      debugLog("Response data:", data);
      
      // AI checking is complete
      setIsCheckingAI(false);
      
      if (response.ok) {
        debugLog("Setting success state");
        setIsSending(true);
        setIsSent(true);
        setResponseStatus({
          success: true,
          message: t('messageSent')
        });
      } else {
        debugLog("Setting error state");
        // Handle specific error codes
        let errorMessage = t('errorGeneric');
        
        if (data.error) {
          if (data.error.statusCode === 403) {
            errorMessage = t('errorNoApiKey');
          } else if (data.error.statusCode === 400 && data.error.message?.includes("email")) {
            errorMessage = t('errorInvalidEmail');
          }
          
          // Display detailed reason from AI moderation if available
          const detail = data.error.detail;
          
          setResponseStatus({
            success: false,
            message: errorMessage,
            detail: detail
          });
        } else {
          setResponseStatus({
            success: false,
            message: errorMessage
          });
        }
        
        setIsSent(true); // Pokaż komunikat nawet gdy jest błąd
      }
    } catch (err) {
      debugError("Error sending message:", err);
      setIsCheckingAI(false);
      setResponseStatus({
        success: false,
        message: t('errorGeneric')
      });
      setIsSent(true); // Pokaż komunikat również przy wyjątku
    } finally {
      debugLog("Setting isSending to false");
      setIsSending(false);
    }
  };
  
  const resetForm = () => {
    setName("");
    setEmail("");
    setMessage("");
    setEmailError(null);
    setMessageError(null);
    setIsSent(false);
    setIsSending(false);
    setIsCheckingAI(false);
    setResponseStatus(null);
  };
  
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300);
  };

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Zapobiegaj automatycznemu zamknięciu gdy czekamy na odpowiedź
        if (!open && isSending) return;
        onOpenChange(open);
      }}
    >
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
              initial={{ y: -2 }}
              animate={{ y: 2 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              className="text-fuchsia-400"
            >
              {isSent ? 
                (responseStatus?.success ? 
                  <CheckCircle className="h-5 w-5 text-green-400" /> : 
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : 
                <Mail className="h-5 w-5" />
              }
            </motion.div>
            <AlertDialogTitle className="text-fuchsia-100">
              {isSent ? 
                (responseStatus?.success ? t('thankYou') : t('error')) : 
                t('title')
              }
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-purple-200/80">
            {isSent ? "" : t('description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {!isSent ? (
          <>
            <div className="grid gap-4 mt-2 relative z-10">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm text-purple-200">
                  {t('nameLabel')}
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-purple-700/30 bg-purple-950/50 focus-visible:ring-purple-500 text-white placeholder:text-purple-400/50"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm text-purple-200">
                  {t('emailLabel')}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`border-purple-700/30 bg-purple-950/50 focus-visible:ring-purple-500 text-white placeholder:text-purple-400/50 ${
                    emailError ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {emailError && (
                  <p className="text-xs text-red-400 mt-1">{emailError}</p>
                )}
              </div>
              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm text-purple-200">
                  {t('messageLabel')}
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('messagePlaceholder')}
                  className={`border-purple-700/30 bg-purple-950/50 focus-visible:ring-purple-500 min-h-[120px] text-white placeholder:text-purple-400/50 ${
                    messageError ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {messageError && (
                  <p className="text-xs text-red-400 mt-1">{messageError}</p>
                )}
              </div>
            </div>
            
            <AlertDialogFooter className="relative z-10 border-t border-purple-500/20 pt-4 mt-4">
              <AlertDialogCancel 
                onClick={handleClose}
                className="bg-purple-950 hover:bg-purple-900 text-purple-200 border-purple-700/30 hover:border-purple-600/50"
              >
                {t('cancel')}
              </AlertDialogCancel>
              <button
                onClick={handleSubmit}
                disabled={isSending || isCheckingAI || !name || !email || !message || !!emailError || !!messageError}
                className="bg-gradient-to-r from-fuchsia-600/90 to-purple-600/90 hover:from-fuchsia-500 hover:to-purple-500 text-white border-0 rounded-md px-4 py-2 shadow-md shadow-purple-900/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingAI ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      {t('aiChecking')}
                    </div>
                  </>
                ) : isSending ? (
                  t('sending')
                ) : (
                  <>
                    {t('send')} <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <div className="py-6 text-center relative z-10">
              {responseStatus ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4 }}
                  className={`p-6 rounded-lg mb-4 relative overflow-hidden ${
                    responseStatus.success 
                      ? 'bg-gradient-to-br from-purple-900/80 to-fuchsia-900/80 border border-purple-500/30' 
                      : 'bg-gradient-to-br from-purple-900/70 to-rose-900/70 border border-red-500/30'
                  }`}
                >
                  {/* Efekt świetlny w tle */}
                  <div className="absolute inset-0 z-0">
                    <motion.div 
                      className={`absolute inset-0 opacity-20 blur-xl ${
                        responseStatus.success 
                          ? 'bg-gradient-to-r from-green-400 via-purple-400 to-fuchsia-400' 
                          : 'bg-gradient-to-r from-red-400 to-rose-300'
                      }`}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      }}
                    />
                  </div>
                  
                  {responseStatus.success ? (
                    <div className="py-5 relative z-10">
                      {/* Tytuł sukcesu */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 20,
                          delay: 0.1 
                        }}
                        className="text-center mb-4"
                      >
                        <h2 className="text-3xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-200 to-teal-300">
                          {t('successTitle')}
                        </h2>
                      </motion.div>

                      <div className="flex justify-center mb-4 relative">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 15,
                            delay: 0.2
                          }}
                          className="relative"
                        >
                          <CheckCircle className="h-16 w-16 text-green-400 flex-shrink-0" />
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-green-400 opacity-70 blur-md"
                            animate={{ 
                              scale: [1, 1.3, 1],
                              opacity: [0.3, 0.5, 0.3] 
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              repeatType: "reverse" 
                            }}
                          />
                        </motion.div>

                        {/* Gwiazda 1 */}
                        <motion.div
                          className="absolute -top-2 -right-2"
                          initial={{ scale: 0, rotate: 0 }}
                          animate={{ 
                            scale: [0, 1, 0.8],
                            rotate: [0, 20],
                            opacity: [0, 1, 0.8]
                          }}
                          transition={{ 
                            duration: 0.5,
                            delay: 0.4
                          }}
                        >
                          <div className="relative">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#10B981" stroke="#10B981"/>
                            </svg>
                            <motion.div 
                              className="absolute inset-0 rounded-full bg-emerald-400 opacity-70 blur-md"
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.4, 0.8, 0.4] 
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: 0.2
                              }}
                            />
                          </div>
                        </motion.div>

                        {/* Gwiazda 2 */}
                        <motion.div
                          className="absolute top-6 -left-1"
                          initial={{ scale: 0, rotate: 0 }}
                          animate={{ 
                            scale: [0, 0.8, 0.6],
                            rotate: [0, -15],
                            opacity: [0, 1, 0.8]
                          }}
                          transition={{ 
                            duration: 0.5,
                            delay: 0.6
                          }}
                        >
                          <div className="relative">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#8B5CF6" stroke="#8B5CF6"/>
                            </svg>
                            <motion.div 
                              className="absolute inset-0 rounded-full bg-purple-400 opacity-70 blur-md"
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.4, 0.7, 0.4] 
                              }}
                              transition={{ 
                                duration: 1.8, 
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: 0.4
                              }}
                            />
                          </div>
                        </motion.div>

                        {/* Gwiazda 3 */}
                        <motion.div
                          className="absolute bottom-0 right-2"
                          initial={{ scale: 0, rotate: 0 }}
                          animate={{ 
                            scale: [0, 0.7, 0.5],
                            rotate: [0, 25],
                            opacity: [0, 1, 0.8]
                          }}
                          transition={{ 
                            duration: 0.5,
                            delay: 0.8
                          }}
                        >
                          <div className="relative">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#EC4899" stroke="#EC4899"/>
                            </svg>
                            <motion.div 
                              className="absolute inset-0 rounded-full bg-pink-400 opacity-70 blur-md"
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.4, 0.7, 0.4] 
                              }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: 0.6
                              }}
                            />
                          </div>
                        </motion.div>
                      </div>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="text-center text-green-200 mx-auto max-w-sm"
                      >
                        {responseStatus.message}
                      </motion.p>
                      
                      {/* Dodatkowe efekty */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Animowane błyski/promienie */}
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute rounded-full bg-green-300"
                            style={{
                              width: Math.random() * 3 + 1 + 'px',
                              height: Math.random() * 3 + 1 + 'px',
                              top: Math.random() * 100 + '%',
                              left: Math.random() * 100 + '%',
                            }}
                            animate={{
                              opacity: [0, 0.8, 0],
                              scale: [0, 1, 0],
                            }}
                            transition={{
                              duration: Math.random() * 2 + 1,
                              repeat: Infinity,
                              delay: Math.random() * 2,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="mt-1">
                        <motion.div
                          initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            rotate: 0, 
                            opacity: 1 
                          }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 15 
                          }}
                          className="relative"
                        >
                          <AlertCircle className="h-7 w-7 text-rose-400 flex-shrink-0" />
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-rose-500 opacity-70 blur-sm"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.4, 0.3] 
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity,
                              repeatType: "reverse" 
                            }}
                          />
                        </motion.div>
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h3 className="font-medium mb-1 text-lg text-rose-300">
                          {t('error')}
                        </h3>
                        <p className="text-sm text-rose-200/90">
                          {responseStatus.message}
                        </p>
                        {responseStatus.detail && (
                          <p className="mt-2 text-xs text-rose-200/80 p-2 bg-rose-950/30 rounded border border-rose-500/20">
                            {responseStatus.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4 }}
                  className="p-6 rounded-lg mb-4 relative overflow-hidden bg-gradient-to-br from-purple-900/70 to-fuchsia-900/70 border border-green-500/30"
                >
                  {/* Efekt świetlny w tle */}
                  <div className="absolute inset-0 z-0">
                    <motion.div 
                      className="absolute inset-0 opacity-20 blur-xl bg-gradient-to-r from-green-400 to-emerald-300"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      }}
                    />
                  </div>
                  
                  <div className="flex gap-4 items-start relative z-10">
                    <div className="mt-1">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 15 
                        }}
                        className="relative"
                      >
                        <CheckCircle className="h-7 w-7 text-green-400 flex-shrink-0" />
                        <motion.div 
                          className="absolute inset-0 rounded-full bg-green-400 opacity-70 blur-sm"
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.5, 0.3] 
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                        />
                      </motion.div>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h3 className="font-medium mb-1 text-lg text-green-300">
                        {t('thankYou')}
                      </h3>
                      <p className="text-sm text-green-200/90">
                        {t('messageSent')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Animowane gwiazdki/błyski */}
                  <motion.div 
                    className="absolute h-2 w-2 rounded-full bg-green-300"
                    style={{ top: '15%', right: '10%' }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0.8, 1.2, 0.8] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.2
                    }}
                  />
                  <motion.div 
                    className="absolute h-1.5 w-1.5 rounded-full bg-green-200"
                    style={{ bottom: '20%', left: '15%' }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0.8, 1.2, 0.8] 
                    }}
                    transition={{ 
                      duration: 1.8, 
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.5
                    }}
                  />
                </motion.div>
              )}
            </div>
            <AlertDialogFooter className="relative z-10 border-t border-purple-500/20 pt-4 mt-2">
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-fuchsia-600/90 to-purple-600/90 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-md py-2 px-4 border-0 shadow-md shadow-purple-900/50 flex items-center justify-center gap-2 group"
              >
                <span>{t('backButton')}</span>
                <motion.div
                  initial={{ x: 0, opacity: 0.5 }}
                  animate={{ x: [0, 3, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: "loop" 
                  }}
                >
                  <ArrowRight className="h-4 w-4 text-white/80 group-hover:text-white" />
                </motion.div>
              </motion.button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
} 
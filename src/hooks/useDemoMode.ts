import { useState, useEffect, useCallback } from 'react';
import { demoModeService } from '@/core/useCases/session';

/**
 * Custom hook for demo mode management in React components
 * Uses the demo mode service from clean architecture
 */
export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkDemoMode = useCallback(() => {
    if (typeof document === 'undefined') return false;
    
    const cookies = document.cookie;
    const isDemo = demoModeService.isDemoMode(cookies);
    setIsDemoMode(isDemo);
    setIsLoading(false);
    return isDemo;
  }, []);

  useEffect(() => {
    // Initial check
    checkDemoMode();
    
    // Periodic check for cookie changes
    const interval = setInterval(() => {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie;
        const isDemo = demoModeService.isDemoMode(cookies);
        setIsDemoMode(isDemo);
        // Po pierwszym sprawdzeniu nie ustawiamy już isLoading na true
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [checkDemoMode]);

  const exitDemoMode = useCallback(() => {
    // Clear demo mode cookie
    document.cookie = demoModeService.clearDemoMode();
    setIsDemoMode(false);
  }, []);

  return {
    isDemoMode,
    isLoading,
    checkDemoMode,
    exitDemoMode,
  };
} 
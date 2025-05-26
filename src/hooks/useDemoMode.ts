import { useState, useEffect, useCallback } from 'react';
import { demoModeService } from '@/core/useCases/session';

/**
 * Custom hook for demo mode management in React components
 * Uses the demo mode service from clean architecture
 */
export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const checkDemoMode = useCallback(() => {
    if (typeof document === 'undefined') return false;
    
    const cookies = document.cookie;
    const isDemo = demoModeService.isDemoMode(cookies);
    setIsDemoMode(isDemo);
    return isDemo;
  }, []);

  useEffect(() => {
    // Initial check
    checkDemoMode();
    
    // Periodic check for cookie changes
    const interval = setInterval(checkDemoMode, 1000);
    
    return () => clearInterval(interval);
  }, [checkDemoMode]);

  const exitDemoMode = useCallback(() => {
    // Clear demo mode cookie
    document.cookie = demoModeService.clearDemoMode();
    setIsDemoMode(false);
  }, []);

  return {
    isDemoMode,
    checkDemoMode,
    exitDemoMode,
  };
} 
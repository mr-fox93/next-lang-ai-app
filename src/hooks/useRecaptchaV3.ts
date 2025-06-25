import { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface UseRecaptchaV3Options {
  siteKey?: string;
  action?: string;
}

interface UseRecaptchaV3Return {
  isLoaded: boolean;
  error: string | null;
  executeRecaptcha: (customAction?: string) => Promise<string | null>;
}

export function useRecaptchaV3({ 
  siteKey, 
  action = 'submit' 
}: UseRecaptchaV3Options = {}): UseRecaptchaV3Return {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recaptchaSiteKey = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!recaptchaSiteKey) {
      setError('reCAPTCHA site key not configured');
      return;
    }

    // Check if script is already loaded
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      existingScript.addEventListener('error', () => setError('Failed to load reCAPTCHA script'));
      return;
    }

    // Load Google reCAPTCHA v3 script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsLoaded(true);
        });
      } else {
        setError('reCAPTCHA failed to initialize');
      }
    };
    
    script.onerror = () => {
      setError('Failed to load reCAPTCHA script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      const scriptToRemove = document.querySelector('script[src*="recaptcha"]');
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [recaptchaSiteKey]);

  const executeRecaptcha = useCallback(async (customAction?: string): Promise<string | null> => {
    if (!recaptchaSiteKey) {
      setError('reCAPTCHA site key not configured');
      return null;
    }

    if (!isLoaded || !window.grecaptcha) {
      setError('reCAPTCHA not loaded yet');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(recaptchaSiteKey, {
        action: customAction || action
      });
      
      if (!token) {
        setError('Failed to get reCAPTCHA token');
        return null;
      }

      setError(null);
      return token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'reCAPTCHA execution failed';
      setError(errorMessage);
      return null;
    }
  }, [recaptchaSiteKey, isLoaded, action]);

  return {
    isLoaded,
    error,
    executeRecaptcha
  };
} 
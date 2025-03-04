"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ErrorMessage } from './error-message';

interface LoadingErrorContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  globalError: string | null;
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;
}

const LoadingErrorContext = createContext<LoadingErrorContextType | undefined>(undefined);

interface LoadingErrorProviderProps {
  children: ReactNode;
}

export function LoadingErrorProvider({ children }: LoadingErrorProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const clearGlobalError = () => setGlobalError(null);

  return (
    <LoadingErrorContext.Provider 
      value={{ 
        isLoading, 
        setIsLoading, 
        globalError, 
        setGlobalError,
        clearGlobalError
      }}
    >
      {isLoading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
      
      {globalError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <ErrorMessage 
            message={globalError} 
            onClose={clearGlobalError} 
          />
        </div>
      )}
      
      {children}
    </LoadingErrorContext.Provider>
  );
}

export function useLoadingError() {
  const context = useContext(LoadingErrorContext);
  
  if (context === undefined) {
    throw new Error('useLoadingError must be used within a LoadingErrorProvider');
  }
  
  return context;
} 
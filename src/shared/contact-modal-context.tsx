"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ContactFormModal } from '@/components/contact-form-modal';

// Create a context to manage contact modal state
type ContactModalContextType = {
  isContactModalOpen: boolean;
  openContactModal: () => void;
  closeContactModal: () => void;
};

const ContactModalContext = createContext<ContactModalContextType | undefined>(undefined);

// Provider component
export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const openContactModal = useCallback(() => {
    setIsContactModalOpen(true);
  }, []);

  const closeContactModal = useCallback(() => {
    setIsContactModalOpen(false);
  }, []);

  return (
    <ContactModalContext.Provider
      value={{
        isContactModalOpen,
        openContactModal,
        closeContactModal,
      }}
    >
      {children}
      <ContactFormModal
        isOpen={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
      />
    </ContactModalContext.Provider>
  );
}

// Custom hook to use the contact modal context
export function useContactModal() {
  const context = useContext(ContactModalContext);
  if (context === undefined) {
    throw new Error('useContactModal must be used within a ContactModalProvider');
  }
  return context;
} 
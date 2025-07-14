import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks';

interface UseAuthFormsProps {
  isSignUp?: boolean;
}

export function useAuthForms({ isSignUp = false }: UseAuthFormsProps = {}) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  
  const { signInWithOtpCode, verifyOtpCode, signInWithOAuth } = useSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithOtpCode(email);
      if (error) {
        setError(error.message);
      } else {
        setCodeSent(true);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !email) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await verifyOtpCode(email, code);
      if (error) {
        if (error.message.includes('invalid') || error.message.includes('wrong')) {
          setError('Invalid verification code');
        } else if (error.message.includes('expired')) {
          setError('Verification code has expired');
        } else {
          setError(error.message);
        }
      } else if (data?.session) {
        // Success! Redirect to flashcards
        window.location.href = '/en/flashcards';
      }
    } catch (err) {
      console.error('Code verification error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithOAuth('google');
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError(`An unexpected error occurred with Google ${isSignUp ? 'sign up' : 'sign in'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithOAuth('discord');
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error('Discord auth error:', err);
      setError(`An unexpected error occurred with Discord ${isSignUp ? 'sign up' : 'sign in'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCodeSent(false);
    setCode('');
    setError(null);
  };

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === 6 && !loading && codeSent) {
      handleCodeVerification({ preventDefault: () => {} } as React.FormEvent);
    }
  }, [code, loading, codeSent]);

  return {
    // State
    email,
    fullName,
    code,
    loading,
    error,
    codeSent,
    
    // Setters
    setEmail,
    setFullName,
    setCode,
    
    // Handlers
    handleSubmit,
    handleCodeVerification,
    handleGoogleAuth,
    handleDiscordAuth,
    resetForm
  };
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabase, useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { validatePassword, sanitizePassword } from '@/utils/validation';
import { debugError } from '@/utils/debug';
import { ResetPasswordFormProps, ResetPasswordState } from '@/types/auth';

export function ResetPasswordForm({ onBack }: ResetPasswordFormProps = {}) {
  // Use centralized state type instead of individual useState calls
  const [state, setState] = useState<ResetPasswordState>({
    password: '',
    confirmPassword: '',
    loading: false,
    error: null,
    success: false,
    attemptCount: 0,
  });
  
  // Keep these separate as they're UI-specific
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  
  const { updatePassword } = useSupabase();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for URL parameters and session
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (errorParam && errorCode) {
      if (errorCode === 'otp_expired') {
        setUrlError('This password reset link has expired. Please request a new one.');
      } else if (errorParam === 'access_denied') {
        setUrlError('Invalid or expired reset link. Please request a new password reset.');
      } else {
        setUrlError(errorDescription || 'An error occurred with the reset link.');
      }
    } else {
      // Validate session for password reset access
      if (!authLoading && !user) {
        // No authenticated user - invalid access
        setUrlError('Invalid reset link. Please use the link from your email or request a new password reset.');
      }
    }
  }, [searchParams, authLoading, user]);

  // If there's a URL error, show error message instead of form
  if (urlError) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-2xl">
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-white">Reset Link Expired</h1>
              <p className="text-gray-300 leading-relaxed">
                {urlError}
              </p>
            </div>

            <Button
              onClick={() => router.push('/forgot-password')}
              className="w-full h-12 text-lg relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-white/20 text-white hover:opacity-80 transition-opacity"
            >
              Request New Reset Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting - max 3 attempts
    if (state.attemptCount >= 3) {
      setState(prev => ({ ...prev, error: 'Too many attempts. Please request a new password reset link.' }));
      return;
    }
    
    if (!state.password || !state.confirmPassword) {
      setState(prev => ({ ...prev, error: 'Please fill in all fields.' }));
      return;
    }

    if (state.password !== state.confirmPassword) {
      setState(prev => ({ ...prev, error: 'Passwords do not match.' }));
      return;
    }

    // Sanitize and validate password
    const sanitizedPassword = sanitizePassword(state.password);
    const sanitizedConfirmPassword = sanitizePassword(state.confirmPassword);
    
    const validation = validatePassword(sanitizedPassword);
    if (!validation.isValid) {
      setState(prev => ({ ...prev, error: validation.errors[0] + '.' }));
      return;
    }

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      setState(prev => ({ ...prev, error: 'Passwords do not match.' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      attemptCount: prev.attemptCount + 1 
    }));

    try {
      // Check if user has active session
      if (!user && !authLoading) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Reset link expired or invalid. Please request a new password reset link.' 
        }));
        return;
      }

      const { error } = await updatePassword(sanitizedPassword);
      
      if (error) {
        if (error.message.includes('session') || error.message.includes('Auth')) {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Reset link expired or invalid. Please request a new password reset link.' 
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: error.message + (error.message.endsWith('.') ? '' : '.') 
          }));
        }
      } else {
        setState(prev => ({ ...prev, loading: false, success: true }));
        // Redirect to login page after successful password reset
        setTimeout(() => {
          router.push('/sign-in?message=Password updated successfully');
        }, 2000);
      }
    } catch (err) {
      debugError('Password update error:', err);
      setState(prev => ({ ...prev, loading: false, error: 'An unexpected error occurred.' }));
    }
  };

  if (state.success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-2xl">
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-white">Password Updated Successfully</h1>
              <p className="text-gray-300 leading-relaxed">
                Your password has been successfully updated. You will be redirected to the sign-in page shortly.
              </p>
              <p className="text-sm text-gray-400">
                Please wait while we redirect you...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-2xl">
        <div className="space-y-3 text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Set Your New Password</h1>
          <p className="text-gray-300 leading-relaxed">
            Enter your new password below to complete the reset process.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white font-medium">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={state.password}
                onChange={(e) => setState(prev => ({ ...prev, password: e.target.value }))}
                className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 transition-colors"
                required
                disabled={state.loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={state.loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white font-medium">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={state.confirmPassword}
                onChange={(e) => setState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 transition-colors"
                required
                disabled={state.loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={state.loading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {state.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{state.error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-lg relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-white/20 text-white hover:opacity-80 transition-opacity" 
            disabled={state.loading || !state.password || !state.confirmPassword}
          >
            {state.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
        
        {onBack && (
          <div className="text-center mt-6">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-sm text-gray-300 hover:text-white hover:bg-white/5"
            >
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 
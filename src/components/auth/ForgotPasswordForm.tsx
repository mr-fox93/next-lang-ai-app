'use client';

import { useState } from 'react';
import { useSupabase } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { sanitizeEmail } from '@/utils/validation';
import { debugError } from '@/utils/debug';
import { ForgotPasswordFormProps } from '@/types/auth';

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { resetPassword } = useSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const sanitizedEmail = sanitizeEmail(email);
      const { error } = await resetPassword(sanitizedEmail);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      debugError('Password reset error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

    if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-2xl">
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-white">Email Sent Successfully</h1>
              <p className="text-gray-300 leading-relaxed">
                We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>.
              </p>
              <p className="text-sm text-gray-400">
                Please check your inbox and click the link to reset your password.
              </p>
            </div>
        
            <div className="space-y-4">
              <p className="text-sm text-gray-300 text-center">
                Didn&apos;t receive the email? Check your spam folder or try sending it again.
              </p>
              
              <Button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                Send Again
              </Button>
              
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="w-full text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              )}
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
          <h1 className="text-3xl font-bold text-white">Reset Your Password</h1>
          <p className="text-gray-300 leading-relaxed">
            Enter your email address and we&apos;ll send you a secure reset link.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-lg relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-white/20 text-white hover:opacity-80 transition-opacity" 
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          {onBack ? (
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-sm text-gray-300 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          ) : (
            <Link href="/sign-in" className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2 inline" />
              Back to Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 
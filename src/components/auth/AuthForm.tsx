'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Key, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuthForms } from '@/hooks';

interface AuthFormProps {
  isSignUp?: boolean;
}

export function AuthForm({ isSignUp = false }: AuthFormProps) {
  const t = useTranslations('Auth');
  const {
    email,
    fullName,
    code,
    loading,
    error,
    codeSent,
    setEmail,
    setFullName,
    setCode,
    handleSubmit,
    handleCodeVerification,
    handleGoogleAuth,
    handleDiscordAuth,
    resetForm
  } = useAuthForms({ isSignUp });

  // Code verification screen
  if (codeSent) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">{t('enterCode')}</h2>
            <p className="text-gray-300 mb-6">
              Wysłaliśmy Ci 6-cyfrowy kod na adres <strong className="text-white">{email}</strong>. 
              Wprowadź kod poniżej:
            </p>
          </div>

          <form onSubmit={handleCodeVerification} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-white">{t('codeLabel')}</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="code"
                  type="text"
                  placeholder={t('codePlaceholder')}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 text-center text-2xl tracking-widest"
                  disabled={loading}
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
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
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-white/20 text-white hover:opacity-80 transition-opacity"
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t('verifyingCode')}
                </>
              ) : (
                <>
                  <Key className="w-5 h-5 mr-2" />
                  {t('verifyCode')}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('sendAnotherCode')}
            </Button>
            <p className="text-sm text-gray-400 text-center">
              {t('didntReceiveCode')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {isSignUp ? t('createAccount') : t('welcomeBack')}
          </h1>
          <p className="text-gray-300">
            {isSignUp 
              ? 'Wprowadź swój email aby otrzymać kod rejestracji'
              : 'Wprowadź swój email aby otrzymać kod logowania'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Full Name (Optional)</Label>
              <div className="relative">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">{t('email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder={t('enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                disabled={loading}
                required
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
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {t('sendingCode')}
              </>
            ) : (
              <>
                <Key className="w-5 h-5 mr-2" />
                {t('sendCode')}
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-white/20"></div>
          <span className="px-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-white/20"></div>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleGoogleAuth}
            className="w-full h-12 text-lg bg-white text-black hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? `${isSignUp ? 'Signing up' : 'Signing in'}...` : `Continue with Google`}
          </Button>

          <Button
            onClick={handleDiscordAuth}
            className="w-full h-12 text-lg bg-[#5865F2] text-white hover:bg-[#4752C4] transition-colors flex items-center justify-center gap-3"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.195.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            {loading ? `${isSignUp ? 'Signing up' : 'Signing in'}...` : `Continue with Discord`}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <Link 
              href={isSignUp ? "/sign-in" : "/sign-up"} 
              className="text-purple-300 hover:text-purple-200 underline"
            >
              {isSignUp ? "Sign in" : "Create one"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 
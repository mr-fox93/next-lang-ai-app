'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  ExternalLink, 
  AlertTriangle,
  Globe,
  Copy,
  CheckCircle 
} from 'lucide-react';
import { detectWebView, getNativeBrowserName, openInNativeBrowser } from '@/utils/webview-detection';
import { useTranslations } from 'next-intl';

interface MobileAuthInstructionsProps {
  email?: string;
  onContinueAnyway?: () => void;
  showFallback?: boolean;
}

export function MobileAuthInstructions({ 
  email, 
  onContinueAnyway,
  showFallback = true 
}: MobileAuthInstructionsProps) {
  const t = useTranslations('MobileAuth');
  const [detection, setDetection] = useState<ReturnType<typeof detectWebView> | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  useEffect(() => {
    setDetection(detectWebView());
  }, []);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const browserName = detection ? getNativeBrowserName(detection.isIOS) : 'browser';
  const BrowserIcon = Globe;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleOpenInBrowser = () => {
    openInNativeBrowser(currentUrl);
  };

  if (!detection?.shouldShowInstructions) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-orange-500/10 backdrop-blur-md border border-orange-500/20 rounded-lg p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {t('title')}
          </h2>
          <p className="text-gray-300 text-sm">
            {t('subtitle', { 
              app: detection.appName || t('emailApp'), 
              browser: browserName 
            })}
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {t('step1Title')}
              </p>
              <p className="text-gray-300 text-xs mt-1">
                {t('step1Description')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold mt-0.5">
              2
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {t('step2Title', { browser: browserName })}
              </p>
              <p className="text-gray-300 text-xs mt-1">
                {t('step2Description', { browser: browserName })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold mt-0.5">
              3
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {t('step3Title')}
              </p>
              <p className="text-gray-300 text-xs mt-1">
                {t('step3Description')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Copy URL Button */}
          <Button
            onClick={handleCopyUrl}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            {urlCopied ? (
              <>
                <CheckCircle className="w-5 h-5" />
                {t('urlCopied')}
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                {t('copyUrl')}
              </>
            )}
          </Button>

          {/* Try to Open in Browser */}
          <Button
            onClick={handleOpenInBrowser}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center justify-center gap-2"
          >
            <BrowserIcon className="w-5 h-5" />
            {t('openInBrowser', { browser: browserName })}
            <ExternalLink className="w-4 h-4" />
          </Button>

          {/* Continue Anyway (if fallback available) */}
          {showFallback && onContinueAnyway && (
            <Button
              onClick={onContinueAnyway}
              variant="outline"
              className="w-full h-10 bg-white/5 border-white/20 text-white hover:bg-white/10 text-sm"
            >
              {t('continueAnyway')}
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-200 text-xs">
              {t('helpText', { browser: browserName })}
            </p>
          </div>
        </div>

        {/* Email reminder */}
        {email && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-xs">
              {t('emailReminder')} <span className="text-white font-medium">{email}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
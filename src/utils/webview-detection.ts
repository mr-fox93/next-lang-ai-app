/**
 * Detects if the user is in a mobile app WebView instead of a native browser
 * Common issue: Magic links open in email app WebView, not in Safari/Chrome
 */

export interface WebViewDetection {
  isWebView: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  appName?: string;
  shouldShowInstructions: boolean;
}

export function detectWebView(): WebViewDetection {
  if (typeof window === 'undefined') {
    return {
      isWebView: false,
      isIOS: false,
      isAndroid: false,
      shouldShowInstructions: false,
    };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Detect iOS
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  
  // Detect Android
  const isAndroid = /android/.test(userAgent);
  
  // Detect various WebViews
  const isWebView = 
    // iOS WebViews
    (isIOS && (
      // Instagram WebView
      /instagram/.test(userAgent) ||
      // Facebook WebView
      /fbav|fban/.test(userAgent) ||
      // Twitter WebView
      /twitter/.test(userAgent) ||
      // Gmail WebView
      /gsa\//.test(userAgent) ||
      // Mail app WebView (no Safari in user agent but mobile)
      (!/safari/.test(userAgent) && /mobile/.test(userAgent)) ||
      // Generic iOS WebView detection
      /wkwebview/.test(userAgent)
    )) ||
    // Android WebViews
    (isAndroid && (
      // Facebook WebView
      /fb_iab|fbav/.test(userAgent) ||
      // Instagram WebView
      /instagram/.test(userAgent) ||
      // Twitter WebView
      /twitter/.test(userAgent) ||
      // Gmail WebView
      /gsa\//.test(userAgent) ||
      // Generic Android WebView
      /wv\)/.test(userAgent)
    ));

  // Determine app name for better instructions
  let appName: string | undefined;
  if (/instagram/.test(userAgent)) appName = 'Instagram';
  else if (/fbav|fban|fb_iab/.test(userAgent)) appName = 'Facebook';
  else if (/twitter/.test(userAgent)) appName = 'Twitter';
  else if (/gsa\//.test(userAgent)) appName = 'Gmail';
  else if (isIOS && isWebView) appName = 'Mail';
  else if (isAndroid && isWebView) appName = 'Email';

  return {
    isWebView,
    isIOS,
    isAndroid,
    appName,
    shouldShowInstructions: isWebView && (isIOS || isAndroid),
  };
}

/**
 * Gets the appropriate browser name for instructions
 */
export function getNativeBrowserName(isIOS: boolean): string {
  return isIOS ? 'Safari' : 'Chrome';
}

/**
 * Attempts to open URL in native browser (mobile only)
 */
export function openInNativeBrowser(url: string): void {
  if (typeof window === 'undefined') return;
  
  const detection = detectWebView();
  
  if (detection.isIOS) {
    // Try to open in Safari using special schemes
    window.location.href = `x-web-search://?${url}`;
    // Fallback after short delay
    setTimeout(() => {
      window.open(url, '_blank');
    }, 500);
  } else if (detection.isAndroid) {
    // Try to open in default browser
    window.open(url, '_blank');
  } else {
    // Desktop or unknown - normal behavior
    window.location.href = url;
  }
} 
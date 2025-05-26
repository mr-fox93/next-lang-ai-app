/**
 * Demo Mode Service
 * Handles demo mode session management according to clean architecture principles
 */

export interface DemoModeService {
  isDemoMode(cookies: string): boolean;
  shouldAutoLogout(pathname: string, cookies: string): boolean;
  clearDemoMode(): string;
}

export class DemoModeServiceImpl implements DemoModeService {
  private readonly DEMO_COOKIE_NAME = 'demo_mode';
  private readonly DEMO_COOKIE_VALUE = 'true';
  private readonly LANDING_PAGE_PATH = '/';

  /**
   * Check if user is in demo mode based on cookies
   */
  isDemoMode(cookies: string): boolean {
    if (!cookies) return false;
    
    const cookieArray = cookies.split(';');
    const demoModeCookie = cookieArray.find(cookie => 
      cookie.trim().startsWith(`${this.DEMO_COOKIE_NAME}=`)
    );
    
    return demoModeCookie?.split('=')[1]?.trim() === this.DEMO_COOKIE_VALUE;
  }

  /**
   * Determine if demo mode should be automatically logged out
   * based on current pathname and demo mode status
   */
  shouldAutoLogout(pathname: string, cookies: string): boolean {
    const isDemo = this.isDemoMode(cookies);
    
    // Check if user is on landing page (root or locale root)
    // Matches: /, /en, /pl, /es, /it (with optional trailing slash)
    const landingPagePattern = /^\/(?:en|pl|es|it)?\/?$/;
    const isOnLandingPage = landingPagePattern.test(pathname);
    
    return isDemo && isOnLandingPage;
  }

  /**
   * Generate cookie string to clear demo mode
   */
  clearDemoMode(): string {
    return `${this.DEMO_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

// Export singleton instance
export const demoModeService = new DemoModeServiceImpl(); 
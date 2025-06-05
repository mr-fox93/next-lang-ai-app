import { getLocale as getIntlLocale } from 'next-intl/server';
import { defaultLocale } from './routing';

/**
 * Get the current locale for server components
 */
export async function getLocale(): Promise<string> {
  try {
    return await getIntlLocale();
  } catch (error) {
    // Fallback to default locale if getting current locale fails
    console.warn('Failed to get current locale, falling back to default:', error);
    return defaultLocale;
  }
} 
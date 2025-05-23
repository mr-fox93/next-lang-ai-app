import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { defaultLocale } from '@/i18n/routing';

export default async function DemoRedirectPage() {
  // Try to get locale from headers or use default
  let locale = defaultLocale;
  
  try {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    
    // Simple locale detection - could be more sophisticated
    if (acceptLanguage?.includes('pl')) {
      locale = 'pl';
    } else if (acceptLanguage?.includes('es')) {
      locale = 'es';
    } else if (acceptLanguage?.includes('it')) {
      locale = 'it';
    }
  } catch {
    // Fallback to default locale if headers are not available
    locale = defaultLocale;
  }
  
  redirect(`/${locale}/demo`);
} 
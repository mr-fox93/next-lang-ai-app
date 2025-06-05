export type Locale = 'en' | 'pl' | 'es' | 'it';

export type Language = 'pl' | 'en';

export type SupportedTTSLanguage = 'pl-PL' | 'en-US' | 'es-ES' | 'it-IT';

export interface CookieTranslations {
  title: string;
  description: string;
  necessary: string;
  necessaryDesc: string;
  showDetails: string;
  hideDetails: string;
  acceptAll: string;
  onlyNecessary: string;
}

export interface FooterTranslations {
  allRightsReserved: string;
  contact: string;
  privacyPolicy: string;
  termsOfUse: string;
  cookieSettings: string;
}

export interface PrivacyPolicyTranslations {
  title: string;
  backHome: string;
  intro: {
    title: string;
    content: string;
  };
  dataCollection: {
    title: string;
    content: string;
    accountData: string;
    accountDataDesc: string;
    userContent: string;
    userContentDesc: string;
    tempData: string;
    tempDataDesc: string;
  };
  cookies: {
    title: string;
    content: string;
    necessaryCookies: string;
    necessaryCookiesDesc: string;
    localStorageTitle: string;
    localStorageDesc: string;
    noCookies: string;
  };
  externalServices: {
    title: string;
    content: string;
    clerk: string;
    clerkDesc: string;
    openai: string;
    openaiDesc: string;
    vercel: string;
    vercelDesc: string;
    policy: string;
  };
  dataStorage: {
    title: string;
    accountData: string;
    guestData: string;
  };
  changes: {
    title: string;
    content: string;
  };
  contact: {
    title: string;
    content: string;
    email: string;
  };
  lastUpdate: string;
}

export interface TermsTranslations {
  title: string;
  backHome: string;
  intro: {
    title: string;
    content: string;
  };
  accounts: {
    title: string;
    content: string;
  };
  allowedUse: {
    title: string;
    content: string;
    item1: string;
    item2: string;
    item3: string;
  };
  userContent: {
    title: string;
    content: string;
  };
  changes: {
    title: string;
    content: string;
  };
  contact: {
    title: string;
    content: string;
    email: string;
  };
  lastUpdate: string;
}

export interface Translations {
  cookie: {
    en: CookieTranslations;
    pl: CookieTranslations;
  };
  footer: {
    en: FooterTranslations;
    pl: FooterTranslations;
  };
  privacyPolicy: {
    en: PrivacyPolicyTranslations;
    pl: PrivacyPolicyTranslations;
  };
  terms: {
    en: TermsTranslations;
    pl: TermsTranslations;
  };
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
} 
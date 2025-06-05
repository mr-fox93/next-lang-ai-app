"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  Translations, 
  LanguageContextType 
} from '@/types/locale';

// Translation data would be imported or defined here
const defaultTranslations: Translations = {
  cookie: {
    en: {
      title: "Privacy Policy & Cookies",
      description: "This site only uses necessary cookies for proper functioning. We temporarily store flashcard data for non-logged in users and remember your cookie preferences.",
      necessary: "Necessary",
      necessaryDesc: "Required for basic site functions: authentication via Clerk, storing flashcards in guest mode, and remembering cookie consent preferences.",
      showDetails: "Show details",
      hideDetails: "Hide details",
      acceptAll: "Accept all",
      onlyNecessary: "Only necessary"
    },
    pl: {
      title: "Polityka prywatności i pliki cookie",
      description: "Ta strona wykorzystuje wyłącznie niezbędne pliki cookie do prawidłowego funkcjonowania. Przechowujemy tymczasowo dane fiszek dla niezalogowanych użytkowników oraz zapamiętujemy Twoje preferencje dotyczące plików cookie.",
      necessary: "Niezbędne",
      necessaryDesc: "Wymagane do działania podstawowych funkcji serwisu: uwierzytelnianie przez Clerk, przechowywanie fiszek w trybie gościa oraz zapamiętanie decyzji dotyczącej plików cookie.",
      showDetails: "Pokaż szczegóły",
      hideDetails: "Ukryj szczegóły",
      acceptAll: "Akceptuję wszystkie",
      onlyNecessary: "Tylko niezbędne"
    }
  },
  footer: {
    en: {
      allRightsReserved: "All rights reserved",
      contact: "Contact",
      privacyPolicy: "Privacy Policy",
      termsOfUse: "Terms of Use",
      cookieSettings: "Cookie Settings"
    },
    pl: {
      allRightsReserved: "Wszelkie prawa zastrzeżone",
      contact: "Kontakt",
      privacyPolicy: "Polityka Prywatności",
      termsOfUse: "Warunki Użytkowania",
      cookieSettings: "Ustawienia Cookies"
    }
  },
  privacyPolicy: {
    en: {
      title: "Privacy Policy",
      backHome: "Back to Home",
      intro: {
        title: "1. Introduction",
        content: "Welcome to Flashcards AI. Protecting your personal data is important to us. This Privacy Policy explains what data we collect, how we use it, and what rights you have regarding it."
      },
      dataCollection: {
        title: "2. What data we collect",
        content: "We only collect essential data needed for the application to function:",
        accountData: "Account data",
        accountDataDesc: "Authentication data via Clerk service (email address). This data is stored by Clerk in accordance with their privacy policy.",
        userContent: "User content",
        userContentDesc: "Flashcards you create (original text, translation, usage examples, categories) and learning statistics (progress in mastering the material).",
        tempData: "Temporary data",
        tempDataDesc: "In guest mode, we temporarily store your flashcards in your browser's memory to allow you to use the application without logging in."
      },
      cookies: {
        title: "3. How we use cookies",
        content: "Our site only uses essential cookies and similar technologies:",
        necessaryCookies: "Essential cookies",
        necessaryCookiesDesc: "Enable basic functions such as secure login and site navigation. The Clerk service uses its own cookies for authentication and session management.",
        localStorageTitle: "Local data storage",
        localStorageDesc: "We use your browser's memory to store flashcards in guest mode and remember your cookie preferences.",
        noCookies: "We do not use any cookies for marketing, tracking, or analytics purposes."
      },
      externalServices: {
        title: "4. External services",
        content: "We use the following external services:",
        clerk: "Clerk",
        clerkDesc: "For authentication and user account management. Clerk may collect data such as email address, IP, or browser information in accordance with their own privacy policy.",
        openai: "OpenAI",
        openaiDesc: "For generating flashcard content using their API. Only data necessary for content generation is transmitted; we do not share users' personal data.",
        vercel: "Vercel",
        vercelDesc: "For hosting our application.",
        policy: "Each of these services has its own privacy policy, which can be found on their websites."
      },
      dataStorage: {
        title: "5. Data storage",
        accountData: "User account and learning progress data are stored in a PostgreSQL database with secured connection. We store this data as long as you have an account on our service.",
        guestData: "For non-logged in users, flashcard data is stored exclusively in your browser's memory and is not transmitted to our servers."
      },
      changes: {
        title: "6. Changes to the privacy policy",
        content: "We may update our Privacy Policy from time to time. We will notify you of any significant changes via in-app notification."
      },
      contact: {
        title: "7. Contact",
        content: "If you have questions about our Privacy Policy, please contact us:",
        email: "Email"
      },
      lastUpdate: "Last updated"
    },
    pl: {
      title: "Polityka Prywatności",
      backHome: "Powrót do strony głównej",
      intro: {
        title: "1. Wprowadzenie",
        content: "Witamy w Flashcards AI. Ochrona Twoich danych osobowych jest dla nas ważna. Niniejsza Polityka Prywatności wyjaśnia, jakie dane zbieramy, jak je wykorzystujemy i jakie masz prawa w związku z nimi."
      },
      dataCollection: {
        title: "2. Jakie dane zbieramy",
        content: "Zbieramy tylko niezbędne dane potrzebne do funkcjonowania aplikacji:",
        accountData: "Dane konta",
        accountDataDesc: "Dane uwierzytelniające za pośrednictwem usługi Clerk (adres e-mail). Dane te są przechowywane przez Clerk zgodnie z ich polityką prywatności.",
        userContent: "Treści użytkownika",
        userContentDesc: "Fiszki, które tworzysz (tekst oryginalny, tłumaczenie, przykłady użycia, kategorie) oraz statystyki nauki (postępy w opanowaniu materiału).",
        tempData: "Dane tymczasowe",
        tempDataDesc: "W trybie gościa przechowujemy tymczasowo Twoje fiszki w pamięci przeglądarki, aby umożliwić korzystanie z aplikacji bez konieczności logowania."
      },
      cookies: {
        title: "3. Jak wykorzystujemy pliki cookie",
        content: "Nasza strona wykorzystuje tylko niezbędne pliki cookie i podobne technologie:",
        necessaryCookies: "Niezbędne pliki cookie",
        necessaryCookiesDesc: "Umożliwiają podstawowe funkcje, takie jak bezpieczne logowanie i nawigację po stronie. Usługa Clerk używa własnych plików cookie do uwierzytelniania i zarządzania sesją.",
        localStorageTitle: "Lokalne przechowywanie danych",
        localStorageDesc: "Używamy pamięci Twojej przeglądarki do przechowywania fiszek w trybie gościa oraz zapamiętania Twoich preferencji dotyczących plików cookie.",
        noCookies: "Nie używamy żadnych plików cookie do celów marketingowych, śledzenia czy analityki."
      },
      externalServices: {
        title: "4. Usługi zewnętrzne",
        content: "Korzystamy z następujących usług zewnętrznych:",
        clerk: "Clerk",
        clerkDesc: "Do uwierzytelniania i zarządzania kontami użytkowników. Clerk może zbierać dane takie jak adres e-mail, IP czy informacje o przeglądarce zgodnie z ich własną polityką prywatności.",
        openai: "OpenAI",
        openaiDesc: "Do generowania treści fiszek za pomocą API. Przesyłane są tylko dane potrzebne do generowania treści, nie przekazujemy danych osobowych użytkowników.",
        vercel: "Vercel",
        vercelDesc: "Do hostingu naszej aplikacji.",
        policy: "Każda z tych usług ma własną politykę prywatności, z którą można zapoznać się na ich stronach internetowych."
      },
      dataStorage: {
        title: "5. Przechowywanie danych",
        accountData: "Dane związane z kontem użytkownika i postępami nauki są przechowywane w bazie danych PostgreSQL, której połączenie jest zabezpieczone. Dane te przechowujemy tak długo, jak długo posiadasz konto w naszym serwisie.",
        guestData: "W przypadku użytkowników niezalogowanych, dane fiszek są przechowywane wyłącznie w pamięci Twojej przeglądarki i nie są przesyłane na nasze serwery."
      },
      changes: {
        title: "6. Zmiany w polityce prywatności",
        content: "Możemy aktualizować naszą Politykę Prywatności od czasu do czasu. O wszelkich istotnych zmianach poinformujemy za pomocą powiadomienia w aplikacji."
      },
      contact: {
        title: "7. Kontakt",
        content: "Jeśli masz pytania dotyczące naszej Polityki Prywatności, skontaktuj się z nami:",
        email: "Email"
      },
      lastUpdate: "Ostatnia aktualizacja"
    }
  },
  terms: {
    en: {
      title: "Terms of Use",
      backHome: "Back to Home",
      intro: {
        title: "1. Introduction",
        content: "Welcome to Flashcards AI. By using our application, you accept these Terms of Use. The application is designed for creating and learning with language flashcards using artificial intelligence."
      },
      accounts: {
        title: "2. User accounts",
        content: "To use the full functionality of the application, you must create an account. You are responsible for maintaining the confidentiality of your login credentials and any activities performed through your account."
      },
      allowedUse: {
        title: "3. Allowed use",
        content: "You may use the application only for lawful purposes. You agree not to:",
        item1: "Violate intellectual property rights or privacy of others",
        item2: "Use the application for spam, fraud, or harmful activities",
        item3: "Take actions that could disrupt the proper functioning of the application"
      },
      userContent: {
        title: "4. User content",
        content: "You retain rights to your flashcards and other content you create in the application. You grant us a non-exclusive license to use this content to provide the service."
      },
      changes: {
        title: "5. Changes to the service",
        content: "We reserve the right to modify, suspend, or discontinue the service without prior notice. We may also update these Terms of Use. Continued use of the application after changes means acceptance of the new terms."
      },
      contact: {
        title: "6. Contact",
        content: "If you have questions about these Terms of Use, please contact us:",
        email: "Email"
      },
      lastUpdate: "Last updated"
    },
    pl: {
      title: "Warunki Użytkowania",
      backHome: "Powrót do strony głównej",
      intro: {
        title: "1. Wprowadzenie",
        content: "Witamy w Flashcards AI. Korzystając z naszej aplikacji, akceptujesz niniejsze Warunki Użytkowania. Aplikacja służy do tworzenia i nauki z fiszek językowych z wykorzystaniem sztucznej inteligencji."
      },
      accounts: {
        title: "2. Konta użytkowników",
        content: "Aby korzystać z pełnej funkcjonalności aplikacji, musisz utworzyć konto. Jesteś odpowiedzialny za zachowanie poufności swoich danych logowania i wszelkie działania wykonywane za pośrednictwem Twojego konta."
      },
      allowedUse: {
        title: "3. Dozwolone użycie",
        content: "Możesz korzystać z aplikacji wyłącznie do celów zgodnych z prawem. Zobowiązujesz się nie:",
        item1: "Naruszać praw własności intelektualnej lub prywatności innych osób",
        item2: "Wykorzystywać aplikacji do celów spamowych, oszustw lub działań szkodliwych",
        item3: "Podejmować działań, które mogłyby zakłócić prawidłowe funkcjonowanie aplikacji"
      },
      userContent: {
        title: "4. Treści użytkownika",
        content: "Zachowujesz prawa do swoich fiszek i innych treści, które tworzysz w aplikacji. Udzielasz nam niewyłącznej licencji na korzystanie z tych treści w celu świadczenia usługi."
      },
      changes: {
        title: "5. Zmiany w usłudze",
        content: "Zastrzegamy sobie prawo do modyfikowania, zawieszania lub przerywania świadczenia usługi bez uprzedniego powiadomienia. Możemy również aktualizować niniejsze Warunki Użytkowania. Dalsze korzystanie z aplikacji po wprowadzeniu zmian oznacza akceptację nowych warunków."
      },
      contact: {
        title: "6. Kontakt",
        content: "W przypadku pytań dotyczących niniejszych Warunków Użytkowania, prosimy o kontakt:",
        email: "Email"
      },
      lastUpdate: "Ostatnia aktualizacja"
    }
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  translations: defaultTranslations
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Sprawdzenie języka przeglądarki
    const detectBrowserLanguage = (): Language => {
      if (typeof window !== "undefined") {
        // Sprawdź czy użytkownik już wybrał język
        const savedLanguage = localStorage.getItem("preferred-language") as Language;
        if (savedLanguage && (savedLanguage === "pl" || savedLanguage === "en")) {
          return savedLanguage;
        }
        
        // Użyj języka przeglądarki
        const browserLang = navigator.language.toLowerCase();
        return browserLang.startsWith("pl") ? "pl" : "en";
      }
      return "en"; // Domyślny język
    };

    setLanguageState(detectBrowserLanguage());
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-language", lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations: defaultTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
} 
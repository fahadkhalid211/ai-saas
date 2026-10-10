import type { SupportedLocale } from '../types';

export interface TranslationDictionary {
  nav: {
    product: string;
    features: string;
    pricing: string;
    blog: string;
    integrations: string;
    playground: string;
    contact: string;
    login: string;
    signup: string;
    dashboard: string;
  };
  geoBanner: {
    visitingFrom: string;
    switchedTo: string;
    keep: string;
    switchToEnglish: string;
    dismiss: string;
  };
  switcher: {
    language: string;
    detectedCountry: string;
    globalDefault: string;
  };
  footer: {
    allRightsReserved: string;
    contactSupport: string;
    cookieSettings: string;
  };
}

export const DICTIONARIES: Record<SupportedLocale, TranslationDictionary> = {
  en: {
    nav: {
      product: 'Product',
      features: 'Features',
      pricing: 'Pricing',
      blog: 'Blog',
      integrations: 'Integrations',
      playground: 'Interactive Playground',
      contact: 'Contact Support',
      login: 'Log in',
      signup: 'Start free trial',
      dashboard: 'Dashboard',
    },
    geoBanner: {
      visitingFrom: 'Visiting from {country} {flag}?',
      switchedTo: "We've adapted the website to {language} for you.",
      keep: 'Keep {language}',
      switchToEnglish: 'Switch to English',
      dismiss: 'Dismiss',
    },
    switcher: {
      language: 'Language',
      detectedCountry: 'Detected location',
      globalDefault: 'Global (English)',
    },
    footer: {
      allRightsReserved: 'All rights reserved.',
      contactSupport: 'Contact support',
      cookieSettings: 'Cookie settings',
    },
  },
  sv: {
    nav: {
      product: 'Produkt',
      features: 'Funktioner',
      pricing: 'Priser',
      blog: 'Blogg',
      integrations: 'Integrationer',
      playground: 'Interaktiv demo',
      contact: 'Kontakta support',
      login: 'Logga in',
      signup: 'Starta gratis provperiod',
      dashboard: 'Kontrollpanel',
    },
    geoBanner: {
      visitingFrom: 'Besöker du från {country} {flag}?',
      switchedTo: 'Vi har anpassat webbplatsen till {language} för dig.',
      keep: 'Behåll {language}',
      switchToEnglish: 'Växla till engelska',
      dismiss: 'Stäng',
    },
    switcher: {
      language: 'Språk',
      detectedCountry: 'Identifierad plats',
      globalDefault: 'Global (Engelska)',
    },
    footer: {
      allRightsReserved: 'Alla rättigheter förbehållna.',
      contactSupport: 'Kontakta support',
      cookieSettings: 'Cookie-inställningar',
    },
  },
  fi: {
    nav: {
      product: 'Tuote',
      features: 'Ominaisuudet',
      pricing: 'Hinnoittelu',
      blog: 'Blogi',
      integrations: 'Integraatiot',
      playground: 'Interaktiivinen demo',
      contact: 'Ota yhteyttä tukeen',
      login: 'Kirjaudu sisään',
      signup: 'Aloita ilmainen kokeilu',
      dashboard: 'Hallintapaneeli',
    },
    geoBanner: {
      visitingFrom: 'Vierailetko maasta {country} {flag}?',
      switchedTo: 'Olemme mukauttaneet verkkosivuston kielelle {language}.',
      keep: 'Pidä {language}',
      switchToEnglish: 'Vaihda englanniksi',
      dismiss: 'Sulje',
    },
    switcher: {
      language: 'Kieli',
      detectedCountry: 'Tunnistettu sijainti',
      globalDefault: 'Globaali (Englanti)',
    },
    footer: {
      allRightsReserved: 'Kaikki oikeudet pidätetään.',
      contactSupport: 'Ota yhteyttä tukeen',
      cookieSettings: 'Evästeasetukset',
    },
  },
  it: {
    nav: {
      product: 'Prodotto',
      features: 'Funzionalità',
      pricing: 'Prezzi',
      blog: 'Blog',
      integrations: 'Integrazioni',
      playground: 'Demo interattiva',
      contact: 'Contatta il supporto',
      login: 'Accedi',
      signup: 'Inizia prova gratuita',
      dashboard: 'Pannello di controllo',
    },
    geoBanner: {
      visitingFrom: 'In visita da {country} {flag}?',
      switchedTo: 'Abbiamo adattato il sito web in {language} per te.',
      keep: 'Mantieni {language}',
      switchToEnglish: "Passa all'inglese",
      dismiss: 'Chiudi',
    },
    switcher: {
      language: 'Lingua',
      detectedCountry: 'Posizione rilevata',
      globalDefault: 'Globale (Inglese)',
    },
    footer: {
      allRightsReserved: 'Tutti i diritti riservati.',
      contactSupport: 'Contatta il supporto',
      cookieSettings: 'Impostazioni cookie',
    },
  },
  es: {
    nav: {
      product: 'Producto',
      features: 'Características',
      pricing: 'Precios',
      blog: 'Blog',
      integrations: 'Integraciones',
      playground: 'Demo interactiva',
      contact: 'Contactar soporte',
      login: 'Iniciar sesión',
      signup: 'Iniciar prueba gratis',
      dashboard: 'Panel de control',
    },
    geoBanner: {
      visitingFrom: '¿Nos visitas desde {country} {flag}?',
      switchedTo: 'Hemos adaptado el sitio web a {language} para ti.',
      keep: 'Mantener {language}',
      switchToEnglish: 'Cambiar a inglés',
      dismiss: 'Cerrar',
    },
    switcher: {
      language: 'Idioma',
      detectedCountry: 'Ubicación detectada',
      globalDefault: 'Global (Inglés)',
    },
    footer: {
      allRightsReserved: 'Todos los derechos reservados.',
      contactSupport: 'Contactar soporte',
      cookieSettings: 'Configuración de cookies',
    },
  },
};

export function getDictionary(locale: SupportedLocale): TranslationDictionary {
  return DICTIONARIES[locale] || DICTIONARIES.en;
}

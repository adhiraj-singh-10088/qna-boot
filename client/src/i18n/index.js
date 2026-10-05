import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import es from './locales/es.json';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'es', label: 'Español' },
];

const STORAGE_KEY = 'inkspace_lang';

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
    const browser = navigator.language?.slice(0, 2);
    if (browser && LANGUAGES.some((l) => l.code === browser)) return browser;
  } catch {
    /* fall through */
  }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    es: { translation: es },
  },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/** Switches the app language and remembers the choice on this device. */
export function setLanguage(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
  i18n.changeLanguage(code);
}

export function currentLanguage() {
  return i18n.resolvedLanguage || 'en';
}

export default i18n;

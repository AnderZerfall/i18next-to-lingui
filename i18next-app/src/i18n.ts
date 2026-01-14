// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from "./locale-i18/en.json";
import es from "./locale-i18/es.json";

const resources = {
  en: en,
  es: es
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  ns: ['app', 'content', 'status'],
  defaultNS: 'app',
  interpolation: { escapeValue: false },
  react: {
      useSuspense: false, // Set to true if using Suspense
      bindI18n: 'languageChanged', // This is the default, but ensure it's not overridden
    }
});

export default i18n;
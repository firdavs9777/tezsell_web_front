// src/i18n.ts
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ru from './locales/rus.json';
import uz from './locales/uz.json';

i18n.use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    uz: { translation: uz },
  },
  lng: 'uz', 
  fallbackLng: 'uz', 
  interpolation: {
    escapeValue: false, 
  },
});

export default i18n;

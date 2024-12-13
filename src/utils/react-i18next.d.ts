// src/types/react-i18next.d.ts
import 'react-i18next';

import en from '../locales/en.json';
import rus from '../locales/rus.json';
import uz from '../locales/uz.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'; 
    resources: {
      en: typeof en;
      rus: typeof rus;
      uz: typeof uz;
    };
  }
}

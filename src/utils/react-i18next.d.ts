// src/types/react-i18next.d.ts
import 'react-i18next';

import en from '@utils/locales/en.json';
import rus from '@utils/locales/rus.json';
import uz from '@utils/locales/uz.json';

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

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { messages as enMessages } from './locales/en/messages.po';
import { messages as esMessages } from './locales/es/messages.po';

i18n.load({
  en: enMessages,
  es: esMessages,
});
i18n.activate('en');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </StrictMode>,
);

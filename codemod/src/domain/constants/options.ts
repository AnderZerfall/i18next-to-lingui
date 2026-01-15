import { ReactTransformerOptions } from '../model/ReactTransformerOptions';

export const I18N_HOOK = 'useTranslation';
export const LINGUI_HOOK = 'useLingui';
export const LINGUI_MACRO = '@lingui/macro';
export const I18N_IMPORT = 'react-i18next';
export const LINGUI_IMPORT = '@lingui/react';
export const I18N_KEY = 'i18n';
export const LINGUI_KEY = '_';
export const LINGUI_MSG_KEY = 'msg';
export const I18N_T_KEY = 't';
export const I18N_SEPARATOR = ':';

export const DEFAULT_OPTIONS: ReactTransformerOptions = {
  translations: null,
  translationsPath: '',
  config: {
    i18NextHook: I18N_HOOK,
    linguiHook: LINGUI_HOOK,
    linguiMacro: LINGUI_MACRO,
    i18NextImport: I18N_IMPORT,
    linguiImport: LINGUI_IMPORT,
    i18NextKey: I18N_KEY,
    linguiKey: LINGUI_KEY,
    linguiMsgKey: LINGUI_MSG_KEY,
    i18NextTKey: I18N_T_KEY,
    i18NextSeparator: I18N_SEPARATOR,
  },
};

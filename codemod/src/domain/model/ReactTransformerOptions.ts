import { DEFAULT_OPTIONS } from '../constants/options';

export interface ReactTransformerOptions {
  translations: Record<string, any> | null;
  translationsPath: string;
  config: {
    i18NextHook: string;
    linguiHook: string;
    linguiMacro: string;
    i18NextImport: string;
    linguiImport: string;
    i18NextKey: string;
    linguiKey: string;
    linguiMsgKey: string;
    i18NextTKey: string;
    i18NextSeparator: string;
  };
}

export const ReactTransformerOptions = {
  create: (
    init: Partial<ReactTransformerOptions>,
  ): ReactTransformerOptions => ({
    ...DEFAULT_OPTIONS,
    ...init,
  }),
};

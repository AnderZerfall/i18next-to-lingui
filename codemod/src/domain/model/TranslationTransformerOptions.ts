import { DEFAULT_OPTIONS } from '../constants/options';

export interface TranslationTransformerOptions {
  sourcePath: string;
  targetPath: string;
}

export const TranslationTransformerOptions = {
  create: (
    init: TranslationTransformerOptions,
  ): TranslationTransformerOptions => ({
    ...init,
  }),
};

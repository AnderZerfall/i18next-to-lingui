import { API } from 'jscodeshift';
import { TransformErrors } from '../domain/constants/errors';
import * as path from 'path';
import * as fs from 'fs';

const PARSE_FORMAT = 'utf8';

export function uploadTranslations(
  translationPath: string,
  api?: API,
): Record<string, any> | null {
  try {
    if (!fs.existsSync(translationPath)) {
      if (api) {
        api.report(
          `[${TransformErrors.InvalidJson}] Translation file not found at: ${translationPath}`,
        );

        return null;
      }

      throw new Error(
        `[${TransformErrors.InvalidJson}] Translation file not found at: ${translationPath}`,
      );
    }
    return JSON.parse(fs.readFileSync(translationPath, PARSE_FORMAT));
  } catch {
    if (api) {
      api.report(`[${TransformErrors.InvalidJson}] Failed to parse JSON`);
      return null;
    }

    throw new Error(`[${TransformErrors.InvalidJson}] Failed to parse JSON`);
  }
}

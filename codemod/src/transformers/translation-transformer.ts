import { TransformErrors } from '../domain/constants/errors';
import { uploadTranslations } from '../utils/uploadTranslations';
import { TranslationTransformerOptions } from '../domain/model/TranslationTransformerOptions';
import * as path from 'path';
import * as fs from 'fs';
import { API } from 'jscodeshift';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const sourcePath = argv.source; // "source translaftion path"
const targetPath = argv.target; // "target translation path"

transformer({
  sourcePath,
  targetPath,
});

function transformer(options: TranslationTransformerOptions) {
  if (!options.sourcePath) {
    throw new Error(
      `[${TransformErrors.NoSourcePath}] No source translations available. Cannot transform file.`,
    );
  }

  if (!options.targetPath) {
    throw new Error(
      `[${TransformErrors.NoTargetPath}] No source translations available. Cannot transform file.`,
    );
  }

  const sourceTranslations = uploadTranslations(options.sourcePath);

  if (!sourceTranslations) {
    throw new Error(
      `[${TransformErrors.InvalidJson}] No source translations available. Cannot transform file.`,
    );
  }

  const result = transformJsonToPO(sourceTranslations, []);

  writePOFile(options.targetPath, result);
}

function createPORecord(key: string, value: string): string {
  return `msgid "${key}"\nmsgstr "${value}"\n`;
}

function writePOFile(path: string, rows: string[]) {
  if (!path) {
    throw new Error(
      `[${TransformErrors.NoTargetPath}] No target path available. Cannot transform file.`,
    );
  }

  fs.writeFileSync(
    path,
    `"Language: en"\n"MIME-Version: 1.0"\n"Content-Type: text/plain; charset=UTF-8"\n\n`,
  );

  for (const row of rows) {
    fs.appendFileSync(path, createPORecord(row, row));
    fs.appendFileSync(path, `\n`);
  }
}

function transformJsonToPO(
  json: Record<string, any>,
  result: string[],
): string[] {
  for (const key in json) {
    if (typeof json[key] === 'string') result.push(json[key]);

    if (typeof json[key] === 'object' && json[key] !== null) {
      transformJsonToPO(json[key], result);
    }
  }

  return result;
}

import * as fs from 'fs';
import { API, FileInfo, Options } from 'jscodeshift';
import * as path from 'path';
import { TransformErrors } from './constants/errors';

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options,
) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // --- 1. Load translations with Error Handling ---
  let translations: any;
  try {
    if (options.translations) {
      translations = options.translations;
    } else {
      const translationPath = path.resolve(
        __dirname,
        '../../i18next-app/src/locale-i18/en.json',
      );
      if (!fs.existsSync(translationPath)) {
        api.report(
          `[${TransformErrors.InvalidJson}] Translation file not found at: ${translationPath}`,
        );
        return null; // Stop this file
      }
      translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
    }
  } catch {
    api.report(`[${TransformErrors.InvalidJson}] Failed to parse JSON`);

    return null;
  }

  // --- 2. Update imports (Lingui) ---
  root
    .find(j.ImportDeclaration, { source: { value: 'react-i18next' } })
    .forEach((p) => {
      p.node.source.value = '@lingui/react';
      p.node.specifiers?.forEach((spec) => {
        if (
          spec.type === 'ImportSpecifier' &&
          spec.imported.name === 'useTranslation'
        ) {
          spec.imported.name = j.identifier('useLingui');
        }
      });
    });

  // Add import { msg } from '@lingui/macro' if not present
  const hasLinguiMacro =
    root.find(j.ImportDeclaration, {
      source: { value: '@lingui/macro' },
    }).length > 0;

  if (!hasLinguiMacro) {
    const linguiMacroImport = j.importDeclaration(
      [j.importSpecifier(j.identifier('msg'))],
      j.stringLiteral('@lingui/macro'),
    );
    // Insert at the top of the file
    root.get().node.program.body.unshift(linguiMacroImport);
  }

  // 2. UPDATE HOOK DESTRUCTURING
  // FIX: Search for 'useTranslation' because the AST node isn't renamed yet
  root
    .find(j.VariableDeclarator, {
      init: { callee: { name: 'useTranslation' } },
    })
    .forEach((path) => {
      // Rename the function call itself to useLingui
      if (
        path.node.init?.type === 'CallExpression' &&
        path.node.init.callee.type === 'Identifier'
      ) {
        path.node.init.callee.name = 'useLingui';
      }

      if (path.node.id.type === 'ObjectPattern') {
        path.node.id.properties.forEach((prop) => {
          if (
            prop.type === 'Property' &&
            prop.key.type === 'Identifier' &&
            (prop.key.name === 't' || prop.key.name === 'i18n')
          ) {
            prop.key.name = 'i18n';
            prop.value = j.identifier('_');
            prop.shorthand = false;
          }
        });
      }
    });

  // --- 4. Replace t() calls with Error Checking ---
  root.find(j.CallExpression, { callee: { name: 't' } }).forEach((p) => {
    const args = p.node.arguments;

    // Check for No Arguments
    if (!args || args.length === 0) {
      api.report(
        `[${TransformErrors.NoTranslationArguments}] Empty t() call in ${file.path}`,
      );
      return;
    }

    const keyArgument = args[0];
    if (
      keyArgument.type !== 'StringLiteral' &&
      keyArgument.type !== 'Literal'
    ) {
      api.report(
        `[${TransformErrors.InvalidTranslationKey}] Non-string key in ${file.path}`,
      );
      return;
    }

    const translationKey = String(keyArgument.value);
    const subkeys = translationKey.split(':');

    // Navigate JSON with safety
    const translationValue = subkeys.reduce((target, key) => {
      return target && typeof target === 'object' ? target[key] : undefined;
    }, translations);

    // Handle Missing Keys
    if (typeof translationValue !== 'string') {
      api.report(
        `[${TransformErrors.MissingKey}] Key "${translationKey}" not found in translations.`,
      );
      // Optional: Wrap in a comment or a special 'todo' marker
      j(p).replaceWith(
        j.commentBlock(` TODO: Missing translation for ${translationKey} `),
      );
      return;
    }

    // Successful transformation
    const msgTag = j.taggedTemplateExpression(
      j.identifier('msg'),
      j.templateLiteral(
        [
          j.templateElement(
            { raw: translationValue, cooked: translationValue },
            true,
          ),
        ],
        [],
      ),
    );

    j(p).replaceWith(j.callExpression(j.identifier('_'), [msgTag]));
  });

  return root.toSource({ quote: 'single', trailingComma: true });
}

export const parser = 'tsx';

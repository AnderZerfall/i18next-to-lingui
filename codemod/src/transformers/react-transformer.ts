import { API, FileInfo } from 'jscodeshift';
import { TransformErrors } from '../domain/constants/errors';
import { uploadTranslations } from '../utils/uploadTranslations';
import { ReactTransformerOptions } from '../domain/model/ReactTransformerOptions';
import { getI18NextTranslationValue } from '../utils/geti18NextTranslationValue';

export default function transformer(
  file: FileInfo,
  api: API,
  options: Partial<ReactTransformerOptions>,
): string | null {
  const transformerOptions = ReactTransformerOptions.create(options);
  const { config } = transformerOptions;

  const j = api.jscodeshift;
  const root = j(file.source);

  const translations =
    transformerOptions.translations ??
    uploadTranslations(transformerOptions.translationsPath, api);

  if (!translations) {
    api.report(
      `[${TransformErrors.InvalidJson}] No translations available. Cannot transform file.`,
    );
    return null;
  }

  ensureLinguiMacroImport(
    j,
    root,
    config.linguiMacro,
    config.linguiMsgKey,
    config.linguiImport,
    config.linguiHook,
  );
  removeI18NextImport(j, root, config.i18NextImport);
  transformTranslationHook(j, root, config);
  transformTranslationCalls(j, root, api, translations, config);

  return root.toSource({ quote: 'single', trailingComma: true });
}

function ensureLinguiMacroImport(
  j: API['jscodeshift'],
  root: ReturnType<API['jscodeshift']>,
  linguiMacro: string,
  linguiMsgKey: string,
  lingui: string,
  linguiHook: string,
): void {
  const hasLinguiMacro =
    root.find(j.ImportDeclaration, {
      source: { value: linguiMacro },
    }).length > 0;

  const hasLingui =
    root.find(j.ImportDeclaration, {
      source: { value: linguiMacro },
    }).length > 0;

  if (!hasLinguiMacro) {
    const linguiMacroImport = j.importDeclaration(
      [j.importSpecifier(j.identifier(linguiMsgKey))],
      j.stringLiteral(linguiMacro),
    );

    root.get().node.program.body.unshift(linguiMacroImport);
  }

  if (!hasLingui) {
    const linguiImport = j.importDeclaration(
      [j.importSpecifier(j.identifier(linguiHook))],
      j.stringLiteral(lingui),
    );

    root.get().node.program.body.unshift(linguiImport);
  }
}

function removeI18NextImport(
  j: API['jscodeshift'],
  root: ReturnType<API['jscodeshift']>,
  i18NextImport: string,
): void {
  root
    .find(j.ImportDeclaration, {
      source: { value: i18NextImport },
    })
    .remove();
}

function transformTranslationHook(
  j: API['jscodeshift'],
  root: ReturnType<API['jscodeshift']>,
  config: ReactTransformerOptions['config'],
): void {
  root
    .find(j.VariableDeclarator, {
      init: { callee: { name: config.i18NextHook } },
    })
    .forEach((path) => {
      if (path.node.id.type === 'ObjectPattern') {
        path.node.id.properties.forEach((prop) => {
          if (
            prop.type === 'ObjectProperty' ||
            (prop.type === 'Property' &&
              prop.key.type === 'Identifier' &&
              prop.key.name === config.i18NextTKey)
          ) {
            prop.key = j.identifier(config.linguiKey);
            prop.value = j.identifier(config.linguiKey);
          }
        });
      }

      if (
        path.node.init?.type === 'CallExpression' &&
        path.node.init.callee.type === 'Identifier'
      ) {
        path.node.init.callee.name = config.linguiHook;
      }
    });
}

function transformTranslationCalls(
  j: API['jscodeshift'],
  root: ReturnType<API['jscodeshift']>,
  api: API,
  translations: Record<string, any>,
  config: ReactTransformerOptions['config'],
): void {
  root
    .find(j.CallExpression, { callee: { name: config.i18NextTKey } })
    .forEach((p) => {
      const keyArgument = p.node.arguments[0];
      if (
        keyArgument?.type !== 'StringLiteral' &&
        keyArgument?.type !== 'Literal'
      ) {
        api.report(
          `[${TransformErrors.InvalidTranslationKey}] Non-string key in ${p.node.loc?.start.line}:${p.node.loc?.start.column}`,
        );
        return;
      }

      const translationKey =
        keyArgument.type === 'StringLiteral'
          ? keyArgument.value
          : String(keyArgument.value);

      const translationValue = getI18NextTranslationValue(
        translations,
        translationKey,
        config.i18NextSeparator,
      );

      // Handle Missing Keys
      if (translationValue === null) {
        api.report(
          `[${TransformErrors.MissingKey}] Key "${translationKey}" not found in translations at ${p.node.loc?.start.line}:${p.node.loc?.start.column}`,
        );
        j(p).replaceWith(
          j.commentBlock(
            ` TODO: Missing translation for ${translationKey} at ${p.node.loc?.start.line}:${p.node.loc?.start.column} `,
          ),
        );
        return;
      }

      const formattedTranslationValue = translationValue
        .replace(/\{\{\s*/g, '${')
        .replace(/\s*\}\}/g, '}');

      // Successful transformation
      const msgTag = j.taggedTemplateExpression(
        j.identifier(config.linguiMsgKey),
        j.templateLiteral(
          [
            j.templateElement(
              {
                raw: formattedTranslationValue,
                cooked: formattedTranslationValue,
              },
              true,
            ),
          ],
          [],
        ),
      );

      j(p).replaceWith(
        j.callExpression(j.identifier(config.linguiKey), [msgTag]),
      );
    });
}

export const parser = 'tsx';

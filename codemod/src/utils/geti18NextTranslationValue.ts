export function getI18NextTranslationValue(
  translations: Record<string, any>,
  key: string,
  separator: string = ':',
): string | null {
  const subkeys = key.split(separator);
  const value = subkeys.reduce((target, subkey) => {
    return target && typeof target === 'object' ? target[subkey] : null;
  }, translations);

  return typeof value === 'string' ? value : null;
}

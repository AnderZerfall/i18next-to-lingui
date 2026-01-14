import { API, FileInfo, Options } from 'jscodeshift';
import transformer from '../transformer';

describe('transformer', () => {
  const mockTranslations = {
    app: {
      title: 'TS Translation App',
      switch: 'Change to Spanish',
    },
    content: {
      body: 'This is a type-safe implementation.',
    },
    status: {
      label: 'Current Language: English',
    },
  };

  it('should transform t() calls to _() calls with inlined translations', () => {
    const source = `
      const { t } = useTranslation();
      const title = t('app:title');
      const body = t('content:body');
    `;

    const expected = `
      import { msg } from '@lingui/macro';
      const { i18n: _ } = useLingui();
      const title = _(msg\`TS Translation App\`);
      const body = _(msg\`This is a type-safe implementation.\`);
    `;

    const fileInfo: FileInfo = {
      path: 'test.tsx',
      source,
    };

    const jscodeshift = require('jscodeshift');
    const api: API = {
      j: jscodeshift,
      jscodeshift,
      stats: () => {},
      report: () => {},
    };

    const options: Options = {
      translations: mockTranslations,
    };

    const result = transformer(fileInfo, api, options);

    // Normalize whitespace for comparison
    const normalizedResult = result?.replace(/\s+/g, ' ').trim();
    const normalizedExpected = expected.replace(/\s+/g, ' ').trim();

    expect(normalizedResult).toBe(normalizedExpected);
  });

  it('should handle nested translation keys', () => {
    const source = `
      const { t } = useTranslation();
      const label = t('status:label');
    `;

    const expected = `
      import { msg } from '@lingui/macro';
      const { i18n: _ } = useLingui();
      const label = _(msg\`Current Language: English\`);
    `;

    const fileInfo: FileInfo = {
      path: 'test.tsx',
      source,
    };

    const jscodeshift = require('jscodeshift');
    const api: API = {
      j: jscodeshift,
      jscodeshift,
      stats: () => {},
      report: () => {},
    };

    const options: Options = {
      translations: mockTranslations,
    };

    const result = transformer(fileInfo, api, options);

    const normalizedResult = result?.replace(/\s+/g, ' ').trim();
    const normalizedExpected = expected.replace(/\s+/g, ' ').trim();

    expect(normalizedResult).toBe(normalizedExpected);
  });
});

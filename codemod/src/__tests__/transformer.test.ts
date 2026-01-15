import { API, FileInfo, Options } from 'jscodeshift';
import transformer from '../transformers/react-transformer';

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
    interpolated: {
      value: 'Test string {{ value }}',
    },
  };

  const normalize = (value: string | null) =>
    value?.replace(/\s+/g, ' ').trim();

  const createApi = () => {
    const jscodeshift = require('jscodeshift');
    const report = jest.fn();
    const api: API = {
      j: jscodeshift,
      jscodeshift,
      stats: () => {},
      report,
    };

    return { api, report };
  };

  it('should transform t() calls to _() calls with inlined translations', () => {
    const source = `
      import { useTranslation } from 'react-i18next';
      const { t } = useTranslation();
      const title = t('app:title');
      const body = t('content:body');
    `;

    const expected = `
      import { useLingui } from '@lingui/react';
      import { msg } from '@lingui/macro';
      const { _ } = useLingui();
      const title = _(msg\`TS Translation App\`);
      const body = _(msg\`This is a type-safe implementation.\`);
    `;

    const fileInfo: FileInfo = {
      path: 'test.tsx',
      source,
    };

    const { api } = createApi();

    const options: Options = {
      translations: mockTranslations,
    };

    const result = transformer(fileInfo, api, options);

    expect(normalize(result)).toBe(normalize(expected));
  });

  it('should handle nested translation keys', () => {
    const source = `
      import { useTranslation } from 'react-i18next';
      const { t } = useTranslation();
      const label = t('status:label');
    `;

    const expected = `
      import { useLingui } from '@lingui/react';
      import { msg } from '@lingui/macro';
      const { _ } = useLingui();
      const label = _(msg\`Current Language: English\`);
    `;

    const fileInfo: FileInfo = {
      path: 'test.tsx',
      source,
    };

    const { api } = createApi();

    const options: Options = {
      translations: mockTranslations,
    };

    const result = transformer(fileInfo, api, options);

    expect(normalize(result)).toBe(normalize(expected));
  });

  it('should format interpolated string values for Lingui templates', () => {
    const source = `
      import { useTranslation } from 'react-i18next';
      const { t } = useTranslation();
      const value = 'World';
      const label = t('interpolated:value');
    `;

    const expected = `
      import { useLingui } from '@lingui/react';
      import { msg } from '@lingui/macro';
      const { _ } = useLingui();
      const value = 'World';
      const label = _(msg\`Test string \${value}\`);
    `;

    const fileInfo: FileInfo = {
      path: 'test.tsx',
      source,
    };

    const { api } = createApi();
    const options: Options = {
      translations: mockTranslations,
    };

    const result = transformer(fileInfo, api, options);

    expect(normalize(result)).toBe(normalize(expected));
  });

  it('should remove react-i18next import and avoid duplicating Lingui macro import', () => {
    const source = `
      import { msg } from '@lingui/macro';
      import { useLingui } from '@lingui/react';
      import { useTranslation } from 'react-i18next';
      const { t } = useTranslation();
      const title = t('app:title');
    `;

    const fileInfo: FileInfo = {
      path: 'test.tsx',
      source,
    };

    const { api } = createApi();
    const options: Options = {
      translations: mockTranslations,
    };

    const result = transformer(fileInfo, api, options);

    expect(result).not.toContain("from 'react-i18next'");
    expect(result?.match(/@lingui\/macro/g)?.length).toBe(1);
  });

  it('should leave non-string keys intact and report an error', () => {
    const source = `
      const { t } = useTranslation();
      const key = 'app:title';
      const title = t(key);
    `;

    const fileInfo: FileInfo = {
      path: 'test.tsx',
      source,
    };

    const { api, report } = createApi();
    const options: Options = {
      translations: mockTranslations,
    };

    const result = transformer(fileInfo, api, options);

    expect(result).toContain('t(key)');
    expect(report).toHaveBeenCalledWith(
      expect.stringContaining('InvalidTranslationKey'),
    );
  });

  it('should replace missing keys with a TODO comment and report', () => {
    const source = `
      const { t } = useTranslation();
      const title = t('missing:key');
    `;

    const fileInfo: FileInfo = {
      path: 'test.tsx',
      source,
    };

    const { api, report } = createApi();
    const options: Options = {
      translations: mockTranslations,
    };

    const result = transformer(fileInfo, api, options);

    expect(result).toContain('Missing translation for missing:key');
    expect(report).toHaveBeenCalledWith(expect.stringContaining('MissingKey'));
  });
});

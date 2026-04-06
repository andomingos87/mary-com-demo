import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { routing } from './routing';

const LOCALE_COOKIE = 'NEXT_LOCALE';

function parseAcceptLanguage(value: string | null): string | null {
  if (!value) return null;
  const preferred = value.split(',')[0]?.split('-')[0]?.toLowerCase();
  if (preferred === 'en') return 'en-us';
  if (preferred === 'es') return 'es';
  if (preferred === 'pt') return 'pt-br';
  return null;
}

const DICTIONARY_LOADERS: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  'pt-br': () => import('./dictionaries/pt-br.json'),
  'en-us': () => import('./dictionaries/en-us.json'),
  es: () => import('./dictionaries/es.json'),
};

export default getRequestConfig(async () => {
  const store = await cookies();
  let locale = store.get(LOCALE_COOKIE)?.value;
  if (!locale || !routing.locales.includes(locale)) {
    const acceptLang = (await headers()).get('Accept-Language');
    locale = parseAcceptLanguage(acceptLang) ?? routing.defaultLocale;
  }

  const loadDictionary = DICTIONARY_LOADERS[locale] ?? DICTIONARY_LOADERS[routing.defaultLocale];
  const messages = (await loadDictionary()).default;
  return { locale, messages };
});

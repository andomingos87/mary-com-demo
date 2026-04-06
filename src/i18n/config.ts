export const SUPPORTED_LOCALES = ['pt-br', 'en-us', 'es'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt-br';

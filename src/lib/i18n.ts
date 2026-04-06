/**
 * @deprecated Use getTranslations from next-intl/server in Server Components,
 * or useTranslations from next-intl in Client Components.
 * Kept for backward compatibility during incremental i18n migration.
 */
import ptBr from "../i18n/dictionaries/pt-br.json";

export type Dictionary = typeof ptBr;

export const getDictionary = (locale: string = "pt-br"): Dictionary => {
  return ptBr;
};


import type { Lang } from '../preferences/storageKeys';
import type { LocalizedText } from '../content/types';
import { en } from './en';
import { es, type Dictionary } from './es';

export const dictionaries: Record<Lang, Dictionary> = { es, en };
export type { Dictionary };

/** Sustituye `{clave}` por valores: format('{count} sectores', { count: 10 }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export const pick = (text: LocalizedText, lang: Lang): string => text[lang];

const dateFormatters = new Map<Lang, Intl.DateTimeFormat>();
export function formatDate(iso: string, lang: Lang): string {
  let f = dateFormatters.get(lang);
  if (!f) {
    f = new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    dateFormatters.set(lang, f);
  }
  return f.format(new Date(`${iso}T00:00:00Z`));
}

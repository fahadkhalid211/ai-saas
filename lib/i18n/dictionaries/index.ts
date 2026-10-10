import type { SupportedLocale } from '../types';
import type { TranslationDictionary } from './types';
import { enDict } from './en';
import { svDict } from './sv';
import { fiDict } from './fi';
import { itDict } from './it';
import { esDict } from './es';

export type { TranslationDictionary } from './types';

export const DICTIONARIES: Record<SupportedLocale, TranslationDictionary> = {
  en: enDict,
  sv: svDict,
  fi: fiDict,
  it: itDict,
  es: esDict,
};

export function getDictionary(locale: SupportedLocale): TranslationDictionary {
  return DICTIONARIES[locale] || DICTIONARIES.en;
}

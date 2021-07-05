
export interface AlertText {
  title: string;
  message: string;
}

/**
 * Based on: https://cloud.google.com/translate/docs/reference/rest/v3/SupportedLanguages#SupportedLanguage
 */
export interface SupportedLanguage {
  languageCode: string;
  displayName: string;
}

export type TranslatedTextMap = { [languageCode: string]: string | undefined };
export type TranslationStatusMap = { [languageCode: string]: TranslationStatus | undefined };

export enum TranslationStatus {
  NotTranslated = 0,
  InProgress = 1,
  Translated = 2,
}

/**
 * Internal reference used to hot-swap text
 */
export interface TranslatedNode {
  originalText: string;
  currentLanguage: string;
  translatedText: TranslatedTextMap;
  translationStatus: TranslationStatusMap;
  node: Node;
  isIntersecting: boolean;
  parentElement: HTMLElement | null;
}

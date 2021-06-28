
export interface AlertText {
  title: string;
  message: string;
}

/**
 * The arguments when launching the widget
 */
export interface DropdownOptions {
  // The source language of the document
  pageLanguage: string;
  // Limit the number of supported languages to only those found in this array
  // The array should contain the languageCode which corresponds to the intended language
  preferredSupportedLanguages: string[];
  // The URL of the image listed below the dropdown element
  // Used for adhering to the Google Translate API attribution requirements
  attributionImageUrl: string | undefined;
  logoImageUrl: string | undefined;
  /**
   * Translations are done in batches instead of all at once.
   * Batches are made to prevent an API error of translating too many
   * things at once. This parameter specifies the size of each batch,
   * in the number of Nodes processed.
   */
  chunkSize: number;
  /**
   * A single number between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target.
   * A value of 0.0 means that even a single visible pixel counts as the target being visible.
   * 1.0 means that the entire target element is visible.
   * See: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver
   */
  intersectionThreshold: number;
  /**
   * Used for specifying message that appears when the help and info button are pressed.
   * Providing undefined disables and hides the button.
   */
  helpText: AlertText | undefined;
  infoText: AlertText | undefined;
  /**
   * URL of the endpoints for the API backing this widget
   */
  endpoints: {
    supportedLanguages: string;
    translate: string;
  }
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

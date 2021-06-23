
/**
 * Internal reference used to hot-swap text
 */
export interface TranslatedNode {
  originalText: string;
  translatedText: string | undefined;
  node: Node;
}

/**
 * The arguments when launching the widget
 */
export interface DropdownOptions {
  // The source language of the document
  pageLanguage: string;
  // The URL of the image listed below the dropdown element
  // Used for adhering to the Google Translate API attribution requirements
  attributionImageUrl: string;
  /**
   * Translations are done in batches instead of all at once.
   * Batches are made to prevent an API error of translating too many
   * things at once. This parameter specifies the size of each batch,
   * in the number of Nodes processed.
   */
  chunkSize: number;
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


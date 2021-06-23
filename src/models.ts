
export interface TranslatedNode {
  originalText: string;
  translatedText: string | undefined;
  node: Node;
}


export interface DropdownOptions {
  pageLanguage: string;
  attributionImageUrl: string;
  chunkSize: number;
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


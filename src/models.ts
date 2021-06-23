
export interface DropdownOptions {
  pageLanguage: string;
  attributionImageUrl: string;
  endpoints: {
    supportedLanguages: string;
  }
}

/**
 * Based on: https://cloud.google.com/translate/docs/reference/rest/v3/SupportedLanguages#SupportedLanguage
 */
export interface SupportedLanguage {
  languageCode: string;
  displayName: string;
}


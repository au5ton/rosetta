import { BannerButton } from './Banner'

/**
 * The arguments when launching the widget
 */
export interface DropdownOptions {
  // The source language of the document
  pageLanguage: string;
  // An optional identifier for the site being translated
  siteName: string;
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
   * Translations will be made to elements, even if they aren't detected to be intersecting with the page.
   * The behavior of this option is untested and isn't recommended.
   */
  ignoreIntersection: boolean;
  /**
   * Classes to ignore when translating. Useful for specifing other widgets or third-party sections
   * where adding the ".skiptranslate" class is impractical.
   *
   * Example:
   *  Ignore Google Place Autocomplete popovers
   *  ['pac-container', 'pac-logo']
   */
  ignoreClasses: string[];
  /**
   * Selectors to ignore when translating. Useful for specifing other widgets or third-party sections
   * where adding the ".skiptranslate" class is impractical.
   *
   * uses Element.matches() on candidate nodes
   * see: https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   */
  ignoreSelectors: string[];
  /**
   * Should the "lang" attribute of the <html> element be updated as languages are changed?
   * This can have adverse effects on other tools which rely on a specific value to be present.
   */
  updateDocumentLanguageAttribute: boolean;
  /**
   * Should helpful debugging messages be printed?
   */
  verboseOutput: boolean;
  /**
   * Used for specifying custom buttons which appear at the top right
   * of the banner next to the "close" button. Useful for providing
   * a better UX such as custom instructions or functionality.
   *
   * Some pre-included icons are 'help' or 'info', otherwise include
   * a URL to an image.
   */
  buttons: BannerButton[];
  /**
   * List attributes in elements to be included in the translation
   *
   * Example:
   *  ['title', 'alt']
   *
   * Defaults to:
   *  ['title', 'placeholder', 'alt']
   */
  includedAttributes: string[];
  /**
   * URL of the endpoints for the API backing this widget
   */
  endpoints: {
    supportedLanguages: string;
    updateTranslation: string;
    translate: string;
  }
}

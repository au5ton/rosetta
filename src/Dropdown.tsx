import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { css } from '@emotion/css'
import useSWR from 'swr'
import { useMutationObserver, useSessionstorage } from 'rooks'
import { Banner } from './Banner'
import { DropdownOptions, SupportedLanguage, TranslatedNode, TranslatedTextMap, TranslationStatus, TranslationStatusMap } from './models'
import { chunkedArray, customFilter, existsInside, textNodesUnder, translate } from './util'

const styles = {
  wrap: css`
    width: 150px;
  `,
  gadgetSelect: css`
    width: 100%;
    margin: 4px 0;
  `,
  attribution: css`
    width: 100%;
  `
};

export function Dropdown(props: { options: DropdownOptions }) {
  const { options } = props
  // fetch the supported languages by our provider
  const { data } = useSWR<SupportedLanguage[]>(`${options.endpoints.supportedLanguages}?target=${options.pageLanguage}`);
  // store the supported languages seperately from the API call
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([ { displayName: 'Select Language', languageCode: '' } ]);
  // for UI
  const [language, setLanguage] = useState('');
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [translatedNodes, setTranslatedNodes] = useState<TranslatedNode[]>([]);
  const bodyRef = useRef(document.body);
  const htmlRef = useRef(document.querySelector('html'));
  const [lastLanguage, setLastLanguage] = useSessionstorage('@au5ton/translate-widget/lastLanguage');

  // Only run on first mount
  useEffect(() => {
    if(lastLanguage !== null) {
      setLanguage(lastLanguage);
    }
  }, []);

  /**
   * Here, the results from our IntersectionObserver are merged with our existing dataset
   */
  const handleElementIntersection = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    setTranslatedNodes(previous => {
      const result = previous.slice();
      // for all items
      for(let item of result) {
        for(let entry of entries) {
          // if we find a matching pair
          if(item.parentElement && item.parentElement.isSameNode(entry.target)) {
            item.isIntersecting = entry.isIntersecting;
          } 
        }
      }
      return result;
    })
  }

  /**
   * Used for determining if an element is visible in the viewport or not before translating it
   * See: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
   */
  const intersectionObserver = useRef(new IntersectionObserver(handleElementIntersection, {
    // https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#parameters
    // root: document.body,
    // rootMargin?: string;
    threshold: options.intersectionThreshold,
  }))
  
  /**
   * Whenever changes are made to the DOM, adjust translatedNodes accordingly
   * This includes:
   * - Whenever an element is added or removed
   * - Whenever an element's text changes
   */
  const handleDocumentMutation: MutationCallback = (mutations) => {
    // wrap in this so we don't have race conditions
    setTranslatedNodes(previous => {
      const result = previous.slice();
      for(let mutation of mutations) {
        // If an element is added or removed
        if(mutation.type === 'childList') {
          // Add the added nodes to translatedNodes
          for(let i = 0; i < mutation.addedNodes.length; i++) {
            // use this as a shorthand
            const node = mutation.addedNodes[i];
            // check if this is a Node we even want, reusing our custom filter
            if(customFilter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
              // make sure this node isn't one we're already watching
              if(! existsInside(result, e => e.node.isSameNode(node))) {
                const nativeLang: TranslatedTextMap = {};
                nativeLang[options.pageLanguage] = node.nodeValue ?? '';
                const nativeStatus: TranslationStatusMap = {};
                nativeStatus[options.pageLanguage] = TranslationStatus.Translated;

                // add to intersection observer
                if(node.parentElement) intersectionObserver.current.observe(node.parentElement);

                result.push({
                  originalText: node.nodeValue ?? '',
                  currentLanguage: options.pageLanguage,
                  translatedText: {},
                  translationStatus: nativeStatus,
                  node,
                  isIntersecting: false,
                  parentElement: node.parentElement
                });
              }
            }
            // if this is not a Node that we want, maybe it's children are
            else {
              const children = textNodesUnder(node);
              for(let child of children) {
                // make sure this node isn't one we're already watching
                if(! existsInside(result, e => e.node.isSameNode(child))) {
                  const nativeLang: TranslatedTextMap = {};
                  nativeLang[options.pageLanguage] = child.nodeValue ?? '';
                  const nativeStatus: TranslationStatusMap = {};
                  nativeStatus[options.pageLanguage] = TranslationStatus.Translated;

                  // add to intersection observer
                  if(child.parentElement) intersectionObserver.current.observe(child.parentElement);

                  result.push({
                    originalText: child.nodeValue ?? '',
                    currentLanguage: options.pageLanguage,
                    translatedText: nativeLang,
                    translationStatus: nativeStatus,
                    node: child,
                    isIntersecting: false,
                    parentElement: node.parentElement
                  });
                }
              }
            }
          }
          // Remove the removed nodes from translatedNodes
          for(let i = 0; i < mutation.removedNodes.length; i++) {
            // use this as a shorthand
            const node = mutation.removedNodes[i];
            // check if this is a Node we are monitoring, reusing our custom filter
            if(customFilter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
              // find the index of this node in translatedNodes
              const index = result.findIndex(e => e.node.isSameNode(node));
              // check if this is a node we're watching
              if(index >= 0) {

                // remove from intersection observer
                if(node.parentElement) intersectionObserver.current.unobserve(node.parentElement);

                // remove it
                result.splice(index, 1);
              }
            }
            // if this is not a Node that we want, maybe it's children are
            else {
              const children = textNodesUnder(node);
              for(let child of children) {
                // find the index of this node in translatedNodes
                const index = result.findIndex(e => e.node.isSameNode(child)); // TODO: inefficient
                // check if this is a node we're watching
                if(index >= 0) {

                  // remove from intersection observer
                  if(child.parentElement) intersectionObserver.current.unobserve(child.parentElement);

                  // remove it
                  result.splice(index, 1);
                }
              }
            }
          }
        }
        // If the text of an element changed
        if(mutation.type === 'characterData') {

          // TODO: remove later when we figured out how to stop the feedback loop
          continue;

          // find the index of this node in translatedNodes
          const index = result.findIndex(e => e.node.isSameNode(mutation.target)); // TODO: inefficient
          // check if this is a node we're watching
          if(index >= 0) {
            // TODO: determine if changes are significant enough to do a round-trip call to translate it
            
            // clear out old translation data
            for(let key in result[index].translatedText) {
              result[index].translatedText[key] = undefined;
              result[index].translationStatus[key] = TranslationStatus.NotTranslated;
            }
  
            // update native translation data
            result[index].originalText = mutation.target.nodeValue ?? '';
            result[index].translatedText[options.pageLanguage] = result[index].originalText;
            result[index].translationStatus[options.pageLanguage] = TranslationStatus.Translated;
          }
          
        }
      }
      return result;
    });
  };

  /**
   * Watch the DOM for changes
   * See:
   * - https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
   * - https://www.npmjs.com/package/@rooks/use-mutation-observer
   */
  useMutationObserver(bodyRef, handleDocumentMutation);

  /**
   * update <select> once the languages load for the first time
   */
  useEffect(() => {
    // this condition should only happen on the first load
    if(data !== undefined && supportedLanguages.length === 1) {
      // if we only want a handful of languages to show instead of the entire list
      if(options.preferredSupportedLanguages.length > 1) {
        setSupportedLanguages(x => [
          ...x, 
          ...data
            .filter(e => options.preferredSupportedLanguages.includes(e.languageCode))
        ]);
      }
      else {
        setSupportedLanguages(x => [
          ...x, 
          ...data
        ]);
      }
    }
  }, [data])

  /**
   * Respond to changes in language
   */
  useEffect(() => {
    console.log('language changed')
    if(language !== '' && options.pageLanguage !== language) {
      setShowBanner(true);
      htmlRef.current?.setAttribute('lang', `${language}-x-mtfrom-${options.pageLanguage}`);
    }
    else {
      htmlRef.current?.setAttribute('lang', options.pageLanguage);
    }
    setLastLanguage(language)
  }, [language])

  /**
   * Initialize translatedNodes and repopulate translations if they are missing
   * This pairs with handleDocumentMutation
   */
  useEffect(() => {
    console.log('translatedNodes effect! language: ', language, translatedNodes);
    // if translatedNodes is not initialized, initialize it
    if(translatedNodes.length === 0) {
      // get all leaf text nodes
      const nodes = textNodesUnder(document.body);
      // compose our result
      setTranslatedNodes(nodes.map(node => {
        const nativeLang: TranslatedTextMap = {};
        nativeLang[options.pageLanguage] = node.nodeValue ?? '';
        const nativeStatus: TranslationStatusMap = {};
        nativeStatus[options.pageLanguage] = TranslationStatus.Translated;

        // add to intersection observer
        if(node.parentElement) intersectionObserver.current.observe(node.parentElement);

        return {
          originalText: node.nodeValue ?? '',
          currentLanguage: options.pageLanguage,
          translatedText: nativeLang,
          translationStatus: nativeStatus,
          node,
          isIntersecting: false,
          parentElement: node.parentElement
        }
      }));
    }
    // if translatedNodes is already initialized
    else {
      // check that the language isn't set to the "Select Language" dropdown
      if(language !== '') {
        (async () => {
          // filter translatedNodes to get a list of nodes that aren't translated to the current language, AND that are visible in the viewport currently
          const needsTranslating = translatedNodes
            .filter(e => e.translatedText[language] === undefined && 
              (e.translationStatus[language] === undefined ||  
              e.translationStatus[language] === TranslationStatus.NotTranslated) &&
              e.isIntersecting === true);

          console.log(`needs translating (${needsTranslating.length}): `, needsTranslating);
          // if any translations need to be fetched, do them
          // prevent infinite loop because we'll be setting the state
          if(needsTranslating.length > 0) {
            // we're about to do a bunch of stuff, let's put up a loading spinner
            setIsLoading(true);
            // mark these nodes as "in progress", so our chunked changes don't issue duplicate requests
            setTranslatedNodes(previous => {
              const results = previous.slice();
              for(let i = 0; i < needsTranslating.length; i++) {
                for(let j = 0; j < results.length; j++) {
                  if(needsTranslating[i].node.isSameNode(results[j].node)) {
                    results[j].translationStatus[language] = TranslationStatus.InProgress;
                  }
                }
              }
              return results;
            });

            // fetch and apply translations
            for(let chunk of chunkedArray(needsTranslating, options.chunkSize)) {
              // actually do translating
              const data = await translate(options.endpoints.translate, chunk.map(e => e.originalText), options.pageLanguage, language);
              setTranslatedNodes(previous => {
                const results = previous.slice();
                for(let i = 0; i < chunk.length; i++) {
                  // find where this chunk's node exists in the state
                  const index = results.findIndex(e => e.node.isSameNode(chunk[i].node));
                  // if we could find it, update the state
                  if(index >= 0) {
                    results[index].translatedText[language] = data[i];
                    results[index].translationStatus[language] = TranslationStatus.Translated;
                    /**
                     * intentionally don't update the DOM here so we can update the DOM on the next effect call
                     * that will happen as a result of our state changes here
                     */
                    //previous[index].node.nodeValue = previous[index].translatedText[language] ?? '';
                  }
                }
                return results;
              });
            }
            setIsLoading(false);
          }
        })();

        // update the DOM with whatever is stored in the state
        // check if any of the "currentLanguage" is different from the dropdown setting
        if(translatedNodes.some(e => e.currentLanguage !== language && e.translatedText[language] !== undefined && e.isIntersecting === true)) {
          setTranslatedNodes(previous => {
            const results = previous.slice();
            // update "currentLanguage" field and update DOM
            for(let i = 0; i < results.length; i++) {
              // if "currentLanguage" is different from the dropdown setting
              if(results[i].currentLanguage !== language && results[i].translatedText[language] !== undefined) {
                results[i].node.nodeValue = results[i].translatedText[language] ?? '';
                results[i].currentLanguage = language;
              }
            }
            return results;
          })
        }
      }
    }
  }, [language, translatedNodes]);

  // whenever a new language option is selected
  const handleChange = (languageCode: string) => {
    setLanguage(languageCode);
    setSupportedLanguages(x => {
      // check if placeholder exists
      const placeholderIndex = x.findIndex(e => e.languageCode === '');
      if(placeholderIndex >= 0) {
        // remove if it exists
        x.splice(placeholderIndex, 1);
      }

      // move the native language to the top of the list
      x.unshift(x.splice(x.findIndex(e => e.languageCode === options.pageLanguage), 1)[0]);
      return x;
    });
  }

  /**
   * What happens when the Banner's exit button is clicked
   */
  const handleExit = () => {
    setLanguage(options.pageLanguage)
    setShowBanner(false)
  }

  return (
    <div className={`${styles.wrap} skiptranslate`}>
      <select value={language} onChange={e => handleChange(e.target.value)} className={styles.gadgetSelect} aria-label="Language Translate Widget">
        {
          supportedLanguages.map(e => <option key={e.languageCode} value={e.languageCode}>{e.displayName}</option>)
        }
      </select>
      { options.attributionImageUrl ? <img className={styles.attribution} src={options.attributionImageUrl} /> : <></>}
      {/* <p>language: {language}</p>
      <p>prop language: {options.pageLanguage}</p>
      <button onClick={handleClick}>Highlight Nodes</button> */}
      {showBanner ? createPortal(
        <Banner 
          pageLanguage={options.pageLanguage} 
          language={language} 
          supportedLanguages={supportedLanguages} 
          logoImageUrl={options.logoImageUrl} 
          isLoading={isLoading} 
          helpText={props.options.helpText} 
          infoText={props.options.infoText} 
          handleExit={handleExit}
          handleLanguageChange={handleChange} />
      , document.body) : ''}
    </div>
  );
}

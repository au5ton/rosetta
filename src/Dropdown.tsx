import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { css } from '@emotion/css'
import useSWR from 'swr'
import { useMutationObserver, useSessionstorage } from 'rooks'
import { Banner } from './Banner'
import { SupportedLanguage, TranslatedNode, TranslatedTextMap, TranslationStatus, TranslationStatusMap } from './models'
import { DropdownOptions } from './options'
import { chunkedArray, existsInside, translate } from './util'
import { CustomTreeWalker, getNearestVisibleAncestor } from './customTreeWalker'

const styles = {
  wrap: css`
    width: 160px;
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
  const { data, error: dataError } = useSWR<SupportedLanguage[]>(`${options.endpoints.supportedLanguages}?target=${options.pageLanguage}&siteName=${options.siteName}`);
  const isSupportedLanguageLoading = dataError || !data;
  // store the supported languages seperately from the API call
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([ { displayName: 'Select Language', languageCode: '' } ]);
  // for UI
  const [language, setLanguage] = useState('');
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(isSupportedLanguageLoading);
  const [translatedNodes, setTranslatedNodes] = useState<TranslatedNode[]>([]);
  const bodyRef = useRef(document.body);
  const htmlRef = useRef(document.querySelector('html'));
  const [lastLanguage, setLastLanguage] = useSessionstorage('@au5ton/translate-widget/lastLanguage');
  const [customTreeWalker, _] = useState(new CustomTreeWalker(options));

  // Only run on first mount
  useEffect(() => {
    if(lastLanguage !== null) {
      setLanguage(lastLanguage);
    }
  }, []);

  /**
   * Here, the results from our IntersectionObserver are merged with our existing dataset
   */
  const handleElementIntersection = (entries: IntersectionObserverEntry[]) => {
    setTranslatedNodes(previous => {
      const result = previous.slice();
      // for all items
      for(let item of result) {
        for(let entry of entries) {
          // if we find a matching pair
          if(item.nearestVisibleAncestor && item.nearestVisibleAncestor.isSameNode(entry.target)) {
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
            if(customTreeWalker.customFilter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
              // make sure this node isn't one we're already watching
              // TODO: rework for attribute nodes
              /**
               * TODO: rework for attribute nodes
               * - we aren't going to mess with attributes here because 
               *   we're within the context of customTreeWalker.customFilter.
               *   in this context, we're ONLY dealing with nodeValue/text nodes
               * - change condition to "! existsInside(result, e => ... && e.attributeType === 'text' )"
               *   or something like that
               */
              if(! existsInside(result, e => e.node.isSameNode(node))) {
                const nativeLang: TranslatedTextMap = {};
                nativeLang[options.pageLanguage] = node.nodeValue ?? '';
                const nativeStatus: TranslationStatusMap = {};
                nativeStatus[options.pageLanguage] = TranslationStatus.Translated;

                const ancestor = getNearestVisibleAncestor(node);

                // add to intersection observer
                if(ancestor) intersectionObserver.current.observe(ancestor);

                result.push({
                  originalText: node.nodeValue ?? '',
                  currentLanguage: options.pageLanguage,
                  translatedText: {},
                  translationStatus: nativeStatus,
                  node,
                  isIntersecting: false,
                  nearestVisibleAncestor: ancestor
                });
              }
            }
            // if this is not a Node that we want, maybe it's children are
            else {
              const children = customTreeWalker.textNodesUnder(node);
              for(let child of children) {
                // make sure this node isn't one we're already watching
                // TODO: same as above
                if(! existsInside(result, e => e.node.isSameNode(child))) {
                  const nativeLang: TranslatedTextMap = {};
                  nativeLang[options.pageLanguage] = child.nodeValue ?? '';
                  const nativeStatus: TranslationStatusMap = {};
                  nativeStatus[options.pageLanguage] = TranslationStatus.Translated;

                  const ancestor = getNearestVisibleAncestor(child);

                  // add to intersection observer
                  if(ancestor) intersectionObserver.current.observe(ancestor);

                  result.push({
                    originalText: child.nodeValue ?? '',
                    currentLanguage: options.pageLanguage,
                    translatedText: nativeLang,
                    translationStatus: nativeStatus,
                    node: child,
                    isIntersecting: false,
                    nearestVisibleAncestor: ancestor
                  });
                }
              }
            }

            /**
             * TODO:
             * - above, we checked for nodes which satisfy our criteria for text/"nodeValue" nodes
             * - below, we're going to do the same thing but for "attribute" nodes
             * - a custom tree walker would probably help. in fact, it might be perfect
             *   because it means that we can reuse code and copy/paste patterns that
             *   already work well.
             */

            // TODO: insert code here
          }
          // Remove the removed nodes from translatedNodes
          for(let i = 0; i < mutation.removedNodes.length; i++) {
            // use this as a shorthand
            const node = mutation.removedNodes[i];
            // check if this is a Node we are monitoring, reusing our custom filter
            // TODO: similar to above, make sure this only affects text/"nodeValue" nodes
            if(customTreeWalker.customFilter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
              // find the index of this node in translatedNodes
              const index = result.findIndex(e => e.node.isSameNode(node));
              // check if this is a node we're watching
              if(index >= 0) {

                // remove from intersection observer
                /**
                 * TODO: make sure we aren't "unobserve"ing a shared ancestor
                 * - this should only be called if there is only 1 node which has this ancestor value
                 * - if there are multiple nodes that have this ancestor value, just delete this 
                 *   node and skip "unobserve"
                 * - when the last node which contains this "ancestor" is removed, this condition 
                 *   will kick in and then we will properly "unobserve"
                 */
                if(result[index].nearestVisibleAncestor) intersectionObserver.current.unobserve(result[index].nearestVisibleAncestor!);

                // remove it
                result.splice(index, 1);
              }
            }
            // if this is not a Node that we want, maybe it's children are
            else {
              const children = customTreeWalker.textNodesUnder(node);
              for(let child of children) {
                // find the index of this node in translatedNodes
                const index = result.findIndex(e => e.node.isSameNode(child)); // TODO: inefficient
                // check if this is a node we're watching
                if(index >= 0) {

                  // remove from intersection observer
                  // TODO: similar to above, shared ancestor
                  if(result[index].nearestVisibleAncestor) intersectionObserver.current.unobserve(result[index].nearestVisibleAncestor!);

                  // remove it
                  result.splice(index, 1);
                }
              }
            }

            // TODO: similar to above, process for "attribute" nodes
            
            // TODO: insert code here
          }
        }
        // If the text of an element changed
        /**
         * TODO: 
         * - mutation type 'characterData' ONLY affects text/"nodeValue" nodes!
         * - take action accordingly
         */
        if(mutation.type === 'characterData') {

          // find the index of this node in translatedNodes
          const index = result.findIndex(e => e.node.isSameNode(mutation.target));
          // check if this is a node we're watching
          if(index >= 0) {
            // check if the mutation was NOT as a result of translating, and instead was updated by some other factor
            if(result[index].translationStatus[language] === TranslationStatus.Translated && result[index].translatedText[language] !== mutation.target.nodeValue) {
              // this mutation is one that we didnt make, so we have to update the state so it will be translated in the Effect hook

              // Update information about all languages we've translated to
              // Setting these values will cause the Effect hook to pick up on it
              // clear out old translation data
              for(let key in result[index].translatedText) {
                result[index].translatedText[key] = undefined;
                result[index].translationStatus[key] = TranslationStatus.NotTranslated;
              }

              // Update information about the page's native language
              result[index].originalText = mutation.target.nodeValue ?? '';
              result[index].translatedText[options.pageLanguage] = result[index].originalText;
              result[index].translationStatus[options.pageLanguage] = TranslationStatus.Translated;
              result[index].currentLanguage = options.pageLanguage;
            }
            else {
              // this mutation is one that we probably caused, so we don't want to translate it again
              //console.log('this mutation was probably us')
            }
          }
        }

        /**
         * TODO:
         * - respond to mutation.type === 'attributes'
         * - this will ONLY affect "attribute" nodes
         * - take action accordingly
         */

        // TODO: insert code here
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
    if(options.verboseOutput) console.log('language changed')
    if(language !== '' && options.pageLanguage !== language) {
      setShowBanner(true);
      if(options.updateDocumentLanguageAttribute) htmlRef.current?.setAttribute('lang', `${language}-x-mtfrom-${options.pageLanguage}`);
    }
    else {
      if(options.updateDocumentLanguageAttribute) htmlRef.current?.setAttribute('lang', options.pageLanguage);
    }
    setLastLanguage(language)
  }, [language])

  /**
   * Initialize translatedNodes and repopulate translations if they are missing
   * This pairs with handleDocumentMutation
   */
  useEffect(() => {
    if(options.verboseOutput) console.log('translatedNodes effect! language: ', language, translatedNodes);
    // if translatedNodes is not initialized, initialize it
    if(translatedNodes.length === 0) {
      // get all leaf text nodes
      const nodes = customTreeWalker.textNodesUnder(document.body);
      // TODO: get nodes with attributes
      // compose our result
      setTranslatedNodes(nodes.map(node => {
        const nativeLang: TranslatedTextMap = {};
        nativeLang[options.pageLanguage] = node.nodeValue ?? ''; // TODO: something else depending on type field
        const nativeStatus: TranslationStatusMap = {};
        nativeStatus[options.pageLanguage] = TranslationStatus.Translated;

        const ancestor = getNearestVisibleAncestor(node);

        // add to intersection observer
        if(ancestor) intersectionObserver.current.observe(ancestor);

        return {
          originalText: node.nodeValue ?? '',
          currentLanguage: options.pageLanguage,
          translatedText: nativeLang,
          translationStatus: nativeStatus,
          node,
          isIntersecting: false,
          nearestVisibleAncestor: ancestor,
          // TODO: set some properties that distinguish text nodes from attribute nodes
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
              (options.ignoreIntersection === true || e.isIntersecting === true));

          if(options.verboseOutput) console.log(`needs translating (${needsTranslating.length}): `, needsTranslating);
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
              const data = await translate(options.endpoints.translate, chunk.map(e => e.originalText), options.pageLanguage, language, options.siteName);
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
          }
        })();

        // update the DOM with whatever is stored in the state
        // check if any of the "currentLanguage" is different from the dropdown setting
        if(translatedNodes.some(e => e.currentLanguage !== language && e.translatedText[language] !== undefined && (options.ignoreIntersection === true || e.isIntersecting === true))) {
          setTranslatedNodes(previous => {
            const results = previous.slice();
            // update "currentLanguage" field and update DOM
            for(let i = 0; i < results.length; i++) {
              // if "currentLanguage" is different from the dropdown setting
              if(results[i].currentLanguage !== language && results[i].translatedText[language] !== undefined) {
                results[i].node.nodeValue = results[i].translatedText[language] ?? ''; // TODO: do something different depending on type
                results[i].currentLanguage = language;
              }
            }
            return results;
          })
        }

        if(translatedNodes.some(e => e.translationStatus[language] === TranslationStatus.InProgress)) {
          setIsLoading(true);
        }
        else {
          setIsLoading(false);
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

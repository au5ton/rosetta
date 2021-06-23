import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { css } from '@emotion/css'
import useSWR from 'swr'
import { Banner } from './Banner'
import { DropdownOptions, SupportedLanguage, TranslatedNode } from './models'
import { chunkedArray, textNodesUnder } from './util'

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
  const [language, setLanguage] = useState('')
  const showBanner = language !== options.pageLanguage && language !== '';
  const [translatedNodes, setTranslatedNodes] = useState<TranslatedNode[]>([]);

  // update <select> once the languages load for the first time
  useEffect(() => {
    if(data !== undefined && supportedLanguages.length === 1) {
      setSupportedLanguages(x => [...x, ...data]);
    }
  }, [data])

  // initialize translatedNodes
  useEffect(() => {
    // if we haven't done a translation before
    if(translatedNodes.length === 0) {
      // get all leaf text nodes
      const nodes = textNodesUnder(document.body);
      // compose our result
      setTranslatedNodes(nodes.map(node => ({
        originalText: node.nodeValue ?? '',
        translatedText: undefined,
        node
      })));
    }
  }, [translatedNodes]);

  // whenever a new language option is selected
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
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
    translate(options.pageLanguage, e.target.value);
  }

  // actually do the translation
  const translate = async (from: string, to: string) => {
    // confirm that we've done a translation before
    if(translatedNodes.length > 0) {
      console.table(translatedNodes) 
      // if we're going back to the native language
      if(from === to) {
        // copy back the original text
        for(let e of translatedNodes) {
          e.node.nodeValue = e.originalText;
        }
      }
      else {
        // perform translations in chunks
        for(let chunk of chunkedArray(translatedNodes, 10)) {
          const res = await fetch(`${options.endpoints.translate}?from=${from}&to=${to}`, { 
            method: 'POST',
            body: JSON.stringify(chunk.map(e => e.originalText)),
            headers: {
              'Content-Type': 'application/json'
            },
          });
          const data = await res.json() as string[];
          for(let i = 0; i < chunk.length; i++) {
            // actually do translating
            chunk[i].translatedText = data[i];
            chunk[i].node.nodeValue = chunk[i].translatedText ?? '';
          }
        }
      }
    }
    if(translatedNodes.length === 0) {
      // get all leaf text nodes
      const nodes = textNodesUnder(document.body);
      // compose our result
      setTranslatedNodes(nodes.map(node => ({
        originalText: node.nodeValue ?? '',
          translatedText: undefined,
          node
      })));
    }
  }

  // for debugging
  const handleClick = () => {
    const nodes = textNodesUnder(document.body);
    nodes.forEach(e => {
      if(e.parentElement) {
        e.parentElement.style.backgroundColor = 'red';
      }
    });
  }

  return (
    <div className={`${styles.wrap} skiptranslate`}>
      <select value={language} onChange={handleChange} className={styles.gadgetSelect} aria-label="Language Translate Widget">
        {
          supportedLanguages.map(e => <option key={e.languageCode} value={e.languageCode}>{e.displayName}</option>)
        }
      </select>
      <img className={styles.attribution} src={options.attributionImageUrl} />
      <p>language: {language}</p>
      <p>prop language: {options.pageLanguage}</p>
      <button onClick={handleClick}>Highlight Nodes</button>
      {showBanner ? createPortal(<Banner />, document.body) : ''}
    </div>
  );
}

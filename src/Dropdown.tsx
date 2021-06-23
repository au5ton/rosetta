import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { css } from '@emotion/css'
import useSWR from 'swr'
import { Banner } from './Banner'
import { DropdownOptions, SupportedLanguage } from './models'
import { textNodesUnder } from './util'

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
  const showBanner = language !== options.pageLanguage && language !== ''

  // update <select> once the languages load for the first time
  useEffect(() => {
    if(data !== undefined && supportedLanguages.length === 1) {
      setSupportedLanguages(x => [...x, ...data]);
    }
  }, [data])

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
    })
  }

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

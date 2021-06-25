import React from 'react'
import { css } from '@emotion/css'
import { Global, css as cssr } from '@emotion/react'
import { CancelOutlinedIcon, LoaderRings } from './SvgComponent'
import whiteFadeImg from '../resource/te_bk.gif'
//import ringsImg from '../resource/rings.svg'
import { SupportedLanguage } from './models'

const styles = {
  global: cssr`
    body {
      position: relative;
      min-height: 100%;
      top: 40px;
    }
  `,
  frame: css`
    left: 0px;
    top: 0px;
    height: 39px;
    width: 100%;
    z-index: 10000001;
    position: fixed;
    border: none;
        border-bottom-color: currentcolor;
        border-bottom-style: none;
        border-bottom-width: medium;
    border-bottom: 1px solid #6b90da;
    margin: 0;
    -moz-box-shadow: 0 0 8px 1px #999999;
    -webkit-box-shadow: 0 0 8px 1px #999999;
    box-shadow: 0 0 8px 1px #999999;
  `,
  banner: css`
    margin: 0;
    background-color: #e4effb;
    background-image: url("${whiteFadeImg}");
    overflow: hidden;
    height: 100%;
    // width: 100%;
    display: flex;
    flex-diretion: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    padding: 0 10px;
    > * {
      margin-right: 10px;
      font-family: arial;
      font-size: 10pt;
    }
  `,
  bannerLogo: css`
    height: 1.1rem;
  `,
  bannerSpinner: css`
    color: #757575;
  `,
  bannerExitAnchor: css`
    margin-left: auto;
    margin-right: 0px!important;
    order: 2;
    height: 24px;
    cursor: pointer;
    //color: #212121;
    color: #757575;
    :hover {
      color: #1976d2;
    }
  `,
};

interface BannerProps {
  // The source language of the document
  pageLanguage: string;
  // Image that is viewable at the far left of the banner
  logoImageUrl: string | undefined;
  // Are translations still loading?
  isLoading: boolean;
  // The selected language
  language: string;
  // The supported languages for translation
  supportedLanguages: SupportedLanguage[];
  handleExit: () => void;
  handleLanguageChange: (languageCode: string) => void;
}

export function Banner(props: BannerProps) {
  const isNativeLanguge = props.pageLanguage === props.language;
  const isButtonDisabled = props.language === '' || isNativeLanguge || props.isLoading;

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.handleLanguageChange(e.target.value);
  };

  const handleClick = () => {
    props.handleLanguageChange(props.pageLanguage);
  }

  return (
    <>
      <Global styles={styles.global} />
      <div className={`${styles.frame} skiptranslate`}>
        <div className={styles.banner}>
          { props.logoImageUrl ? <img className={styles.bannerLogo} src={props.logoImageUrl} /> : <></>}
          { 
            props.isLoading ? 
            <>
              <span>Loading...</span>
              <LoaderRings className={styles.bannerSpinner} />
            </> : 
            <>
              <span>Translated to:</span>
              <select value={props.language} onChange={handleSelect} aria-label="Language Translate Widget">
                {
                  props.supportedLanguages.map(e => <option key={e.languageCode} value={e.languageCode}>{e.displayName}</option>)
                }
              </select>
            </>}
          <button onClick={handleClick} disabled={isButtonDisabled}>Show original</button>
          <div className={styles.bannerExitAnchor} onClick={props.handleExit} title="Close"><CancelOutlinedIcon /></div>
        </div>
      </div>
    </>
  );
}

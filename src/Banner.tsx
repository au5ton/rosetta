import React from 'react'
import { css } from '@emotion/css'
import { Global, css as cssr } from '@emotion/react'
import Swal from 'sweetalert2'
import { TooltipHost, TooltipDelay } from '@fluentui/react';
import { CancelOutlinedIcon, HelpOutlinedIcon, InfoOutlinedIcon, LoaderRings, TranslateIcon } from './SvgComponent'
import { AlertText, SupportedLanguage } from './models'

const mobileBreakpoint = '530px';

const styles = {
  global: cssr`
    body {
      position: relative;
      min-height: 100%;
      top: 40px;
    }
    @media (max-width: ${mobileBreakpoint}) {
      body {
        top: 80px;
      }
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
    @media (max-width: ${mobileBreakpoint}) {
      height: 79px;
    }
  `,
  banner: css`
    margin: 0;
    background: linear-gradient(#fff, #E8F2FB);
    overflow: hidden;
    height: 100%;
    // width: 100%;
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    padding: 0 10px;
    > * {
      margin-right: 10px;
      font-family: arial;
      font-size: 10pt;
    }
    @media (max-width: ${mobileBreakpoint}) {
      flex-wrap: wrap;
    }
    button[disabled] {
      cursor: not-allowed;
    }
  `,
  bannerLogo: css`
    height: 1.1rem;
  `,
  bannerLogoIcon: css`
    height: 1.5rem;
    width: 1.5rem;
    //color: #115293;
    color: #1976d2;
  `,
  bannerSpinner: css`
    color: #757575;
  `,
  bannerActionIcons: css`
    margin-left: auto;
    margin-right: 0px!important;
    order: 2;
    height: 24px;
    cursor: pointer;
  `,
  bannerActionTooltip: css`
    //
  `,
  bannerActionButton: css`
    height: 24px;
    //color: #212121;
    color: #757575;
    :hover {
      color: #1976d2;
    }
  `,
  customSweetAlert: css`
    font-family: sans-serif;
  `,
  customSweetAlertText: css`
    font-size: 1em;
  `,
};

interface BannerProps {
  // The source language of the document
  pageLanguage: string;
  // Image that is viewable at the far left of the banner
  logoImageUrl: string | undefined;
  // Text to show when help + info buttons are pressed
  buttons: BannerButton[];
  // Are translations still loading?
  isLoading: boolean;
  // The selected language
  language: string;
  // The supported languages for translation
  supportedLanguages: SupportedLanguage[];
  handleExit: () => void;
  handleLanguageChange: (languageCode: string) => void;
}

export interface BannerButton {
  key: string;
  icon: 'help' | 'info' | string;
  tooltip: string;
  action: AlertText | ((key: string) => void);
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

  const handleActionClicked = (key: string, action: AlertText | ((key: string) => void)) => {
    if(typeof action === 'function') {
      action(key)
    }
    else {
      const { title, message } = action || {};
      Swal.fire({
        titleText: title,
        text: message,
        icon: 'info',
        confirmButtonText: 'Close',
        customClass: {
          container: `skiptranslate ${styles.customSweetAlert}`,
          htmlContainer: `${styles.customSweetAlertText}`
        }
      });
    }
  }

  return (
    <>
      <Global styles={styles.global} />
      <div className={`${styles.frame} skiptranslate`}>
        <div className={styles.banner}>
          { 
            props.logoImageUrl ? 
            <>
              <img className={styles.bannerLogo} src={props.logoImageUrl} />
            </> : 
            <span title="Language translator">
              <TranslateIcon extraClasses={styles.bannerLogoIcon} />
            </span>
          }
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
          <div className={styles.bannerActionIcons}>
            {
              props.buttons.map(e => (
                <TooltipHost
                  key={e.key}
                  content={<span className={`skiptranslate ${styles.bannerActionTooltip}`}>{e.tooltip}</span>}
                  delay={TooltipDelay.zero}
                  styles={{ root: { display: 'inline-block' } }}
                >
                  { e.icon === 'help' ? <HelpOutlinedIcon extraClasses={styles.bannerActionButton} onClick={() => handleActionClicked(e.key, e.action)} /> : e.icon === 'info' ? <InfoOutlinedIcon extraClasses={styles.bannerActionButton} onClick={() => handleActionClicked(e.key, e.action)} /> : <img src={e.icon} alt={e.tooltip} className={styles.bannerActionButton} onClick={() => handleActionClicked(e.key, e.action)} /> }
                </TooltipHost>
              ))
            }
            <TooltipHost
              content={<span className={`skiptranslate ${styles.bannerActionTooltip}`}>Close</span>}
              delay={TooltipDelay.zero}
              styles={{ root: { display: 'inline-block' } }}
            >
              <CancelOutlinedIcon extraClasses={styles.bannerActionButton} onClick={props.handleExit} />
            </TooltipHost>
          </div>
        </div>
      </div>
    </>
  );
}

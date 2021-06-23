import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { css } from '@emotion/css'
import { Banner } from './Banner'

const styles = {
  gadgetSelect: css`
    margin: 4px 0;
  `,
  attribution: css`
  `
};

export function Dropdown() {
  const [count, setCount] = useState(0);
  const [checked, setChecked] = useState(false);

  return (
    <div className="skiptranslate">
      <h1>Hello {count}</h1>
      <button onClick={() => setCount(x => x + 1)}>Click</button>
      <label>
        Toggle banner
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      </label>
      {checked ? createPortal(<Banner count={count} />, document.body) : ''}
    </div>
  );
}

<div class="skiptranslate goog-te-gadget" dir="ltr" style="">
  <div id=":0.targetLanguage">
    <select class="goog-te-combo" aria-label="Language Translate Widget">
      <option value="en">English</option>
      <option value="es">Spanish</option>
    </select>
  </div>

  Powered by
  <span style="white-space:nowrap"
    ><a
      class="goog-logo-link"
      href="https://translate.google.com"
      target="_blank"
      ><img
        src="https://www.gstatic.com/images/branding/googlelogo/1x/googlelogo_color_42x16dp.png"
        style="padding-right: 3px"
        alt="Google Translate"
        width="37px"
        height="14px"
      />Translate</a
    ></span
  >
</div>

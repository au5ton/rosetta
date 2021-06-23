import React from 'react'
import { css } from '@emotion/css'
import { Global, css as cssr } from '@emotion/react'

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
    background-image: url("https://translate.googleapis.com/translate_static/img/te_bk.gif");
    overflow: hidden;
    height: 100%;
    width: 100%;
  `,
};

export function Banner(props: { count: number }) {
  const { count } = props;

  return (
    <>
      <Global styles={styles.global} />
      <div className={`${styles.frame} skiptranslate`}>
        <div className={styles.banner}>
          <h1>Hello World</h1>
          {/* <table style={{ width: '100%', height: '100%', border: 0 }} cellSpacing="0" cellPadding="0">
            <tbody>
              <tr style={{ verticalAlign: 'middle' }}>
                <td width="1" >
                  <a
                    href="https://translate.google.com"
                    target="_blank"
                    ><img
                      src="https://www.gstatic.com/images/branding/googlelogo/1x/googlelogo_color_68x28dp.png"
                      alt="Google Translate"
                  /></a>
                </td>
                <td width="1">
                  <img
                    src="https://www.google.com/images/cleardot.gif"
                    title="The content of this secure page will be sent to Google for translation using a secure connection."
                    alt="The content of this secure page will be sent to Google for translation using a secure connection."
                    className={css`background-image:url(https://translate.googleapis.com/translate_static/img/te_ctrl3.gif);background-position:-56px 0px;margin:0 4px`}
                    width="9"
                    height="15"
                  />
                </td>
                <td></td>
              </tr>
            </tbody>
          </table> */}
        </div>
      </div>
    </>
  );
}

# translate-widget 

![project status](https://badgen.net/badge/project%20status/in%20development/yellow?icon=github)

An alternative to Google Translate's Website Translator widget that can work with any HTTP backend.

## Premise

On December 4, 2019 Google discontinued its popular [Google Translate Widget](https://translate.google.com/manager/website/). The widget can no longer be added to new sites. It is currently still available for websites that already have it installed.

![screenshot](img/google_translate_1.png)

Technically, their widget [stills works if you have the code for it](https://www.w3schools.com/howto/howto_google_translate.asp), but there's no telling when it will stop working. As of June 23, 2021, their embeddable snippet is still working, even though the widget was discontinued in 2019.

## Goal

The goal of this project is to revive the simple "plug and play" usage of the legacy Google Translate Widget, but to make its functionality future-proof and transferable to other translation API providers.

## Features

- Flexible branding with options `attributionImageUrl` and `logoImageUrl`
- Easy to use interface that is very similar to the original Google Translate widget
- Can limit the number of language options available with option `preferredSupportedLanguages`
- Translates elements even if they are added to the DOM after the page loads with [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
- Translations are cached in memory per page per session
  - This will work best if your back-end also caches translations.
- Progress indicators are shown while translations are in progress

  ![rings](resource/rings.svg)

- The last language you selected is saved so the next page you visit after clicking a link automatically translates ([per session per origin](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage))
- Bypass translation using the CSS class `.skiptranslate`

## Limitations

### Back-end not included

The code available in this widget details the UI portion of the widget. **However, a separate API server must be implemented and maintained by those who wish to utilitze this widget.**

Translation APIs aren't free, but a sample API server is available for prototyping. **I make no guarantees that this API server will remain active. Don't rely on this API server in production.**

Sample API server:
- [https://github.com/au5ton/google-translate-sample](https://github.com/au5ton/google-translate-sample)

The schema/model that a separate API server must implement is detailed below.

### Browser support

Only ES6 (ECMAScript 2015) is supported. This is because [esbuild](https://github.com/evanw/esbuild/issues/297) support for ES5 is only partial. To see which browsers this affects, see [caniuse.com/es6](https://caniuse.com/es6). In our TypeScript codebase, we utilize [core-js](https://github.com/zloirock/core-js) and [whatwg-fetch](https://github.com/github/fetch) to polyfill newer JavaScript features to older browsers. The other features we take advantage of, including [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) and [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), are IE11 compatible.

## Usage

### Front-end

```html
  <!-- Whereever you want the widget to appear -->
  <div id="translate_widget_element"></div>

  <!-- ... -->

  <!-- Somewhere in your <body> -->
  <script type="text/javascript">
    function widgetTranslateElementInit() {
      au5ton.translateWidget({
        pageLanguage: 'en',
        chunkSize: 50,
        attributionImageUrl: 'https://cdn.jsdelivr.net/gh/au5ton/translate-widget@0.1.1/dist/powered-by.svg',
        endpoints: {
          supportedLanguages: 'https://google-translate-sample.vercel.app/api/v3/supportedLanguages',
          translate: 'https://google-translate-sample.vercel.app/api/v3/translate'
        }
      }, 'translate_widget_element');
    }
  </script>
  <script src="https://cdn.jsdelivr.net/gh/au5ton/translate-widget@0.1.1/dist/index.js" onload="widgetTranslateElementInit()"></script>
```

### Back-end

Your own back-end server that implements 2 endpoints with the format detailed in [openapi.yaml](openapi.yaml) using the [OpenAPI 3.0 spec](https://swagger.io/specification/).

To preview this OpenAPI 3.0 spec, open [petstore.swagger.io](https://petstore.swagger.io/#/). At the top right, enter the following URL and press "Explore":
- `https://au5ton.github.io/translate-widget/openapi.yaml`

It should look like this:

![swagger ui](img/swagger_ui.png)


## Examples

Here are some example pages:

- Sample 1: [https://au5ton.github.io/translate-widget/dist/sample.html](https://au5ton.github.io/translate-widget/dist/sample.html)
- Sample 2: [https://au5ton.github.io/translate-widget/dist/constitution.html](https://au5ton.github.io/translate-widget/dist/constitution.html)

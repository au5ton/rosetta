# translate-widget 

![project status](https://badgen.net/badge/project%20status/in%20development/yellow?icon=github)

An alternative to Google Translate's Website Translator widget that can work with any HTTP backend.

## Premise

On December 4, 2019 Google discontinued its popular [Google Translate Widget](https://translate.google.com/manager/website/). The widget can no longer be added to new sites. It is currently still available for websites that already have it installed.

![screenshot](img/google_translate_1.png)

Technically, their widget [stills works if you have the code for it](https://www.w3schools.com/howto/howto_google_translate.asp), but there's no telling when it will stop working. As of June 23, 2021, their embeddable snippet is still working, even though the widget was discontinued in 2019.

## Goal

The goal of this project is to revive the simple "plug and play" usage of the legacy Google Translate Widget, but to make its functionality future-proof and transferable to other translation API providers.

## Limitations

The code available in this widget details the UI portion of the widget. **However, a separate API server must be implemented and maintained by those who wish to utilitze this widget.**

Translation APIs aren't free, but a sample API server is available for prototyping. **I make no guarantees that this API server will remain active. Don't rely on this API server in production.**

Sample API server:
- https://github.com/au5ton/google-translate-sample

The schema/model that a separate API server must implement is detailed below.

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
        attributionImageUrl: 'https://cdn.jsdelivr.net/gh/au5ton/translate-widget@0.1.0/dist/powered-by.svg',
        endpoints: {
          supportedLanguages: 'https://google-translate-sample.vercel.app/api/v3/supportedLanguages',
          translate: 'https://google-translate-sample.vercel.app/api/v3/translate'
        }
      }, 'translate_widget_element');
    }
  </script>
  <script src="https://cdn.jsdelivr.net/gh/au5ton/translate-widget@0.1.0/dist/index.js" onload="widgetTranslateElementInit()"></script>
```

### Back-end

Your own back-end server that implements 2 endpoints with the format detailed in [openapi.yaml](openapi.yaml) using the [OpenAPI 3.0 spec](https://swagger.io/specification/).

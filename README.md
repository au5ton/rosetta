# translate-widget 

## Usage

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
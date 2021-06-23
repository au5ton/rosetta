// Import polyfills
import 'core-js/stable';
import 'whatwg-fetch';

// Import user code
import { initHook } from './widget'

// Modify the global namespace
declare global {
  var au5ton: {
    translateWidget: typeof initHook
  };
}
window.au5ton = {
  translateWidget: initHook
};

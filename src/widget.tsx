//import * as Vue from 'vue';
//import { defineComponent } from 'vue';
//import Dropdown from './Dropdown.vue';
import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './App'

// {pageLanguage: 'en'}, 'google_translate_element'

export function initHook(options: { pageLanguage: string }, mountLocation: string) {
  console.log(options);
  ReactDOM.render(
    <App />,
    document.getElementById(mountLocation)
  );
}


// export const Dropdown = defineComponent({
//   template: `
//     <h1>Hello {{count}}</h1>
//   `,
//   data() {
//     return {
//       count: 0
//     }
//   },
//   mounted() {
//     console.log(this.count)
//   }
// })
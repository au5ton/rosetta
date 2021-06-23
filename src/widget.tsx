//import * as Vue from 'vue';
//import { defineComponent } from 'vue';
//import Dropdown from './Dropdown.vue';
import React from 'react'
import ReactDOM from 'react-dom'
import { Dropdown } from './Dropdown'
import { DropdownOptions } from './models';

// {pageLanguage: 'en'}, 'google_translate_element'

export function initHook(options: DropdownOptions, mountLocation: string) {
  console.log(options);
  ReactDOM.render(
    <Dropdown options={options} />,
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
import React from 'react'
import ReactDOM from 'react-dom'
import { Dropdown } from './Dropdown'
import { DropdownOptions } from './models';
import { extract } from './util'

export function initHook(args: any, mountLocation: string) {
  if(typeof args !== 'object' && args !== null) args = {};
  // Re-compose options with type safety checks and default values
  const options: DropdownOptions = {
    pageLanguage: extract(args, 'pageLanguage', 'en'),
    chunkSize: extract(args, 'chunkSize', 10),
    attributionImageUrl: extract(args, 'attributionImageUrl', undefined),
    endpoints: {
      //supportedLanguages: 'http://wlinux.wsl:3000/api/v3/supportedLanguages',
      //translate: 'http://wlinux.wsl:3000/api/v3/translate'
      supportedLanguages: extract(args, ['endpoints', 'supportedLanguages'], ''),
      translate: extract(args, ['endpoints', 'translate'], '')
    }
  };
  // Check if real endpoints were provided
  if(options.endpoints.supportedLanguages === '') throw `Improper supportedLanguages endpoint provided: '${options.endpoints.supportedLanguages}'`;
  if(options.endpoints.translate === '') throw `Improper translate endpoint provided: '${options.endpoints.translate}'`;
  // Render the component
  ReactDOM.render(
    <Dropdown options={options} />,
    document.getElementById(mountLocation)
  );
}

import React from 'react'
import ReactDOM from 'react-dom'
import { Dropdown } from './Dropdown'
import { DropdownOptions } from './models';

export function initHook(options: DropdownOptions, mountLocation: string) {
  console.log(options);
  options.chunkSize = 10;
  ReactDOM.render(
    <Dropdown options={options} />,
    document.getElementById(mountLocation)
  );
}

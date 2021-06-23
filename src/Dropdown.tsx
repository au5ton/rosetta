import React, { useState } from 'react'

export function Dropdown() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Hello {count}</h1>
      <button onClick={() => setCount(x => x + 1)}>Click</button>
    </>
  );
}
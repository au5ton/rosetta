
export const forbiddenTags = ['script', 'style', 'pre', 'kbd'];

export const customFilter: NodeFilter = {
  /**
   * FILTER_ACCEPT 	Value returned by the NodeFilter.acceptNode() method when a node should be accepted.
   * 
   * FILTER_REJECT 	Value to be returned by the NodeFilter.acceptNode() method when a node should be rejected. For TreeWalker, child nodes are also rejected.
   * 
   * FILTER_SKIP 	  Value to be returned by NodeFilter.acceptNode() for nodes to be skipped by the NodeIterator or TreeWalker object.
   *                The children of skipped nodes are still considered. This is treated as "skip this node but not its children".
   * @param node 
   */
  acceptNode(node: Node): number {
    // skip all `.skiptranslate` blocks
    if(anyParentSatisfies(node, e => e.className.includes('skiptranslate'))) {
      return NodeFilter.FILTER_REJECT
    }
    // skip nodes that have children
    if(node.childNodes.length > 0) {
      return NodeFilter.FILTER_SKIP
    }
    // skip nodes that contain only whitespace
    if(node.nodeValue?.trim() === '') {
      return NodeFilter.FILTER_REJECT
    }
    // skip <script>, <pre>, and other forbidden nodes
    if(node.parentNode && forbiddenTags.includes(node.parentNode.nodeName.toLocaleLowerCase())) {
      return NodeFilter.FILTER_REJECT
    }
    // accept others
    return NodeFilter.FILTER_ACCEPT
  }
}

/**
 * Returns true if any parent satisfies the condition, otherwise false
 */
export function anyParentSatisfies(node: Node, filter: (node: HTMLElement) => boolean) {
  if(node.parentElement !== null && node.parentElement !== undefined) {
    var n = node.parentElement;
    while(n.parentElement !== null && n.parentElement !== undefined) {
      if(filter(n)) {
        return true;
      }
      n = n.parentElement;
    }
  }
  return false;
}

/**
 * From: https://stackoverflow.com/a/10730777
 */
export function textNodesUnder(el: Node){
  var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT, customFilter);
  while(n=walk.nextNode()) a.push(n);
  return a;
}

/**
 * From: https://dev.to/jorik/country-code-to-flag-emoji-a21
 */
export function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * From: https://stackoverflow.com/a/37826698
 */
export function chunkedArray<T>(inputArray: T[], perChunk: number): T[][] {
  // var perChunk = 2 // items per chunk    
  // var inputArray = ['a','b','c','d','e']

  var result = inputArray.reduce<T[][]>((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/perChunk)

    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])

  return result;
}


/**
 * Extract the value from an object by a key (or nested keys), and return a default value if that value is missing
 */
export function extract(obj: {[key: string]: any}, key: string | string[], defaultValue: any): any {
  if(Array.isArray(key)) {
    if(key.length === 0) {
      throw `This shouldn't happen`;
    }
    if(key.length === 1) {
      // Extract this only key left
      return extract(obj, key[0], defaultValue);
    }
    else if(key.length > 1) {
      // If current key doesn't exist, return defaultValue
      if(obj[key[0]] === undefined) {
        return defaultValue;
      }
      else {
        // Otherwise, recurse to next key
        return extract(obj[key[0]], key.slice(1), defaultValue)
      }
    }
  }
  else {
    // If value is nullish, return defaultValue instead
    return (obj[key] === undefined || obj[key] === null) ? defaultValue : obj[key];
  }
}

export function existsInside<T>(array: T[], predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any) {
  return array.findIndex(predicate) >= 0;
}

export async function translate(endpoint: string, text: string[], from: string, to: string): Promise<string[]> {
  const res = await fetch(`${endpoint}?from=${from}&to=${to}`, {
    method: 'POST',
    body: JSON.stringify(text),
    headers: {
      'Content-Type': 'application/json'
    },
  });
  const data = await res.json();
  // check types
  if(Array.isArray(data) && data.every(e => typeof e === 'string')) {
    return data
  }
  else {
    throw `Data returned from endpoint was not of type string[] (Endpoint: ${endpoint}), data: ${JSON.stringify(data)}`
  }
}
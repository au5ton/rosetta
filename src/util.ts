
const forbiddenTags = ['script', 'style', 'pre', 'kbd'];

const customFilter: NodeFilter = {
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
export function textNodesUnder(el: HTMLElement){
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
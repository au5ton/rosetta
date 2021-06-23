
const forbiddenTags = ['script', 'pre', 'kbd'];

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
    if(node.parentElement?.className.includes('skiptranslate'))  {
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
 * From: https://stackoverflow.com/a/10730777
 */
export function textNodesUnder(el: HTMLElement){
  var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT, customFilter);
  while(n=walk.nextNode()) a.push(n);
  return a;
}

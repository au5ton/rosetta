
import { DropdownOptions } from './options'

export const forbiddenTags = ['script', 'style', 'pre', 'kbd'];
export const regexOnlyWhitespace = /^[\s]*$/;
export const regexOnlyDigitsWhiteSpacePunctuation = /^[\d\s!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]*$/;

export class CustomTreeWalker {
  options: DropdownOptions;
  customFilter: NodeFilter;
  constructor(options: DropdownOptions) {
    this.options = options;
    this.customFilter = {
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
        // skip parents with `.skiptranslate`
        if(anyParentSatisfies(node, e => typeof e.className === 'string' && e.className.includes('skiptranslate'))) {
          return NodeFilter.FILTER_REJECT
        }
        // skip parents with data-rosetta-skiptranslate="true"
        if(anyParentSatisfies(node, e => e.getAttribute('data-rosetta-skiptranslate') === "true")) {
          return NodeFilter.FILTER_REJECT
        }
        // skip parents that include one of the configurable classNames
        for(let className of options.ignoreClasses) {
          if(anyParentSatisfies(node, e => typeof e.className === 'string' && e.className.includes(className))) {
            return NodeFilter.FILTER_REJECT
          }
        }
        // skip parents that include one of the configurable selectors
        for(let selector of options.ignoreSelectors) {
          if(anyParentSatisfies(node, e => e instanceof Element && e.matches(selector))) {
            return NodeFilter.FILTER_REJECT
          }
        }
        // skip nodes that have children
        if(node.childNodes.length > 0) {
          return NodeFilter.FILTER_SKIP
        }
        // skip nodes that contain only whitespace
        if(regexOnlyWhitespace.test(node.nodeValue ?? '')) {
          return NodeFilter.FILTER_REJECT
        }
        // skip nodes that only contain numbers, whitespace, or punctuation
        if(regexOnlyDigitsWhiteSpacePunctuation.test(node.nodeValue ?? '')) {
          return NodeFilter.FILTER_REJECT
        }
        // skip <script>, <pre>, and other forbidden nodes
        if(node.parentNode && forbiddenTags.includes(node.parentNode.nodeName.toLocaleLowerCase())) {
          return NodeFilter.FILTER_REJECT
        }
        // accept others
        return NodeFilter.FILTER_ACCEPT
      }
    };
  }

  /**
   * From: https://stackoverflow.com/a/10730777
   */
  textNodesUnder(el: Node) {
    var n, a=[], walk=document.createTreeWalker(el, NodeFilter.SHOW_TEXT, this.customFilter);
    while(n=walk.nextNode()) a.push(n);
    return a;
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


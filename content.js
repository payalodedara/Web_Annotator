document.addEventListener('DOMContentLoaded', () => {
    loadAnnotations();
  });
  
  document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.toString().length > 0) {
        chrome.storage.sync.get(['highlightColor'], (result) => {
          const color = result.highlightColor || '#ffff00';
          const annotation = {
            startXpath: getXPath(range.startContainer),
            endXpath: getXPath(range.endContainer),
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            color: color,
            note: ''
          };
          saveAnnotation(annotation);
          applyAnnotation(annotation);
        });
      }
    }
  });
  
  function saveAnnotation(annotation) {
    chrome.storage.sync.get(['annotations'], (result) => {
      let annotations = result.annotations || [];
      annotations.push(annotation);
      chrome.storage.sync.set({ annotations });
    });
  }
  
  function loadAnnotations() {
    chrome.storage.sync.get(['annotations'], (result) => {
      let annotations = result.annotations || [];
      annotations.forEach((annotation) => {
        applyAnnotation(annotation);
      });
    });
  }
  
  function applyAnnotation(annotation) {
    const range = document.createRange();
    const startNode = getNodeByXPath(annotation.startXpath);
    const endNode = getNodeByXPath(annotation.endXpath);
    if (startNode && endNode) {
      range.setStart(startNode, annotation.startOffset);
      range.setEnd(endNode, annotation.endOffset);
      const span = document.createElement('span');
      span.style.backgroundColor = annotation.color;
      if (annotation.note) {
        span.title = annotation.note;
      }
      range.surroundContents(span);
    }
  }
  
  function getXPath(node) {
    let comp, comps = [];
    let parent = null;
    let xpath = '';
    let getPos = function (node) {
      let position = 1, curNode;
      if (node.nodeType == Node.ATTRIBUTE_NODE) {
        return null;
      }
      for (curNode = node.previousSibling; curNode; curNode = curNode.previousSibling) {
        if (curNode.nodeName == node.nodeName) {
          ++position;
        }
      }
      return position;
    }
  
    if (node instanceof Document) {
      return '/';
    }
  
    for (; node && !(node instanceof Document); node = node.nodeType == Node.ATTRIBUTE_NODE ? node.ownerElement : node.parentNode) {
      comp = comps[comps.length] = {};
      switch (node.nodeType) {
        case Node.TEXT_NODE:
          comp.name = 'text()';
          break;
        case Node.ATTRIBUTE_NODE:
          comp.name = '@' + node.nodeName;
          break;
        case Node.ELEMENT_NODE:
          comp.name = node.nodeName;
          break;
      }
      comp.position = getPos(node);
    }
  
    for (let i = comps.length - 1; i >= 0; i--) {
      comp = comps[i];
      xpath += '/' + comp.name.toLowerCase();
      if (comp.position !== null) {
        xpath += '[' + comp.position + ']';
      }
    }
  
    return xpath;
  }
  
  function getNodeByXPath(path) {
    let evaluator = new XPathEvaluator();
    let result = evaluator.evaluate(path, document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
  }
  
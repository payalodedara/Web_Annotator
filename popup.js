document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('highlight').addEventListener('click', highlightSelection);
  document.getElementById('add-note').addEventListener('click', addNoteToSelection);
  document.getElementById('export').addEventListener('click', exportAnnotations);
});

function highlightSelection() {
  chrome.storage.sync.set({ highlightColor: document.getElementById('highlight-color').value });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (range.toString().length > 0) {
            chrome.storage.sync.get(['highlightColor'], (result) => {
              const span = document.createElement('span');
              span.style.backgroundColor = result.highlightColor || '#ffff00';
              range.surroundContents(span);
              const annotation = {
                startXpath: getXPath(range.startContainer),
                endXpath: getXPath(range.endContainer),
                startOffset: range.startOffset,
                endOffset: range.endOffset,
                color: span.style.backgroundColor,
                note: ''
              };
              saveAnnotation(annotation);
            });
          }
        }
      }
    });
  });
}

function addNoteToSelection() {
  chrome.storage.sync.set({ highlightColor: document.getElementById('highlight-color').value });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const note = prompt("Enter your note:");
          if (note) {
            chrome.storage.sync.get(['highlightColor'], (result) => {
              const span = document.createElement('span');
              span.style.backgroundColor = result.highlightColor || '#ffff00';
              span.title = note;
              range.surroundContents(span);
              const annotation = {
                startXpath: getXPath(range.startContainer),
                endXpath: getXPath(range.endContainer),
                startOffset: range.startOffset,
                endOffset: range.endOffset,
                color: span.style.backgroundColor,
                note: note
              };
              saveAnnotation(annotation);
            });
          }
        }
      }
    });
  });
}

function exportAnnotations() {
  chrome.runtime.sendMessage({ action: 'exportAnnotations' }, (response) => {
    const annotations = response.annotations;
      const blob = new Blob([JSON.stringify(annotations, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'annotations.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
  

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ highlightColor: '#ffff00' });
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'exportAnnotations') {
      chrome.storage.sync.get(['annotations'], (result) => {
        sendResponse({ annotations: result.annotations });
      });
      return true;
    }
  });
  
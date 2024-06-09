document.addEventListener('DOMContentLoaded', () => {
    loadOptions();
    document.getElementById('save-options').addEventListener('click', saveOptions);
  });
  
  function loadOptions() {
    chrome.storage.sync.get(['highlightColor'], (result) => {
      document.getElementById('highlight-color').value = result.highlightColor || '#ffff00';
    });
  }
  
  function saveOptions() {
    const highlightColor = document.getElementById('highlight-color').value;
    chrome.storage.sync.set({ highlightColor }, () => {
      alert('Options saved!');
    });
  }
  
// Background script for the ReverseATS extension

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle message to open popup
  if (message.action === 'openPopup') {
    chrome.action.openPopup();
  }
  
  // Always return true for async message handling
  return true;
});

// Check for first install or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Show a welcome page or open the popup for first-time users
    chrome.tabs.create({ url: 'popup.html' });
  }
});

// Listen for extension activation
chrome.action.onClicked.addListener(() => {
  // Check if resume exists in storage
  chrome.storage.local.get(['resumeText'], (result) => {
    if (!result.resumeText) {
      // If no resume, open the popup
      chrome.action.openPopup();
    }
  });
});

// We've removed the automatic popup on tab update to avoid interrupting users
// The content script will now handle all popup triggering based on
// both URL matching and table presence verification 
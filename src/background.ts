// Background script for the ReverseATS extension

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('background.ts onMessage');
  // Handle message to open popup
  if (message.action === 'openPopup') {
    chrome.action.openPopup();
  }
  
  // Always return true for async message handling
  return true;
});

////
//chrome.action.openPopup(); for if you want a popup not a new tab
////
// Check for first install or update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('background.ts onInstalled');
  if (details.reason === 'install') {
    // Show a welcome page or open the popup for first-time users
    chrome.tabs.create({ url: 'popup.html' });
  }
});

// Listen for extension activation
chrome.action.onClicked.addListener(() => {
  console.log('background.ts onClicked');
  // Check if resume exists in storage
  chrome.storage.local.get(['resumeText'], (result) => {
    if (!result.resumeText) {
      // If no resume, open the popup
      chrome.tabs.create({ url: 'popup.html' });
    }
  });
});

// We've removed the automatic popup on tab update to avoid interrupting users
// The content script will now handle all popup triggering based on
// both URL matching and table presence verification 
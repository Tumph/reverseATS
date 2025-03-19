// Main content script for the WaterlooWorks TR Counter extension

import { addTrCounterAndButton } from './modules/table-processor';
import { createObserver, getObserverConfig } from './modules/observer';
import { injectMatchPercentagesIntoTable } from './modules/table-injector';

// Check if resume exists in storage
chrome.storage.local.get(['resumeText', 'jobOverviews', 'jobMatches'], (result) => {
  if (!result.resumeText) {
    // If no resume, send message to open popup
    chrome.runtime.sendMessage({ action: 'openPopup' });
  }
  
  // If we have job overviews and matches, inject match percentages into table
  if (result.jobOverviews && result.jobMatches) {
    // Wait for table to be ready before injecting
    setTimeout(() => {
      injectMatchPercentagesIntoTable(result.jobOverviews);
    }, 1500);
  }
});

// Run the function when the page is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      addTrCounterAndButton();
    }, 1000); // Delay to ensure page is fully loaded
  });
} else {
  setTimeout(() => {
    addTrCounterAndButton();
  }, 1000); // Delay to ensure page is fully loaded
}

// Create the observer
const observer = createObserver();

// Start observing the document with the configured parameters
// Delay the observer start to avoid initial page load conflicts
setTimeout(() => {
  observer.observe(document.body, getObserverConfig());
}, 2000); // 2 second delay 
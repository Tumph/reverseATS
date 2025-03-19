// Main content script for the WaterlooWorks Job Matcher extension

import { automaticallyRunScraper } from './modules/table-processor';
import { injectMatchPercentagesIntoTable } from './modules/table-injector';
import { setupPaginationObserver } from './modules/observer';

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

// Function to check URL and table conditions
function checkConditionsAndSetupPaginationObserver() {
  // Check if URL matches
  const isCorrectURL = window.location.href.includes('https://waterlooworks.uwaterloo.ca/myAccount/co-op/direct/jobs.htm');

  // Check if table with specific attribute exists
  const targetTable = document.querySelector('table[data-v-17eef081]');
  
  // If both conditions are met, set up the pagination observer
  if (isCorrectURL && targetTable) {
    setupPaginationObserver();
    
    // Run scraper for initial load
    if (initialSetup) {
      automaticallyRunScraper();
      initialSetup = false;
    }
  }
}

let initialSetup = true;

// Run the function when the page is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      checkConditionsAndSetupPaginationObserver();
    }, 1000); // Delay to ensure page is fully loaded
  });
} else {
  setTimeout(() => {
    checkConditionsAndSetupPaginationObserver();
  }, 1000); // Delay to ensure page is fully loaded
}

// Create a mutation observer to watch for the target table being added to the DOM
const tableMutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
  // Check if our target table has been added to the DOM
  const hasTargetTable = mutations.some(mutation => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      return Array.from(mutation.addedNodes).some(node => {
        if (node instanceof Element) {
          return node.tagName === 'TABLE' && node.hasAttribute('data-v-17eef081') ||
                 node.querySelector && node.querySelector('table[data-v-17eef081]') !== null;
        }
        return false;
      });
    }
    return false;
  });
  
  if (hasTargetTable) {
    checkConditionsAndSetupPaginationObserver();
  }
});

// Start observing the document with the configured parameters for table changes
setTimeout(() => {
  tableMutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}, 2000); 
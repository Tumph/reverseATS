// Main content script for the WaterlooWorks Job Matcher extension
import { injectMatchPercentagesIntoTable } from './modules/table-injector';
import { setupPaginationObserver } from './modules/observer';
import { automaticallyRunScraper } from './modules/table-processor';

// Track whether we've triggered the initial scrape
let initialScrapeTriggered = false;
// Track if scraping is currently in progress
let isScrapingInProgress = false;

// Register a message listener to track scraping state
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'scrapingStarted') {
    isScrapingInProgress = true;
  } else if (message.action === 'scrapingFinished') {
    isScrapingInProgress = false;
  }
});

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
    }, 1000);
  }
});

/**
 * Check if a scraping process is currently active
 * @returns true if scraping is in progress
 */
function isScrapingActive(): boolean {
  // Check the global flag
  if (isScrapingInProgress) {
    return true;
  }
  
  // Also check for loading indicator in the DOM
  const loadingIndicator = document.querySelector('.loading-indicator');
  if (loadingIndicator && getComputedStyle(loadingIndicator).display !== 'none') {
    return true;
  }
  
  return false;
}

// Function to check for pagination element and trigger initial scrape
function checkForPaginationAndTriggerScrape() {
  // Don't trigger if already triggered or if scraping is active
  if (initialScrapeTriggered || isScrapingActive()) {
    return;
  }
  
  const paginationElement = document.querySelector('div.table--view__pagination--data[data-v-17eef081]');
  
  if (paginationElement) {
    initialScrapeTriggered = true; // Mark as triggered
    
    // Wait 2 seconds before triggering the scrape
    setTimeout(() => {
      // Double-check before actually triggering
      if (!isScrapingActive()) {
        // Set flag before calling the function
        isScrapingInProgress = true;
        // Create a wrapper function that will set the flag to false when done
        const runScraperWithTracking = async () => {
          try {
            await automaticallyRunScraper();
          } finally {
            isScrapingInProgress = false;
            chrome.runtime.sendMessage({ action: 'scrapingFinished' });
          }
        };
        runScraperWithTracking();
      } else {
        
        initialScrapeTriggered = false; // Reset so we can try again later
      }
    }, 1000);
  }
}

// Function to check URL and table conditions
function checkConditionsAndSetupPaginationObserver() {
  // Check if URL matches any of the supported pages
  const isCorrectURL = window.location.href.includes('https://waterlooworks.uwaterloo.ca/myAccount/co-op/direct/jobs.htm') ||
                     window.location.href.includes('https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm') ||
                     window.location.href.includes('https://waterlooworks.uwaterloo.ca/myAccount/graduating/jobs.htm') ||
                     window.location.href.includes('https://waterlooworks.uwaterloo.ca/myAccount/contract/jobs.htm');

  // Check if table with specific attribute exists
  const targetTable = document.querySelector('table[data-v-17eef081]');
  
  // If both conditions are met, set up the pagination observer and check for pagination element
  if (isCorrectURL && targetTable) {
    setupPaginationObserver();
    checkForPaginationAndTriggerScrape(); // Check if we should trigger the initial scrape
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
  }, 500); // Delay to ensure page is fully loaded
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
}, 1000); 
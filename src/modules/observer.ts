// Observer module for handling DOM mutations

import { ObserverConfig } from './types';
import { automaticallyRunScraper } from './table-processor';

/**
 * Check if a scraping process is currently active by looking for loading indicator
 * @returns true if scraping is in progress
 */
function isScrapingInProgress(): boolean {
  // Check for loading indicator in the DOM
  const loadingIndicator = document.querySelector('.loading-indicator');
  if (loadingIndicator && getComputedStyle(loadingIndicator).display !== 'none') {
    return true;
  }
  
  return false;
}

/**
 * Creates a pagination observer to detect changes in the results count or range
 * This will trigger the scraper to run when the pagination info changes
 * @returns The created MutationObserver
 */
export function createPaginationObserver(): MutationObserver {
  console.log('observer.ts createPaginationObserver');
  // Track current pagination state
  let currentResultsCount = '';
  let currentResultsRange = '';
  
  // Create the observer
  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    // Look for pagination div changes
    const paginationDiv = document.querySelector('div.table--view__pagination--data[data-v-17eef081]');
    if (!paginationDiv) {
      console.error('observer.ts createPaginationObserver - pagination div not found');
      return;
    }
    
    // Extract the current count and range
    const resultsCountElement = paginationDiv.querySelector('div.margin--r--s');
    const resultsRangeElement = paginationDiv.querySelector('div:not(.margin--r--s)');
    
    const newResultsCount = resultsCountElement ? resultsCountElement.textContent || '' : '';
    const newResultsRange = resultsRangeElement ? resultsRangeElement.textContent || '' : '';
    
    // Detect if pagination has changed
    const paginationChanged = (newResultsCount !== currentResultsCount || newResultsRange !== currentResultsRange) &&
                               (newResultsCount !== '' && newResultsRange !== '');
    
    if (paginationChanged) {
      console.log('Pagination changed:', { 
        oldCount: currentResultsCount, 
        newCount: newResultsCount,
        oldRange: currentResultsRange,
        newRange: newResultsRange
      });
      
      // Update tracked state
      currentResultsCount = newResultsCount;
      currentResultsRange = newResultsRange;
      
      // Check if scraping is already in progress before triggering a new scrape
      if (!isScrapingInProgress()) {
        // Run the scraper when pagination changes to get new job IDs
        setTimeout(() => {
          // Check again before actually triggering
          if (!isScrapingInProgress()) {
            console.log('Triggering scraper due to pagination change');
            automaticallyRunScraper();
          } else {
            console.log('Skipping scraper trigger - scraping already in progress');
          }
        }, 1000); // Small delay to ensure the table has updated
      } else {
        console.log('Skipping scraper trigger - scraping already in progress');
      }
    }
  });
  
  return observer;
}

/**
 * Sets up pagination observer to watch for changes in result count or range
 */
export function setupPaginationObserver(): void {
  console.log('observer.ts setupPaginationObserver');
  // Create the pagination observer
  const paginationObserver = createPaginationObserver();
  
  // Find the pagination div to observe
  const paginationDiv = document.querySelector('div.table--view__pagination--data[data-v-17eef081]');
  
  if (paginationDiv) {
    console.log('Setting up pagination observer');
    paginationObserver.observe(paginationDiv, {
      childList: true,
      subtree: true,
      characterData: true
    });
  } else {
    console.log('Pagination div not found, will try again later');
    // Try again later if the pagination div is not found
    setTimeout(setupPaginationObserver, 1000);
  }
}

/**
 * Creates a debounced version of the update function to prevent too many updates
 */
export function createDebouncedUpdate(observer: MutationObserver): () => void {
  console.log('observer.ts createDebouncedUpdate');
  let updateTimeout: number | null = null;
  
  return function debouncedUpdate(): void {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    
    updateTimeout = window.setTimeout(() => {
      // Temporarily disconnect the observer to prevent infinite loops
      observer.disconnect();
      
      
      // Reconnect the observer
      observer.observe(document.body, getObserverConfig());
    }, 500); // 500ms debounce time
  };
}

/**
 * Gets the configuration for the MutationObserver
 * @ returns The observer configuration
 */
export function getObserverConfig(): ObserverConfig {
  console.log('observer.ts getObserverConfig');
  return {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  };
}

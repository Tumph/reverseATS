// Observer module for handling DOM mutations

import { ObserverConfig } from './types';
import { automaticallyRunScraper } from './table-processor';

/**
 * Creates a pagination observer to detect changes in the results count or range
 * This will trigger the scraper to run when the pagination info changes
 * @returns The created MutationObserver
 */
export function createPaginationObserver(): MutationObserver {
  // Track current pagination state
  let currentResultsCount = '';
  let currentResultsRange = '';
  
  // Create the observer
  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    // Look for pagination div changes
    const paginationDiv = document.querySelector('div.table--view__pagination--data[data-v-17eef081]');
    if (!paginationDiv) return;
    
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
      
      // Run the scraper when pagination changes to get new job IDs
      setTimeout(() => {
        console.log('Triggering scraper due to pagination change');
        automaticallyRunScraper();
      }, 1000); // Small delay to ensure the table has updated
    }
  });
  
  return observer;
}

/**
 * Sets up pagination observer to watch for changes in result count or range
 */
export function setupPaginationObserver(): void {
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
  return {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  };
}

/**
 * Checks if a mutation is relevant for updating
 * @ param mutation The mutation record to check
 * @ returns Whether the mutation is relevant
 */

export function isMutationRelevant(mutation: MutationRecord): boolean {
  // Check if the mutation target is a tr or contains tr elements
  if ((mutation.target as Element).tagName === 'TR' || 
      (mutation.target as Element).getElementsByTagName && (mutation.target as Element).getElementsByTagName('tr').length > 0) {
    return true;
  }
  
  // Check if the mutation target has the new UI classes
  if ((mutation.target as Element).classList && 
      ((mutation.target as Element).classList.contains('table__row--header') || 
       (mutation.target as Element).classList.contains('table__row--body'))) {
    return true;
  }
  
  // Check added nodes
  if (mutation.addedNodes.length) {
    for (const node of Array.from(mutation.addedNodes)) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        // Check for TR elements
        if (element.tagName === 'TR' || 
            (element.getElementsByTagName && element.getElementsByTagName('tr').length > 0)) {
          return true;
        }
        
        // Check for new UI classes
        if (element.classList && 
            (element.classList.contains('table__row--header') || 
             element.classList.contains('table__row--body'))) {
          return true;
        }
        
        // Check for table elements that might contain the new UI rows
        if (element.tagName === 'TABLE' && 
            (element.querySelector('.table__row--header') || 
             element.querySelector('.table__row--body'))) {
          return true;
        }
      }
    }
  }
  
  // Check removed nodes
  if (mutation.removedNodes.length) {
    for (const node of Array.from(mutation.removedNodes)) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        // Check for TR elements
        if (element.tagName === 'TR' || 
            (element.getElementsByTagName && element.getElementsByTagName('tr').length > 0)) {
          return true;
        }
        
        // Check for new UI classes
        if (element.classList && 
            (element.classList.contains('table__row--header') || 
             element.classList.contains('table__row--body'))) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Creates and initializes a MutationObserver
 * @ returns The created MutationObserver
 */
export function createObserver(): MutationObserver {
  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    // Check if any of the mutations involve tr elements or are relevant
    const shouldUpdate: boolean = mutations.some(isMutationRelevant);
    
    if (shouldUpdate) {
      debouncedUpdate();
    }
  });
  
  // Create the debounced update function
  const debouncedUpdate = createDebouncedUpdate(observer);
  
  return observer;
} 
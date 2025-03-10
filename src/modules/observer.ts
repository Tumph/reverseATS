// Observer module for handling DOM mutations

import { ObserverConfig } from './types';
import { addTrCounterAndButton } from './table-processor';

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
      
      // Reapply TR counters to any new tables
      addTrCounterAndButton();
      
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
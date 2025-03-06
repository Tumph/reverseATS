// Function to count and display the number of <tr> elements
function countAndDisplayTrElements(): void {
  // Get all tr elements on the page
  const trElements: HTMLCollectionOf<HTMLTableRowElement> = document.getElementsByTagName('tr');
  const trCount: number = trElements.length;
  
  // Create a div to display the count
  const countDisplay: HTMLDivElement = document.createElement('div');
  countDisplay.id = 'tr-counter';
  countDisplay.style.position = 'fixed';
  countDisplay.style.top = '10px';
  countDisplay.style.right = '10px';
  countDisplay.style.backgroundColor = '#4285f4';
  countDisplay.style.color = 'white';
  countDisplay.style.padding = '10px';
  countDisplay.style.borderRadius = '5px';
  countDisplay.style.zIndex = '9999';
  countDisplay.style.fontWeight = 'bold';
  countDisplay.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  countDisplay.textContent = `Table Rows: ${trCount}`;
  
  // Add the div to the page
  document.body.appendChild(countDisplay);
  
  console.log(`WaterlooWorks TR Counter: Found ${trCount} <tr> elements`);
}

// Run the function when the page is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(countAndDisplayTrElements, 1000); // Delay to ensure page is fully loaded
  });
} else {
  setTimeout(countAndDisplayTrElements, 1000); // Delay to ensure page is fully loaded
}

// Create a debounced version of the update function to prevent too many updates
let updateTimeout: number | null = null;
function debouncedUpdate(): void {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  updateTimeout = window.setTimeout(() => {
    // Temporarily disconnect the observer to prevent infinite loops
    observer.disconnect();
    
    // Remove existing counter if it exists
    const existingCounter: HTMLElement | null = document.getElementById('tr-counter');
    if (existingCounter) {
      existingCounter.remove();
    }
    
    // Recount and display
    countAndDisplayTrElements();
    
    // Reconnect the observer
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });
  }, 500); // 500ms debounce time
}

// Create the observer
const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
  // Check if any of the mutations involve tr elements or are relevant
  const shouldUpdate: boolean = mutations.some(mutation => {
    // Check if the mutation target is a tr or contains tr elements
    if ((mutation.target as Element).tagName === 'TR' || 
        (mutation.target as Element).getElementsByTagName && (mutation.target as Element).getElementsByTagName('tr').length > 0) {
      return true;
    }
    
    // Check added nodes
    if (mutation.addedNodes.length) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if ((node as Element).tagName === 'TR' || 
              ((node as Element).getElementsByTagName && (node as Element).getElementsByTagName('tr').length > 0)) {
            return true;
          }
        }
      }
    }
    
    // Check removed nodes
    if (mutation.removedNodes.length) {
      for (const node of Array.from(mutation.removedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if ((node as Element).tagName === 'TR' || 
              ((node as Element).getElementsByTagName && (node as Element).getElementsByTagName('tr').length > 0)) {
            return true;
          }
        }
      }
    }
    
    return false;
  });
  
  if (shouldUpdate) {
    debouncedUpdate();
  }
});

// Start observing the document with the configured parameters
// Delay the observer start to avoid initial page load conflicts
setTimeout(() => {
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: false,
    characterData: false
  });
}, 2000); // 2 second delay 
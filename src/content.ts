// Function to add TR counter and scrape button above WaterlooWorks tables
function addTrCounterAndButton(): void {
  // Find all tables on the page
  const tables = document.getElementsByTagName('table');
  
  // Process each table
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    
    // Skip if we've already added a counter to this table
    if (table.getAttribute('data-tr-counter-added') === 'true') {
      continue;
    }
    
    // Create container for the counter and button
    const container = document.createElement('div');
    container.className = 'tr-counter-container';
    container.style.margin = '10px 0';
    container.style.padding = '10px';
    container.style.backgroundColor = '#f5f5f5';
    container.style.borderRadius = '5px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '10px';
    
    // Create TR count display
    const trCountDisplay = document.createElement('div');
    trCountDisplay.className = 'tr-count-display';
    trCountDisplay.textContent = 'TR Count: ';
    trCountDisplay.style.fontWeight = 'bold';
    
    // Create scrape button
    const scrapeButton = document.createElement('button');
    scrapeButton.textContent = 'Scrape';
    scrapeButton.style.padding = '5px 10px';
    scrapeButton.style.backgroundColor = '#4285f4';
    scrapeButton.style.color = 'white';
    scrapeButton.style.border = 'none';
    scrapeButton.style.borderRadius = '3px';
    scrapeButton.style.cursor = 'pointer';
    
    // Add click event to the button
    scrapeButton.addEventListener('click', () => {
      const trElements = table.getElementsByTagName('tr');
      trCountDisplay.textContent = `TR Count: ${trElements.length}`;
    });
    
    // Add elements to container
    container.appendChild(trCountDisplay);
    container.appendChild(scrapeButton);
    
    // Insert container before the table
    table.parentNode?.insertBefore(container, table);
    
    // Mark this table as processed
    table.setAttribute('data-tr-counter-added', 'true');
  }
}

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

// Create a debounced version of the update function to prevent too many updates
let updateTimeout: number | null = null;
function debouncedUpdate(): void {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  updateTimeout = window.setTimeout(() => {
    // Temporarily disconnect the observer to prevent infinite loops
    observer.disconnect();
    
    // Reapply TR counters to any new tables
    addTrCounterAndButton();
    
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
// Table processor module

import { 
  createStyledContainer, 
  createTrCountDisplay, 
  createJobIdsDisplay, 
  createScrapeButton,
  processTable
} from './dom-utils';

/**
 * Adds TR counter and scrape button above WaterlooWorks tables
 */
export function addTrCounterAndButton(): void {
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
    const container = createStyledContainer();
    
    // Create TR count display
    const trCountDisplay = createTrCountDisplay();
    
    // Create job IDs display
    const jobIdsDisplay = createJobIdsDisplay();
    
    // Create scrape button
    const scrapeButton = createScrapeButton();
    
    // Add click event to the button
    scrapeButton.addEventListener('click', () => {
      const { trCount, jobIds } = processTable(table);
      
      // Update the TR count display
      trCountDisplay.textContent = `TR Count: ${trCount}`;
      
      // Display the JobIds as a comma-separated list
      if (jobIds.length > 0) {
        jobIdsDisplay.textContent = `Job IDs: ${jobIds.join(', ')}`;
      } else {
        jobIdsDisplay.textContent = 'No Job IDs found';
      }
    });
    
    // Add elements to container
    container.appendChild(trCountDisplay);
    container.appendChild(scrapeButton);
    container.appendChild(jobIdsDisplay);
    
    // Insert container before the table
    table.parentNode?.insertBefore(container, table);
    
    // Mark this table as processed
    table.setAttribute('data-tr-counter-added', 'true');
  }
} 
// Table processor module

import { 
  createStyledContainer, 
  createTrCountDisplay, 
  createJobIdsDisplay, 
  createScrapeButton,
  createScrapeJobDetailsButton,
  createJobDetailsDisplay,
  createLoadingIndicator,
  createDescriptionButton,
  processTable,
  renderJobDetails
} from './dom-utils';

import { scrapeAllJobDetails } from './scraper';
import { JobDetails } from './types';

/**
 * Adds TR counter and scrape button above WaterlooWorks tables
 */
export function addTrCounterAndButton(): void {
  // Find all tables on the page that match the new WaterlooWorks UI
  const tables = document.querySelectorAll('table');
  
  // Process each table
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i] as HTMLTableElement;
    
    // Skip if we've already added a counter to this table
    if (table.getAttribute('data-tr-counter-added') === 'true') {
      continue;
    }
    
    // Check if this is a job listing table in the new UI
    // Look for table__row--header and table__row--body classes
    const hasHeaderRow = table.querySelector('.table__row--header') !== null;
    const hasBodyRows = table.querySelector('.table__row--body') !== null;
    
    // Skip if this is not a job listing table
    if (!hasHeaderRow && !hasBodyRows) {
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
    
    // Create scrape job details button
    const scrapeJobDetailsButton = createScrapeJobDetailsButton();
    
    // Create description button
    const descriptionButton = createDescriptionButton();
    
    // Create job details display
    const jobDetailsDisplay = createJobDetailsDisplay();
    
    // Create loading indicator
    const loadingIndicator = createLoadingIndicator();
    
    // Add click event to the scrape button
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
    
    // Add click event to the scrape job details button
    scrapeJobDetailsButton.addEventListener('click', async () => {
      try {
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        jobDetailsDisplay.style.display = 'none';
        
        // Scrape all job details
        const jobDetails: JobDetails[] = await scrapeAllJobDetails();
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        
        // Render job details
        renderJobDetails(jobDetailsDisplay, jobDetails);
        
        // Save job details to chrome.storage.local
        chrome.storage.local.set({ jobDetails: jobDetails }, () => {
          console.log('Job details saved to chrome.storage.local');
        });
      } catch (error: unknown) {
        console.error('Error scraping job details:', error);
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        
        // Show error message
        jobDetailsDisplay.style.display = 'block';
        jobDetailsDisplay.innerHTML = `<p style="color: red;">Error scraping job details: ${error instanceof Error ? error.message : String(error)}</p>`;
      }
    });
    
    // Add elements to container
    container.appendChild(trCountDisplay);
    container.appendChild(scrapeButton);
    container.appendChild(scrapeJobDetailsButton);
    container.appendChild(descriptionButton);
    container.appendChild(jobIdsDisplay);
    container.appendChild(loadingIndicator);
    container.appendChild(jobDetailsDisplay);
    
    // Insert container before the table
    table.parentNode?.insertBefore(container, table);
    
    // Mark this table as processed
    table.setAttribute('data-tr-counter-added', 'true');
  }
} 
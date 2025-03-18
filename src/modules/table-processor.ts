// Table processor module

import { 
  createStyledContainer, 
  createTrCountDisplay, 
  createJobIdsDisplay, 
  createDescriptionButton,
  createFetchOverviewsButton,
  createJobDetailsDisplay,
  createLoadingIndicator,
  updateLoadingProgress,
  renderJobOverviews
} from './dom-utils';

import { fetchAllJobOverviews } from './scraper';
import { JobDetails, JobOverview } from './types';

/**
 * Adds TR counter and buttons above WaterlooWorks tables
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
    
    // Create fetch job overviews button
    const fetchOverviewsButton = createFetchOverviewsButton();
    
    // Create description button
    const descriptionButton = createDescriptionButton();
    
    // Create job details display
    const jobDetailsDisplay = createJobDetailsDisplay();
    
    // Create loading indicator
    const loadingIndicator = createLoadingIndicator();
    
    // Check if there are already stored job overviews in Chrome storage
    chrome.storage.local.get(['jobOverviews'], (result) => {
      if (result.jobOverviews && Array.isArray(result.jobOverviews) && result.jobOverviews.length > 0) {
        console.log('Found stored job overviews:', result.jobOverviews.length);
        // Render the stored job overviews
        renderJobOverviews(jobDetailsDisplay, result.jobOverviews);
      }
    });
    
    // Add click event to the fetch job overviews button
    fetchOverviewsButton.addEventListener('click', async () => {
      try {
        // Reset and show loading indicator
        updateLoadingProgress(loadingIndicator, 0, 'Initializing job overview fetch...');
        loadingIndicator.style.display = 'block';
        jobDetailsDisplay.style.display = 'none';
        
        // Disable the button to prevent multiple clicks
        fetchOverviewsButton.disabled = true;
        fetchOverviewsButton.style.opacity = '0.7';
        fetchOverviewsButton.style.cursor = 'not-allowed';
        
        // Fetch all job overviews with progress updates
        const jobOverviews = await fetchAllJobOverviews((progress, message) => {
          updateLoadingProgress(loadingIndicator, progress, message);
        });
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        
        // Render job overviews
        renderJobOverviews(jobDetailsDisplay, jobOverviews);
        
        // Save job overviews to chrome.storage.local
        chrome.storage.local.set({ jobOverviews: jobOverviews }, () => {
          console.log('Job overviews saved to chrome.storage.local');
        });
        
        // Re-enable the button
        fetchOverviewsButton.disabled = false;
        fetchOverviewsButton.style.opacity = '1';
        fetchOverviewsButton.style.cursor = 'pointer';
      } catch (error: unknown) {
        console.error('Error fetching job overviews:', error);
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        
        // Show error message
        jobDetailsDisplay.style.display = 'block';
        jobDetailsDisplay.innerHTML = `<p style="color: red;">Error fetching job overviews: ${error instanceof Error ? error.message : String(error)}</p>`;
        
        // Re-enable the button
        fetchOverviewsButton.disabled = false;
        fetchOverviewsButton.style.opacity = '1';
        fetchOverviewsButton.style.cursor = 'pointer';
      }
    });
    
    // Add elements to container
    container.appendChild(trCountDisplay);
    container.appendChild(fetchOverviewsButton);
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
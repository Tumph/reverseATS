// DOM utility functions

import {JobOverview, JobDetails } from './types';
import { calculateJobResumeMatch, formatSimilarityScore, extractJobDescription } from './similarity';
import { injectMatchPercentagesIntoTable } from './table-injector';

/**
 * Creates a styled container for displaying information
 * @ returns The created container element
 */

export function createStyledContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'tr-counter-container';
  container.style.margin = '10px 0';
  container.style.padding = '10px';
  container.style.backgroundColor = '#f5f5f5';
  container.style.borderRadius = '5px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '10px';
  container.style.flexWrap = 'wrap';
  
  return container;
}

/**
 * Creates a TR count display element
 * @ returns The created TR count display element
 */
export function createTrCountDisplay(): HTMLDivElement {
  const trCountDisplay = document.createElement('div');
  trCountDisplay.className = 'tr-count-display';
  trCountDisplay.textContent = 'TR Count: ';
  trCountDisplay.style.fontWeight = 'bold';
  
  return trCountDisplay;
}

/**
 * Creates a job IDs display element
 * @ returns The created job IDs display element
 */
export function createJobIdsDisplay(): HTMLDivElement {
  const jobIdsDisplay = document.createElement('div');
  jobIdsDisplay.className = 'job-ids-display';
  jobIdsDisplay.style.marginTop = '5px';
  jobIdsDisplay.style.width = '100%';
  jobIdsDisplay.style.wordBreak = 'break-all';
  
  return jobIdsDisplay;
}

/**
 * Creates a description button that shows information about the extension
 * @returns The created description button element
 */
export function createDescriptionButton(): HTMLButtonElement {
  const descriptionButton = document.createElement('button');
  descriptionButton.textContent = 'ℹ️ About';
  descriptionButton.style.padding = '5px 10px';
  descriptionButton.style.backgroundColor = '#9e9e9e';
  descriptionButton.style.color = 'white';
  descriptionButton.style.border = 'none';
  descriptionButton.style.borderRadius = '3px';
  descriptionButton.style.cursor = 'pointer';
  descriptionButton.style.marginLeft = '10px';
  
  // Add click event to show description
  descriptionButton.addEventListener('click', () => {
    showExtensionDescription();
  });
  
  return descriptionButton;
}

/**
 * Shows a modal with information about the extension
 */
function showExtensionDescription(): void {
  // Create modal container
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '10000';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '5px';
  modalContent.style.maxWidth = '600px';
  modalContent.style.width = '80%';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.overflowY = 'auto';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#333';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = 'WaterlooWorks TR Counter';
  title.style.marginTop = '0';
  title.style.color = '#4285f4';
  
  // Create description
  const description = document.createElement('div');
  description.innerHTML = `
    <p><strong>Version:</strong> 1.0</p>
    <p>This extension helps you work with WaterlooWorks job listings by providing the following features:</p>
    <ul>
      <li><strong>TR Counter:</strong> Counts the number of table rows (jobs) on the page</li>
      <li><strong>Job ID Extraction:</strong> Extracts and displays all job IDs from the table</li>
      <li><strong>Job Overview Fetching:</strong> Extracts detailed overview information about each job</li>
    </ul>
    <h3>How to Use</h3>
    <ol>
      <li>Navigate to the WaterlooWorks job listings page</li>
      <li>Click the "Fetch Job Overviews" button to extract detailed information about each job</li>
      <li>Use the download buttons to export the data in your preferred format</li>
    </ol>
    <p><strong>Note:</strong> This extension works with the latest WaterlooWorks UI and extracts information directly from the page without making additional network requests.</p>
    <p><em>Created by: ReverseATS Team</em></p>
  `;
  description.style.lineHeight = '1.5';
  
  // Add elements to modal content
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(description);
  
  // Add modal content to modal
  modal.appendChild(modalContent);
  
  // Add modal to body
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

/**
 * Creates a button to fetch job overviews
 */
export function createFetchOverviewsButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = 'Fetch Job Overviews';
  button.style.backgroundColor = '#1a73e8';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.padding = '8px 16px';
  button.style.marginRight = '10px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '14px';
  
  // Check if resume exists in storage
  chrome.storage.local.get(['resumeText'], (result) => {
    if (!result.resumeText) {
      // Disable button if no resume is available
      button.disabled = true;
      button.style.backgroundColor = '#ccc';
      button.style.cursor = 'not-allowed';
      button.title = 'Upload a resume first to enable job matching';
      button.textContent = 'Upload Resume First';
      
      // Send message to background script to open popup
      chrome.runtime.sendMessage({ action: 'openPopup' });
      
      // Add click handler to still open popup when clicked
      button.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openPopup' });
      });
    }
  });
  
  return button;
}

/**
 * Creates a job details display element
 * @ returns The created job details display element
 */
export function createJobDetailsDisplay(): HTMLDivElement {
  const jobDetailsDisplay = document.createElement('div');
  jobDetailsDisplay.className = 'job-details-display';
  jobDetailsDisplay.style.marginTop = '10px';
  jobDetailsDisplay.style.width = '100%';
  jobDetailsDisplay.style.display = 'none'; // Initially hidden
  
  return jobDetailsDisplay;
}

/**
 * Creates a loading indicator element with progress bar
 * @returns The created loading indicator element
 */
export function createLoadingIndicator(): HTMLDivElement {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.style.marginTop = '10px';
  loadingIndicator.style.width = '100%';
  loadingIndicator.style.display = 'none'; // Initially hidden
  
  // Create status text
  const statusText = document.createElement('div');
  statusText.className = 'loading-status-text';
  statusText.textContent = 'Loading job overviews...';
  statusText.style.color = '#666';
  statusText.style.fontStyle = 'italic';
  statusText.style.marginBottom = '8px';
  loadingIndicator.appendChild(statusText);
  
  // Create progress container
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  progressContainer.style.width = '100%';
  progressContainer.style.height = '10px';
  progressContainer.style.backgroundColor = '#e0e0e0';
  progressContainer.style.borderRadius = '5px';
  progressContainer.style.overflow = 'hidden';
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.style.width = '0%';
  progressBar.style.height = '100%';
  progressBar.style.backgroundColor = '#fbbc05';
  progressBar.style.transition = 'width 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
  progressBar.style.transformOrigin = 'left';
  progressContainer.appendChild(progressBar);
  
  loadingIndicator.appendChild(progressContainer);
  
  // Create percentage text
  const percentageText = document.createElement('div');
  percentageText.className = 'percentage-text';
  percentageText.textContent = '0%';
  percentageText.style.color = '#666';
  percentageText.style.fontSize = '12px';
  percentageText.style.marginTop = '4px';
  percentageText.style.textAlign = 'right';
  loadingIndicator.appendChild(percentageText);
  
  return loadingIndicator;
}

/**
 * Updates the loading indicator progress
 * @param loadingIndicator The loading indicator element
 * @param progress The progress value between 0 and 100
 * @param statusMessage Optional status message to display
 */
export function updateLoadingProgress(loadingIndicator: HTMLDivElement, progress: number, statusMessage?: string): void {
  const progressBar = loadingIndicator.querySelector('.progress-bar') as HTMLDivElement;
  const percentageText = loadingIndicator.querySelector('.percentage-text') as HTMLDivElement;
  const statusText = loadingIndicator.querySelector('.loading-status-text') as HTMLDivElement;
  
  if (progressBar && percentageText) {
    // Clamp progress between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    // Update progress bar width
    progressBar.style.width = `${clampedProgress}%`;
    
    // Update percentage text
    percentageText.textContent = `${Math.round(clampedProgress)}%`;
    
    // Update status message if provided
    if (statusMessage && statusText) {
      statusText.textContent = statusMessage;
    }
  }
}

/**
 * Shows a popup with the HTML response for a job
 * @param rawHtml The raw HTML to display
 * @param jobId The job ID for the popup title
 */
function showHtmlPopup(rawHtml: string, jobId: string): void {
  // Create modal container
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '10000';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '5px';
  modalContent.style.maxWidth = '90%';
  modalContent.style.width = '1000px';
  modalContent.style.maxHeight = '90vh';
  modalContent.style.overflowY = 'auto';
  modalContent.style.position = 'relative';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#333';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = `Job Details: ${jobId}`;
  title.style.marginTop = '0';
  title.style.marginBottom = '15px';
  title.style.color = '#4285f4';
  
  // Create toggle buttons for view modes
  const toggleContainer = document.createElement('div');
  toggleContainer.style.display = 'flex';
  toggleContainer.style.marginBottom = '15px';
  toggleContainer.style.gap = '10px';
  
  const previewButton = document.createElement('button');
  previewButton.textContent = 'Preview';
  previewButton.style.padding = '5px 15px';
  previewButton.style.backgroundColor = '#4285f4';
  previewButton.style.color = 'white';
  previewButton.style.border = 'none';
  previewButton.style.borderRadius = '3px';
  previewButton.style.cursor = 'pointer';
  
  const sourceButton = document.createElement('button');
  sourceButton.textContent = 'Source';
  sourceButton.style.padding = '5px 15px';
  sourceButton.style.backgroundColor = '#9e9e9e';
  sourceButton.style.color = 'white';
  sourceButton.style.border = 'none';
  sourceButton.style.borderRadius = '3px';
  sourceButton.style.cursor = 'pointer';
  
  toggleContainer.appendChild(previewButton);
  toggleContainer.appendChild(sourceButton);
  
  // Create container for rendered HTML preview
  const previewContainer = document.createElement('div');
  previewContainer.style.border = '1px solid #ddd';
  previewContainer.style.padding = '0';
  previewContainer.style.backgroundColor = 'white';
  previewContainer.style.borderRadius = '4px';
  previewContainer.style.maxHeight = 'calc(90vh - 150px)';
  previewContainer.style.display = 'block';
  
  // Create iframe to safely render the HTML
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '600px';
  iframe.style.border = 'none';
  iframe.style.backgroundColor = 'white';
  previewContainer.appendChild(iframe);
  
  // Create container for HTML source code
  const sourceContainer = document.createElement('div');
  sourceContainer.style.border = '1px solid #ddd';
  sourceContainer.style.padding = '10px';
  sourceContainer.style.backgroundColor = '#f5f5f5';
  sourceContainer.style.borderRadius = '4px';
  sourceContainer.style.fontFamily = 'monospace';
  sourceContainer.style.fontSize = '12px';
  sourceContainer.style.whiteSpace = 'pre-wrap';
  sourceContainer.style.overflowX = 'auto';
  sourceContainer.style.maxHeight = 'calc(90vh - 150px)';
  sourceContainer.style.display = 'none';
  
  // Set the HTML source code
  sourceContainer.textContent = rawHtml;
  
  // Switch between preview and source views
  previewButton.addEventListener('click', () => {
    previewContainer.style.display = 'block';
    sourceContainer.style.display = 'none';
    previewButton.style.backgroundColor = '#4285f4';
    sourceButton.style.backgroundColor = '#9e9e9e';
  });
  
  sourceButton.addEventListener('click', () => {
    previewContainer.style.display = 'none';
    sourceContainer.style.display = 'block';
    previewButton.style.backgroundColor = '#9e9e9e';
    sourceButton.style.backgroundColor = '#4285f4';
  });
  
  // Add elements to modal content
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(toggleContainer);
  modalContent.appendChild(previewContainer);
  modalContent.appendChild(sourceContainer);
  
  // Add modal content to modal
  modal.appendChild(modalContent);
  
  // Add modal to body
  document.body.appendChild(modal);
  
  // Write HTML content to iframe after it's added to the DOM
  setTimeout(() => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(rawHtml);
      iframeDoc.close();
    }
  }, 0);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

/**
 * Renders job overviews in the job details display element
 * @param container The job details display element
 * @param overviews The job overviews to render
 */
export async function renderJobOverviews(container: HTMLDivElement, overviews: JobOverview[]): Promise<void> {
  // Clear previous content
  container.innerHTML = '';
  container.style.display = 'block';
  
  if (overviews.length === 0) {
    const noDetailsMessage = document.createElement('p');
    noDetailsMessage.textContent = 'No job overviews found.';
    container.appendChild(noDetailsMessage);
    return;
  }

  // Get the processed resume text for matching
  chrome.storage.local.get(['resumeText'], async (result) => {
    const hasResume = !!result.resumeText;
    let resumeText = result.resumeText || '';
    
    console.log('Resume storage check:', { 
      hasResume, 
      hasProcessedText: !!resumeText,
      processedTextLength: resumeText.length
    });
    
    // Calculate all match scores at once and save them
    const jobMatches: Array<{jobId: string, score: number}> = [];
    if (hasResume && resumeText) {
      // Process all match scores in parallel
      const matchPromises = overviews.map(async ({ jobId, overview }) => {
        try {
          // Extract job description text for matching
          const jobDescriptionText = overview['overview'] || '';
          
          // Calculate similarity
          const score = await calculateJobResumeMatch(jobDescriptionText, resumeText);
          return { jobId, score };
        } catch (error) {
          console.error(`Error calculating similarity for job ${jobId}:`, error);
          return { jobId, score: 0 };
        }
      });
      
      // Wait for all match calculations to complete
      const results = await Promise.all(matchPromises);
      jobMatches.push(...results);
      
      // Save job matches to chrome.storage.local
      chrome.storage.local.set({ jobMatches }, () => {
        console.log('Job matches saved to chrome.storage.local:', jobMatches.length);
      });
      
      // Import table injector and inject match percentages
      try {
        injectMatchPercentagesIntoTable(overviews);
      } catch (error) {
        console.error('Error injecting match percentages:', error);
      }
    }
    
    // Create a container for the job overviews
    const overviewsContainer = document.createElement('div');
    overviewsContainer.style.maxHeight = '500px';
    overviewsContainer.style.overflowY = 'auto';
    overviewsContainer.style.border = '1px solid #ddd';
    overviewsContainer.style.borderRadius = '5px';
    overviewsContainer.style.padding = '10px';
    
    // Show the number of jobs fetched
    const statsMessage = document.createElement('p');
    statsMessage.textContent = `Fetched overviews for ${overviews.length} jobs.`;
    if (!hasResume) {
      statsMessage.textContent += ' Upload a resume to see match percentages.';
      statsMessage.style.color = '#856404';
    }
    statsMessage.style.marginBottom = '15px';
    statsMessage.style.fontWeight = 'bold';
    overviewsContainer.appendChild(statsMessage);
    
    // Create a container for action buttons
    const actionsContainer = document.createElement('div');
    actionsContainer.style.marginBottom = '15px';
    actionsContainer.style.display = 'flex';
    actionsContainer.style.gap = '10px';
  
    // Process job overviews
    const processOverviews = async () => {
      // Create a job overview cards
      for (const { jobId, overview, rawHtml } of overviews) {
        const jobCard = document.createElement('div');
        jobCard.style.border = '1px solid #ddd';
        jobCard.style.borderRadius = '5px';
        jobCard.style.padding = '10px';
        jobCard.style.marginBottom = '15px';
        
        // Create header container with job ID and Show HTML button
        const headerContainer = document.createElement('div');
        headerContainer.style.display = 'flex';
        headerContainer.style.justifyContent = 'space-between';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.marginBottom = '10px';
        
        // Job ID as header
        const jobIdHeader = document.createElement('h3');
        jobIdHeader.textContent = `Job ID: ${jobId}`;
        jobIdHeader.style.margin = '0';
        jobIdHeader.style.color = '#4285f4';
        headerContainer.appendChild(jobIdHeader);
        
        // Container for match score and button
        const scoreButtonContainer = document.createElement('div');
        scoreButtonContainer.style.display = 'flex';
        scoreButtonContainer.style.alignItems = 'center';
        scoreButtonContainer.style.gap = '10px';
        
        // Display match score if available
        if (hasResume && resumeText) {
          // Find the match score from our precalculated matches
          const matchInfo = jobMatches.find(match => match.jobId === jobId);
          if (matchInfo) {
            const { score, color } = formatSimilarityScore(matchInfo.score);
            
            // Create match score element
            const matchScoreElement = document.createElement('div');
            matchScoreElement.textContent = score;
            matchScoreElement.style.fontSize = '14px';
            matchScoreElement.style.fontWeight = 'bold';
            matchScoreElement.style.color = color;
            
            scoreButtonContainer.appendChild(matchScoreElement);
          }
        }
        
        // Add Show HTML button if rawHtml exists
        if (rawHtml) {
          const showHtmlButton = document.createElement('button');
          showHtmlButton.textContent = 'Show Details';
          showHtmlButton.style.padding = '4px 8px';
          showHtmlButton.style.backgroundColor = '#9e9e9e';
          showHtmlButton.style.color = 'white';
          showHtmlButton.style.border = 'none';
          showHtmlButton.style.borderRadius = '3px';
          showHtmlButton.style.cursor = 'pointer';
          showHtmlButton.style.fontSize = '12px';
          
          // Add click event to show HTML popup
          showHtmlButton.addEventListener('click', () => {
            showHtmlPopup(rawHtml, jobId);
          });
          
          scoreButtonContainer.appendChild(showHtmlButton);
        }
        
        headerContainer.appendChild(scoreButtonContainer);
        jobCard.appendChild(headerContainer);

        
        // Create a details table
        const detailsTable = document.createElement('table');
        detailsTable.style.width = '100%';
        detailsTable.style.borderCollapse = 'collapse';
        
        // Add all overview fields with similarity score
        for (const [key, value] of Object.entries(overview)) {
          // Skip job title as it's already displayed as header, and skip overview as it's redundant with the overall match
          if (key === 'Job Title' || key === 'overview') continue;
          
          const row = document.createElement('tr');
          
          // Create key cell
          const keyCell = document.createElement('td');
          keyCell.textContent = key;
          keyCell.style.padding = '5px';
          keyCell.style.borderBottom = '1px solid #eee';
          keyCell.style.fontWeight = 'bold';
          keyCell.style.width = '30%';
          row.appendChild(keyCell);
          
          // Create value cell with similarity score instead of actual text
          const valueCell = document.createElement('td');
          valueCell.style.padding = '5px';
          valueCell.style.borderBottom = '1px solid #eee';
          valueCell.style.width = '70%';
          
          if (hasResume && resumeText && value) {
            try {
              // Calculate similarity (now async)
              const similarity = await calculateJobResumeMatch(value, resumeText);
              const { score, color } = formatSimilarityScore(similarity);
              
              // Display match percentage
              valueCell.textContent = score;
              valueCell.style.color = color;
              
            } catch (error) {
              console.error(`Error calculating similarity for field ${key}:`, error);
              valueCell.textContent = 'Error calculating match';
              valueCell.style.color = '#dc3545';
            }
          } else {
            // If no resume or empty field, show a placeholder
            valueCell.textContent = 'No match available';
            valueCell.style.color = '#6c757d';
          }
          
          row.appendChild(valueCell);
          detailsTable.appendChild(row);
        }
        
        jobCard.appendChild(detailsTable);
        overviewsContainer.appendChild(jobCard);
      }
      
      // Add to main container
      container.appendChild(overviewsContainer);
    };
    
    // Execute the async processing
    processOverviews().catch(error => {
      console.error('Error processing job overviews:', error);
      container.innerHTML = `<p style="color: red;">Error processing job overviews: ${error.message || 'Unknown error'}</p>`;
    });
  });
}

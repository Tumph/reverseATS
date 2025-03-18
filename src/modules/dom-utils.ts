// DOM utility functions

import {JobOverview } from './types';

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
      <li><strong>Data Export:</strong> Allows you to download job overviews as JSON or CSV</li>
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
 * Creates a fetch job overviews button element
 * @returns The created fetch job overviews button element
 */
export function createFetchOverviewsButton(): HTMLButtonElement {
  const fetchOverviewsButton = document.createElement('button');
  fetchOverviewsButton.textContent = 'Fetch Job Overviews';
  fetchOverviewsButton.style.padding = '5px 10px';
  fetchOverviewsButton.style.backgroundColor = '#fbbc05';
  fetchOverviewsButton.style.color = 'white';
  fetchOverviewsButton.style.border = 'none';
  fetchOverviewsButton.style.borderRadius = '3px';
  fetchOverviewsButton.style.cursor = 'pointer';
  fetchOverviewsButton.style.marginLeft = '10px';
  
  return fetchOverviewsButton;
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
 * Shows a popup with the raw HTML response
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
  title.textContent = `HTML Response for Job ID: ${jobId}`;
  title.style.marginTop = '0';
  title.style.marginBottom = '15px';
  title.style.color = '#4285f4';
  
  // Create container for HTML content
  const htmlContainer = document.createElement('div');
  htmlContainer.style.border = '1px solid #ddd';
  htmlContainer.style.padding = '10px';
  htmlContainer.style.backgroundColor = '#f5f5f5';
  htmlContainer.style.borderRadius = '4px';
  htmlContainer.style.fontFamily = 'monospace';
  htmlContainer.style.fontSize = '12px';
  htmlContainer.style.whiteSpace = 'pre-wrap';
  htmlContainer.style.overflowX = 'auto';
  htmlContainer.style.maxHeight = 'calc(90vh - 120px)';
  
  // Format the HTML for display - we'll use a simple approach to show the raw HTML
  // Note: For security, we're not using innerHTML, but showing the HTML as text
  htmlContainer.textContent = rawHtml;
  
  // Add elements to modal content
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(htmlContainer);
  
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
 * Renders job overviews in the job details display element
 * @param container The job details display element
 * @param overviews The job overviews to render
 */
export function renderJobOverviews(container: HTMLDivElement, overviews: JobOverview[]): void {
  // Clear previous content
  container.innerHTML = '';
  container.style.display = 'block';
  
  if (overviews.length === 0) {
    const noDetailsMessage = document.createElement('p');
    noDetailsMessage.textContent = 'No job overviews found.';
    container.appendChild(noDetailsMessage);
    return;
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
  statsMessage.style.marginBottom = '15px';
  statsMessage.style.fontWeight = 'bold';
  overviewsContainer.appendChild(statsMessage);
  
  // Create a container for action buttons
  const actionsContainer = document.createElement('div');
  actionsContainer.style.marginBottom = '15px';
  actionsContainer.style.display = 'flex';
  actionsContainer.style.gap = '10px';
  
  // Add download as JSON button
  const downloadJsonButton = document.createElement('button');
  downloadJsonButton.textContent = 'Download as JSON';
  downloadJsonButton.style.padding = '5px 10px';
  downloadJsonButton.style.backgroundColor = '#4285f4';
  downloadJsonButton.style.color = 'white';
  downloadJsonButton.style.border = 'none';
  downloadJsonButton.style.borderRadius = '3px';
  downloadJsonButton.style.cursor = 'pointer';
  downloadJsonButton.addEventListener('click', () => {
    downloadAsJson(overviews, 'job_overviews.json');
  });
  actionsContainer.appendChild(downloadJsonButton);
  
  // Add download as CSV button
  const downloadCsvButton = document.createElement('button');
  downloadCsvButton.textContent = 'Download as CSV';
  downloadCsvButton.style.padding = '5px 10px';
  downloadCsvButton.style.backgroundColor = '#34a853';
  downloadCsvButton.style.color = 'white';
  downloadCsvButton.style.border = 'none';
  downloadCsvButton.style.borderRadius = '3px';
  downloadCsvButton.style.cursor = 'pointer';
  downloadCsvButton.addEventListener('click', () => {
    downloadAsCsv(overviews, 'job_overviews.csv');
  });
  actionsContainer.appendChild(downloadCsvButton);
  
  // Add to container
  overviewsContainer.appendChild(actionsContainer);
  
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
    
    // Add Show HTML button if rawHtml exists
    if (rawHtml) {
      const showHtmlButton = document.createElement('button');
      showHtmlButton.textContent = 'Show HTML';
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
      
      headerContainer.appendChild(showHtmlButton);
    }
    
    jobCard.appendChild(headerContainer);
    
    // Job Title if available
    if (overview['Job Title']) {
      const jobTitle = document.createElement('h4');
      jobTitle.textContent = overview['Job Title'];
      jobTitle.style.margin = '0 0 10px 0';
      jobCard.appendChild(jobTitle);
    }
    
    // Create a details table
    const detailsTable = document.createElement('table');
    detailsTable.style.width = '100%';
    detailsTable.style.borderCollapse = 'collapse';
    
    // Add all overview fields
    for (const [key, value] of Object.entries(overview)) {
      // Skip job title as it's already displayed as header
      if (key === 'Job Title') continue;
      
      const row = document.createElement('tr');
      
      const keyCell = document.createElement('td');
      keyCell.textContent = key;
      keyCell.style.padding = '5px';
      keyCell.style.borderBottom = '1px solid #eee';
      keyCell.style.fontWeight = 'bold';
      keyCell.style.width = '30%';
      row.appendChild(keyCell);
      
      const valueCell = document.createElement('td');
      valueCell.textContent = value;
      valueCell.style.padding = '5px';
      valueCell.style.borderBottom = '1px solid #eee';
      valueCell.style.width = '70%';
      row.appendChild(valueCell);
      
      detailsTable.appendChild(row);
    }
    
    jobCard.appendChild(detailsTable);
    overviewsContainer.appendChild(jobCard);
  }
  
  // Add to main container
  container.appendChild(overviewsContainer);
}

/**
 * Downloads the given data as a JSON file
 * @param data The data to download
 * @param filename The name of the file
 */
function downloadAsJson(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Downloads the given data as a CSV file
 * @param overviews The job overviews to download
 * @param filename The name of the file
 */
function downloadAsCsv(overviews: JobOverview[], filename: string): void {
  // Get all unique keys from all overviews
  const allKeys = new Set<string>();
  allKeys.add('JobId'); // Always include JobId
  
  overviews.forEach(({ overview }) => {
    Object.keys(overview).forEach(key => allKeys.add(key));
  });
  
  // Convert to array and sort
  const headers = Array.from(allKeys);
  
  // Create CSV content
  let csv = headers.join(',') + '\n';
  
  overviews.forEach(({ jobId, overview }) => {
    const row = headers.map(header => {
      if (header === 'JobId') return jobId;
      
      // Get value for this header, or empty string if not present
      let value = overview[header] || '';
      
      // Escape quotes and wrap in quotes if contains comma or newline
      if (value.includes('"')) value = value.replace(/"/g, '""');
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value}"`;
      }
      
      return value;
    });
    
    csv += row.join(',') + '\n';
  });
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
} 
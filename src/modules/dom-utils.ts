// DOM utility functions

import { TableProcessingResult, JobDetails } from './types';

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
      <li><strong>Job Details Scraping:</strong> Extracts detailed information about each job</li>
      <li><strong>Data Export:</strong> Allows you to download job details as JSON or CSV</li>
    </ul>
    <h3>How to Use</h3>
    <ol>
      <li>Navigate to the WaterlooWorks job listings page</li>
      <li>Click the "Scrape" button to count rows and extract job IDs</li>
      <li>Click the "Scrape Job Details" button to extract detailed information about each job</li>
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
 * Creates a scrape button element
 * @ returns The created scrape button element
 */
export function createScrapeButton(): HTMLButtonElement {
  const scrapeButton = document.createElement('button');
  scrapeButton.textContent = 'Scrape';
  scrapeButton.style.padding = '5px 10px';
  scrapeButton.style.backgroundColor = '#4285f4';
  scrapeButton.style.color = 'white';
  scrapeButton.style.border = 'none';
  scrapeButton.style.borderRadius = '3px';
  scrapeButton.style.cursor = 'pointer';
  
  return scrapeButton;
}

/**
 * Creates a scrape job details button element
 * @ returns The created scrape job details button element
 */
export function createScrapeJobDetailsButton(): HTMLButtonElement {
  const scrapeJobDetailsButton = document.createElement('button');
  scrapeJobDetailsButton.textContent = 'Scrape Job Details';
  scrapeJobDetailsButton.style.padding = '5px 10px';
  scrapeJobDetailsButton.style.backgroundColor = '#34a853';
  scrapeJobDetailsButton.style.color = 'white';
  scrapeJobDetailsButton.style.border = 'none';
  scrapeJobDetailsButton.style.borderRadius = '3px';
  scrapeJobDetailsButton.style.cursor = 'pointer';
  scrapeJobDetailsButton.style.marginLeft = '10px';
  
  return scrapeJobDetailsButton;
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
 * Creates a loading indicator element
 * @ returns The created loading indicator element
 */
export function createLoadingIndicator(): HTMLDivElement {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.textContent = 'Loading job details...';
  loadingIndicator.style.marginTop = '10px';
  loadingIndicator.style.color = '#666';
  loadingIndicator.style.fontStyle = 'italic';
  loadingIndicator.style.display = 'none'; // Initially hidden
  
  return loadingIndicator;
}

/**
 * Processes a table to extract TR count and job IDs
 * @ param table The table element to process
 * @ returns Object containing TR count and job IDs
 */
export function processTable(table: HTMLTableElement): TableProcessingResult {
  const trElements = table.getElementsByTagName('tr');
  const trCount = trElements.length;
  
  // Scrape JobIds from the first <td> in each row (new UI structure)
  const jobIds: string[] = [];
  for (let j = 0; j < trElements.length; j++) {
    const tdElements = trElements[j].getElementsByTagName('td');
    if (tdElements.length >= 1) {
      const jobIdTd = tdElements[0]; // 1st td (0-indexed)
      if (jobIdTd && jobIdTd.textContent) {
        const jobId = jobIdTd.textContent.trim();
        if (jobId && !isNaN(Number(jobId))) { // Ensure it's a numeric job ID
          jobIds.push(jobId);
        }
      }
    }
  }
  
  return { trCount, jobIds };
}

/**
 * Renders job details in the job details display element
 * @param jobDetailsDisplay The job details display element
 * @param jobDetails The job details to render
 */
export function renderJobDetails(jobDetailsDisplay: HTMLDivElement, jobDetails: JobDetails[]): void {
  // Clear previous content
  jobDetailsDisplay.innerHTML = '';
  
  if (jobDetails.length === 0) {
    const noDetailsMessage = document.createElement('p');
    noDetailsMessage.textContent = 'No job details found.';
    jobDetailsDisplay.appendChild(noDetailsMessage);
    return;
  }
  
  // Create a container for the job details
  const detailsContainer = document.createElement('div');
  detailsContainer.style.maxHeight = '500px';
  detailsContainer.style.overflowY = 'auto';
  detailsContainer.style.border = '1px solid #ddd';
  detailsContainer.style.borderRadius = '5px';
  detailsContainer.style.padding = '10px';
  
  // Create a table for the job details
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  
  // Mark this table as already processed to prevent duplicate buttons
  table.setAttribute('data-tr-counter-added', 'true');
  
  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const headers = [
    'Job ID', 
    'Job Title', 
    'Organization', 
    'Location/City', 
    'Term', 
    'Openings', 
    'Status', 
    'Level', 
    'Deadline'
  ];
  
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.padding = '8px';
    th.style.textAlign = 'left';
    th.style.borderBottom = '2px solid #ddd';
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  jobDetails.forEach(job => {
    const row = document.createElement('tr');
    
    // Job ID
    const jobIdCell = document.createElement('td');
    jobIdCell.textContent = job.jobId;
    jobIdCell.style.padding = '8px';
    jobIdCell.style.borderBottom = '1px solid #ddd';
    row.appendChild(jobIdCell);
    
    // Job Title
    const jobTitleCell = document.createElement('td');
    jobTitleCell.textContent = job.jobTitle || 'N/A';
    jobTitleCell.style.padding = '8px';
    jobTitleCell.style.borderBottom = '1px solid #ddd';
    row.appendChild(jobTitleCell);
    
    // Organization
    const organizationCell = document.createElement('td');
    organizationCell.textContent = job.organization || 'N/A';
    organizationCell.style.padding = '8px';
    organizationCell.style.borderBottom = '1px solid #ddd';
    row.appendChild(organizationCell);
    
    // Location/City
    const locationCell = document.createElement('td');
    const locationText = [job.location, job.city].filter(Boolean).join(' / ') || 'N/A';
    locationCell.textContent = locationText;
    locationCell.style.padding = '8px';
    locationCell.style.borderBottom = '1px solid #ddd';
    row.appendChild(locationCell);
    
    // Term
    const termCell = document.createElement('td');
    termCell.textContent = job.term || 'N/A';
    termCell.style.padding = '8px';
    termCell.style.borderBottom = '1px solid #ddd';
    row.appendChild(termCell);
    
    // Openings
    const openingsCell = document.createElement('td');
    openingsCell.textContent = job.openings || 'N/A';
    openingsCell.style.padding = '8px';
    openingsCell.style.borderBottom = '1px solid #ddd';
    row.appendChild(openingsCell);
    
    // Status
    const statusCell = document.createElement('td');
    statusCell.textContent = job.status || 'N/A';
    statusCell.style.padding = '8px';
    statusCell.style.borderBottom = '1px solid #ddd';
    row.appendChild(statusCell);
    
    // Level
    const levelCell = document.createElement('td');
    levelCell.textContent = job.level || 'N/A';
    levelCell.style.padding = '8px';
    levelCell.style.borderBottom = '1px solid #ddd';
    row.appendChild(levelCell);
    
    // Deadline
    const deadlineCell = document.createElement('td');
    deadlineCell.textContent = job.deadline || 'N/A';
    deadlineCell.style.padding = '8px';
    deadlineCell.style.borderBottom = '1px solid #ddd';
    row.appendChild(deadlineCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  detailsContainer.appendChild(table);
  
  // Add a download button
  const downloadButton = document.createElement('button');
  downloadButton.textContent = 'Download Job Details (JSON)';
  downloadButton.style.marginTop = '10px';
  downloadButton.style.padding = '5px 10px';
  downloadButton.style.backgroundColor = '#4285f4';
  downloadButton.style.color = 'white';
  downloadButton.style.border = 'none';
  downloadButton.style.borderRadius = '3px';
  downloadButton.style.cursor = 'pointer';
  
  downloadButton.addEventListener('click', () => {
    // Create a JSON blob
    const jsonBlob = new Blob([JSON.stringify(jobDetails, null, 2)], { type: 'application/json' });
    
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(jsonBlob);
    downloadLink.download = `waterlooworks_jobs_${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });
  
  detailsContainer.appendChild(downloadButton);
  
  // Add a CSV download button
  const csvDownloadButton = document.createElement('button');
  csvDownloadButton.textContent = 'Download Job Details (CSV)';
  csvDownloadButton.style.marginTop = '10px';
  csvDownloadButton.style.marginLeft = '10px';
  csvDownloadButton.style.padding = '5px 10px';
  csvDownloadButton.style.backgroundColor = '#34a853';
  csvDownloadButton.style.color = 'white';
  csvDownloadButton.style.border = 'none';
  csvDownloadButton.style.borderRadius = '3px';
  csvDownloadButton.style.cursor = 'pointer';
  
  csvDownloadButton.addEventListener('click', () => {
    // Create CSV header
    const csvHeader = [
      'Job ID',
      'Job Title',
      'Organization',
      'Location',
      'City',
      'Term',
      'Openings',
      'Status',
      'Level',
      'Deadline',
      'Scraped At'
    ].join(',');
    
    // Create CSV rows
    const csvRows = jobDetails.map(job => [
      `"${job.jobId || ''}"`,
      `"${(job.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(job.organization || '').replace(/"/g, '""')}"`,
      `"${(job.location || '').replace(/"/g, '""')}"`,
      `"${(job.city || '').replace(/"/g, '""')}"`,
      `"${(job.term || '').replace(/"/g, '""')}"`,
      `"${(job.openings || '').replace(/"/g, '""')}"`,
      `"${(job.status || '').replace(/"/g, '""')}"`,
      `"${(job.level || '').replace(/"/g, '""')}"`,
      `"${(job.deadline || '').replace(/"/g, '""')}"`,
      `"${job.scrapedAt || ''}"`
    ].join(','));
    
    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Create a CSV blob
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(csvBlob);
    downloadLink.download = `waterlooworks_jobs_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });
  
  detailsContainer.appendChild(csvDownloadButton);
  
  // Show the job details
  jobDetailsDisplay.style.display = 'block';
  jobDetailsDisplay.appendChild(detailsContainer);
} 
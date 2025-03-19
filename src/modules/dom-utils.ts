

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

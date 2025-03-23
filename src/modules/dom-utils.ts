/**
 * Creates a styled container for displaying information
 * @ returns The created container element
 */

export function createStyledContainer(): HTMLDivElement {
  console.log('dom-utils.ts createStyledContainer');
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
 * @ returns The created loading indicator element
 */
export function createLoadingIndicator(): HTMLDivElement {
  console.log('dom-utils.ts createLoadingIndicator');
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.style.marginTop = '10px';
  loadingIndicator.style.width = '100%';
  loadingIndicator.style.display = 'none'; // Initially hidden
  loadingIndicator.style.padding = '12px';
  loadingIndicator.style.backgroundColor = '#1a1a2e';
  loadingIndicator.style.borderRadius = '8px';
  loadingIndicator.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
  loadingIndicator.style.border = '1px solid #4d4d6e';
  
  // Add logo container
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.justifyContent = 'center';
  logoContainer.style.marginBottom = '10px';
  
  // Create SVG logo element
  const svgLogo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgLogo.setAttribute('width', '40');
  svgLogo.setAttribute('height', '40');
  svgLogo.setAttribute('viewBox', '0 0 24 24');
  svgLogo.setAttribute('fill', '#4361ee');
  svgLogo.style.filter = 'drop-shadow(0 0 3px rgba(67, 97, 238, 0.6))';
  
  // Add paths for the logo
  const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path1.setAttribute('d', 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z');
  
  const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path2.setAttribute('d', 'M7 12h2v5H7v-5zm0-5h2v2H7V7zm4 0h2v2h-2V7zm0 5h2v5h-2v-5zm4-5h2v2h-2V7zm0 5h2v5h-2v-5z');
  
  // Append paths to SVG
  svgLogo.appendChild(path1);
  svgLogo.appendChild(path2);
  
  // Add SVG to logo container
  logoContainer.appendChild(svgLogo);
  
  // Add logo container to loading indicator
  loadingIndicator.appendChild(logoContainer);
  
  // Create status text
  const statusText = document.createElement('div');
  statusText.className = 'loading-status-text';
  statusText.textContent = 'Loading job overviews...';
  statusText.style.color = '#e6e6e6';
  statusText.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  statusText.style.fontSize = '14px';
  statusText.style.fontWeight = '500';
  statusText.style.letterSpacing = '0.5px';
  statusText.style.marginBottom = '10px';
  loadingIndicator.appendChild(statusText);
  
  // Create progress container
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  progressContainer.style.width = '100%';
  progressContainer.style.height = '8px';
  progressContainer.style.backgroundColor = '#16213e';
  progressContainer.style.borderRadius = '4px';
  progressContainer.style.overflow = 'hidden';
  progressContainer.style.position = 'relative';
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.style.width = '0%';
  progressBar.style.height = '100%';
  progressBar.style.background = 'linear-gradient(90deg, #4361ee, #3a0ca3)';
  progressBar.style.boxShadow = '0 0 8px rgba(67, 97, 238, 0.6)';
  progressBar.style.transition = 'width 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
  progressBar.style.transformOrigin = 'left';
  progressContainer.appendChild(progressBar);
  
  // Add a pulsing effect line
  const pulsingLine = document.createElement('div');
  pulsingLine.style.position = 'absolute';
  pulsingLine.style.top = '0';
  pulsingLine.style.left = '0';
  pulsingLine.style.width = '5px';
  pulsingLine.style.height = '100%';
  pulsingLine.style.background = 'rgba(255, 255, 255, 0.3)';
  pulsingLine.style.animation = 'pulse 1.5s infinite linear';
  progressContainer.appendChild(pulsingLine);
  
  // Add keyframes animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(1000%); }
    }
  `;
  document.head.appendChild(style);
  
  loadingIndicator.appendChild(progressContainer);
  
  // Create percentage text
  const percentageText = document.createElement('div');
  percentageText.className = 'percentage-text';
  percentageText.textContent = '0%';
  percentageText.style.color = '#7ee8fa';
  percentageText.style.fontSize = '13px';
  percentageText.style.fontWeight = 'bold';
  percentageText.style.marginTop = '6px';
  percentageText.style.textAlign = 'right';
  percentageText.style.fontFamily = 'monospace';
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
  console.log('dom-utils.ts createJobDetailsDisplay');
  const jobDetailsDisplay = document.createElement('div');
  jobDetailsDisplay.className = 'job-details-display';
  jobDetailsDisplay.style.marginTop = '10px';
  jobDetailsDisplay.style.width = '100%';
  jobDetailsDisplay.style.display = 'none'; // Initially hidden
  
  return jobDetailsDisplay;
}

// DOM utility functions

import { TableProcessingResult } from './types';

/**
 * Creates a styled container for displaying information
 * @returns The created container element
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
 * @returns The created TR count display element
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
 * @returns The created job IDs display element
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
 * Creates a scrape button element
 * @returns The created scrape button element
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
 * Processes a table to extract TR count and job IDs
 * @param table The table element to process
 * @returns Object containing TR count and job IDs
 */
export function processTable(table: HTMLTableElement): TableProcessingResult {
  const trElements = table.getElementsByTagName('tr');
  const trCount = trElements.length;
  
  // Scrape JobIds from the 4th <td> in each row
  const jobIds: string[] = [];
  for (let j = 0; j < trElements.length; j++) {
    const tdElements = trElements[j].getElementsByTagName('td');
    if (tdElements.length >= 4) {
      const jobIdTd = tdElements[3]; // 4th td (0-indexed)
      if (jobIdTd && jobIdTd.textContent) {
        const jobId = jobIdTd.textContent.trim();
        if (jobId) {
          jobIds.push(jobId);
        }
      }
    }
  }
  
  return { trCount, jobIds };
} 
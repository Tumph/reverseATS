// Table injector module for adding match percentages to the WaterlooWorks table

import { formatSimilarityScore } from './similarity';
import { JobOverview } from './types';

/**
 * Injects a match percentage column into the WaterlooWorks table
 * @param overviews Array of job overviews with match scores
 */
export async function injectMatchPercentagesIntoTable(overviews: JobOverview[]): Promise<void> {
  try {
    // Get the main job table
    const table = document.querySelector('table.table.zebra.position--relative.data-viewer-table');
    if (!table) {
      console.error('Could not find WaterlooWorks table');
      return;
    }
    
    // Create a map of job IDs to match scores
    const matchScores: Record<string, number> = {};
    const jobMatches = await getJobMatches(overviews);
    
    // Store match scores in the map
    jobMatches.forEach(match => {
      matchScores[match.jobId] = match.score;
    });
    
    // Check if we've already added the match column
    if (table.querySelector('th[data-match-column="true"]')) {
      // Update existing match cells
      updateExistingMatchCells(table, matchScores);
      return;
    }
    
    // Add match column header to the table header
    const headerRow = table.querySelector('tr.table__row--header');
    if (!headerRow) {
      console.error('Could not find table header row');
      return;
    }
    
    // Add match column header before the ID column (which is the second th)
    const matchHeader = createMatchHeader();
    const idHeader = headerRow.querySelectorAll('th')[1]; // ID column is the second th
    if (idHeader) {
      headerRow.insertBefore(matchHeader, idHeader);
    } else {
      console.error('Could not find ID column header');
      return;
    }
    
    // Add match cells to each row
    const bodyRows = table.querySelectorAll('tr.table__row--body');
    bodyRows.forEach(row => {
      // Get the job ID from the row
      const idCell = row.querySelectorAll('td')[0]; // First TD contains the job ID
      if (!idCell) return;
      
      const jobId = idCell.textContent?.trim();
      if (!jobId) return;
      
      // Create match cell
      const matchCell = createMatchCell(jobId, matchScores[jobId] || 0);
      
      // Add match cell before the ID cell
      row.insertBefore(matchCell, idCell);
    });
    
    // Update colgroup to add a new column
    const colgroup = table.querySelector('colgroup');
    if (colgroup) {
      const newCol = document.createElement('col');
      newCol.style.width = '125px'; // Set width for the match column
      
      // Insert before the ID column (second col)
      const idCol = colgroup.querySelectorAll('col')[1];
      if (idCol) {
        colgroup.insertBefore(newCol, idCol);
      } else {
        colgroup.appendChild(newCol);
      }
    }
    
    // Add CSS for sorting indicators
    addSortingStyles();
    
  } catch (error) {
    console.error('Error injecting match percentages:', error);
  }
}

/**
 * Creates a table header cell for the match column
 * @returns The created header cell element
 */
function createMatchHeader(): HTMLTableHeaderCellElement {
  // Create the header cell
  const th = document.createElement('th');
  th.className = 'table__heading overflow--hidden';
  th.scope = 'col';
  th.setAttribute('data-match-column', 'true');
  th.setAttribute('data-sort-direction', 'none');
  
  // Create the container div
  const container = document.createElement('div');
  container.className = 'display--flex align--middle match--padding';
  
  // Inner div for label and button
  const innerDiv = document.createElement('div');
  innerDiv.className = 'display--flex align--middle';
  
  // Create label span
  const label = document.createElement('span');
  label.className = 'js--data-grid--header--label margin--l--s';
  label.style.paddingLeft = '0px';
  label.textContent = 'Match %';
  
  // Create sort button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn__default--text btn--white plain btn--icon-only margin--l--s margin--r--m';
  button.setAttribute('aria-label', 'Sort by Match Percentage');
  button.innerHTML = '<i aria-hidden="true" class="material-icons">swap_vert</i>';
  
  // Add click event to sort the table
  button.addEventListener('click', () => {
    const currentDirection = th.getAttribute('data-sort-direction') || 'none';
    let newDirection: 'asc' | 'desc' | 'none' = 'none';
    
    // Toggle sort direction
    if (currentDirection === 'none' || currentDirection === 'desc') {
      newDirection = 'asc'; // Sort ascending (lowest first)
    } else {
      newDirection = 'desc'; // Sort descending (highest first)
    }
    
    // Update sort direction attribute
    th.setAttribute('data-sort-direction', newDirection);
    
    // Update button icon
    if (newDirection === 'asc') {
      button.innerHTML = '<i aria-hidden="true" class="material-icons">keyboard_arrow_up</i>';
    } else if (newDirection === 'desc') {
      button.innerHTML = '<i aria-hidden="true" class="material-icons">keyboard_arrow_down</i>';
    } else {
      button.innerHTML = '<i aria-hidden="true" class="material-icons">swap_vert</i>';
    }
    
    // Sort the table rows
    sortTableByMatchPercentage(th.closest('table'), newDirection);
  });
  
  // Assemble the header elements
  innerDiv.appendChild(label);
  innerDiv.appendChild(button);
  container.appendChild(innerDiv);
  th.appendChild(container);
  
  // Add resize handle (to match other headers)
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize--handle display--flex align--center';
  resizeHandle.tabIndex = 0;
  resizeHandle.role = 'button';
  resizeHandle.setAttribute('aria-label', 'Resize Match % column');
  
  const resizeDiv = document.createElement('div');
  resizeHandle.appendChild(resizeDiv);
  th.appendChild(resizeHandle);
  
  return th;
}

/**
 * Creates a table cell for the match percentage
 * @param jobId The job ID
 * @param matchScore The match score (0-1)
 * @returns The created match cell element
 */
function createMatchCell(jobId: string, matchScore: number): HTMLTableCellElement {
  // Create the cell
  const td = document.createElement('td');
  td.className = 'table__value overflow--hidden';
  td.setAttribute('data-job-id', jobId);
  td.setAttribute('data-match-score', matchScore.toString());
  
  // Get formatted score and color
  const { score, color } = formatSimilarityScore(matchScore);
  
  // Create span to display the score
  const span = document.createElement('span');
  span.className = 'display--flex';
  span.style.fontWeight = 'bold';
  span.style.color = color;
  span.textContent = score;
  
  td.appendChild(span);
  return td;
}

/**
 * Sorts the table rows by match percentage
 * @param table The table element
 * @param direction Sort direction ('asc', 'desc', or 'none')
 */
function sortTableByMatchPercentage(table: HTMLTableElement | null, direction: 'asc' | 'desc' | 'none'): void {
  if (!table || direction === 'none') return;
  
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  
  // Get all rows
  const rows = Array.from(tbody.querySelectorAll('tr.table__row--body'));
  
  // Sort rows by match score
  rows.sort((a, b) => {
    const aCell = a.querySelector('td[data-match-score]');
    const bCell = b.querySelector('td[data-match-score]');
    
    const aScore = aCell ? parseFloat(aCell.getAttribute('data-match-score') || '0') : 0;
    const bScore = bCell ? parseFloat(bCell.getAttribute('data-match-score') || '0') : 0;
    
    return direction === 'asc' ? aScore - bScore : bScore - aScore;
  });
  
  // Reinsert rows in sorted order
  rows.forEach(row => tbody.appendChild(row));
}

/**
 * Updates match cells in an existing table
 * @param table The table element
 * @param matchScores Map of job IDs to match scores
 */
function updateExistingMatchCells(table: Element, matchScores: Record<string, number>): void {
  // Find all match cells
  const matchCells = table.querySelectorAll('td[data-job-id]');
  
  matchCells.forEach(cell => {
    const jobId = cell.getAttribute('data-job-id');
    if (!jobId || !matchScores[jobId]) return;
    
    // Update the cell's content and attributes
    const matchScore = matchScores[jobId];
    cell.setAttribute('data-match-score', matchScore.toString());
    
    // Get formatted score and color
    const { score, color } = formatSimilarityScore(matchScore);
    
    // Update the span
    const span = cell.querySelector('span');
    if (span) {
      span.style.color = color;
      span.textContent = score;
    }
  });
}

/**
 * Adds CSS styles for sorting icons
 */
function addSortingStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    th[data-match-column][data-sort-direction="asc"] .material-icons {
      color: #4285f4;
    }
    th[data-match-column][data-sort-direction="desc"] .material-icons {
      color: #4285f4;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Gets match scores for jobs by processing the job overviews
 * @param overviews Array of job overviews
 * @returns Promise resolving to array of job matches with scores
 */
async function getJobMatches(overviews: JobOverview[]): Promise<Array<{jobId: string, score: number}>> {
  // Get the processed resume text for matching
  return new Promise((resolve) => {
    chrome.storage.local.get(['jobMatches'], (result) => {
      // If we've already calculated matches, use those
      if (result.jobMatches && Array.isArray(result.jobMatches)) {
        resolve(result.jobMatches);
        return;
      }
      
      // If no matches, return empty array
      // Actual matching is done in renderJobOverviews before this is called
      resolve([]);
    });
  });
} 
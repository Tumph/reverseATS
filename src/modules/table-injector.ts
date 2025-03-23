// Table injector module for adding match percentages to the WaterlooWorks table

import { formatSimilarityScore } from './similarity';
import { JobOverview } from './types';

/**
 * Removes any existing match percentage columns from the WaterlooWorks table
 * @returns void
 */
export function removeMatchPercentagesFromTable(): void {

  // Find the table containing the job postings
  const table = document.querySelector('table[data-v-17eef081]');
  if (!table) return;
  
  // Remove match column header
  const matchHeader = table.querySelector('th[data-match-column="true"]');
  if (matchHeader && matchHeader.parentNode) {
    matchHeader.parentNode.removeChild(matchHeader);
  }
  
  // Remove match column from colgroup
  const colgroup = table.querySelector('colgroup');
  if (colgroup) {
    const cols = colgroup.querySelectorAll('col');
    // Match column is the first or second col (before ID column)
    if (cols.length > 1) {
      // Remove the column before the ID column
      colgroup.removeChild(cols[1]);
    }
  }
  
  // Remove all match cells from table rows
  const matchCells = table.querySelectorAll('td[data-job-id]');
  matchCells.forEach(cell => {
    if (cell.parentNode) {
      cell.parentNode.removeChild(cell);
    }
  });
  
}

/**
 * Injects a match percentage column into the WaterlooWorks table
 * @param overviews Array of job overviews with match scores
 */
export async function injectMatchPercentagesIntoTable(overviews: JobOverview[]): Promise<void> {

  if (!overviews || overviews.length === 0) {
    console.log('No job overviews available for matching');
    return;
  }
  
  // Verify we're on a supported page
  const currentUrl = window.location.href;
  const isSupportedPage = 
    currentUrl.includes('waterlooworks.uwaterloo.ca/myAccount/co-op/direct/jobs.htm') ||
    currentUrl.includes('waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm') ||
    currentUrl.includes('waterlooworks.uwaterloo.ca/myAccount/graduating/jobs.htm') ||
    currentUrl.includes('waterlooworks.uwaterloo.ca/myAccount/contract/jobs.htm');
  
  if (!isSupportedPage) {
    console.log('Not on a supported jobs page, skipping match percentage injection');
    return;
  }
  
  console.log(`Injecting match percentages for ${overviews.length} job overviews`);
  
  // Find the table containing the job postings
  const table = document.querySelector('table[data-v-17eef081]');
  if (!table) {
    console.log('Job table not found in the DOM');
    return;
  }
  

  // Create a map of job IDs to match scores
  const matchScores: Record<string, number> = {};
  const jobMatches = await getJobMatches(overviews);
  
  console.log(`Retrieved ${jobMatches.length} job matches from storage`);
  
  // Store match scores in the map
  jobMatches.forEach(match => {
    matchScores[match.jobId] = match.score;
  });
  
  // Check if the match column header exists
  const matchColumnExists = table.querySelector('th[data-match-column="true"]') !== null;
  
  // If match column header doesn't exist, add it
  if (!matchColumnExists) {
    console.log('Match column header does not exist, adding it');
    // Add match column header to the table header
    const headerRow = table.querySelector('tr.table__row--header');
    if (!headerRow) {
      console.log('Header row not found');
      return;
    }
    
    // Find the ID column
    const headerCells = headerRow.querySelectorAll('th');
    let idColumnIndex = -1;
    
    // Loop through header cells to find the ID column by its text content
    for (let i = 0; i < headerCells.length; i++) {
      const cellText = headerCells[i].textContent?.trim() || '';
      if (cellText.includes('ID')) {
        idColumnIndex = i;
        console.log(`Found ID column at index ${idColumnIndex}`);
        break;
      }
    }
    
    if (idColumnIndex === -1) {
      // Default to second column if ID column not found
      console.log('ID column not found, defaulting to index 1');
      idColumnIndex = 1;
    }
    
    // Add match column header before the ID column
    const matchHeader = createMatchHeader();
    const idHeader = headerRow.querySelectorAll('th')[idColumnIndex];
    
    if (idHeader) {
      headerRow.insertBefore(matchHeader, idHeader);
      console.log('Match header inserted successfully');
    } else {
      console.log('ID header element not found');
      return;
    }
    
    // Update colgroup to add a new column
    const colgroup = table.querySelector('colgroup');
    if (colgroup) {
      const newCol = document.createElement('col');
      newCol.style.width = '125px'; // Set width for the match column
      
      // Insert before the ID column col
      const idCol = colgroup.querySelectorAll('col')[idColumnIndex];
      if (idCol) {
        colgroup.insertBefore(newCol, idCol);
        console.log('Match column added to colgroup');
      } else {
        colgroup.appendChild(newCol);
        console.log('Match column appended to colgroup (ID col not found)');
      }
    }
    
    // Add CSS for sorting indicators
    addSortingStyles();
  } else {
    console.log('Match column header already exists');
  }
  
  // Process all body rows
  const bodyRows = table.querySelectorAll('tr.table__row--body');
  console.log(`Found ${bodyRows.length} rows to process`);
  
  let updatedRowCount = 0;
  let newCellCount = 0;
  
  bodyRows.forEach((row, index) => {
    // Check if this row already has a match cell
    const existingMatchCell = row.querySelector('td[data-job-id]');
    if (existingMatchCell) {
      // Update the existing match cell if a score exists
      const jobId = existingMatchCell.getAttribute('data-job-id');
      if (jobId && matchScores[jobId] !== undefined) {
        const matchScore = matchScores[jobId];
        existingMatchCell.setAttribute('data-match-score', matchScore.toString());
        
        // Get formatted score and color
        const { score, color } = formatSimilarityScore(matchScore);
        
        // Update the span
        const span = existingMatchCell.querySelector('span span');
        if (span && span instanceof HTMLElement) {
          span.style.color = color;
          span.textContent = score;
          updatedRowCount++;
        }
      }
      return; // Skip further processing for this row
    }
    
    // If we get here, the row doesn't have a match cell, so we need to add one
    
    // Determine the current page type to use appropriate job ID extraction logic
    const currentUrl = window.location.href;
    const isGraduatingJobsPage = currentUrl.includes('graduating/jobs.htm');
    const isFullCyclePage = currentUrl.includes('full/jobs.htm');
    const isContractPage = currentUrl.includes('contract/jobs.htm');
    const isDirectPage = currentUrl.includes('direct/jobs.htm');
    
    let jobId = '';
    let idCellIndex = -1;
    
    // First, try to find job ID in any cell with a 6-digit number
    const allCells = row.querySelectorAll('th, td');
    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i];
      const text = cell.textContent?.trim() || '';
      
      // Check for job ID (6-digit number)
      if (/^\d{6}$/.test(text)) {
        jobId = text;
        idCellIndex = i;
        break;
      }
      
      // Also check span elements within the cell
      const spans = cell.querySelectorAll('span');
      for (let j = 0; j < spans.length; j++) {
        const spanText = spans[j].textContent?.trim() || '';
        if (/^\d{6}$/.test(spanText)) {
          jobId = spanText;
          idCellIndex = i;
          break;
        }
      }
      
      if (jobId) break;
    }
    
    // If not found yet, try to find job ID in checkbox input value
    if (!jobId) {
      const checkbox = row.querySelector('input[type="checkbox"][name="dataViewerSelection"]');
      if (checkbox && checkbox instanceof HTMLInputElement && checkbox.value) {
        const checkboxValue = checkbox.value.trim();
        if (/^\d{6}$/.test(checkboxValue)) {
          jobId = checkboxValue;
          
          // Find the ID column by looking at the header
          const headerRow = table.querySelector('tr.table__row--header');
          if (headerRow) {
            const headerCells = headerRow.querySelectorAll('th');
            for (let i = 0; i < headerCells.length; i++) {
              const cellText = headerCells[i].textContent?.trim() || '';
              if (cellText.includes('ID')) {
                idCellIndex = i;
                break;
              }
            }
          }
        }
      }
    }
    
    if (!jobId || idCellIndex === -1) {
      // Unable to find job ID for this row
      if (index < 5) { // Only log for first few rows to avoid spam
        console.log(`Unable to find job ID for row ${index}`);
      }
      return;
    }
    
    // Create match cell
    const matchCell = createMatchCell(jobId, matchScores[jobId] || 0);
    
    // Find where to insert the match cell
    const headerRow = table.querySelector('tr.table__row--header');
    if (!headerRow) return;
    
    const headerCells = headerRow.querySelectorAll('th');
    let matchColumnIndex = -1;
    
    // Find the match column in the header
    for (let i = 0; i < headerCells.length; i++) {
      if (headerCells[i].hasAttribute('data-match-column')) {
        matchColumnIndex = i;
        break;
      }
    }
    
    if (matchColumnIndex === -1) {
      // Fallback to the old behavior if match column not found
      const idColumnIndex = findIdColumnIndex(headerCells);
      const targetCells = row.querySelectorAll('th, td');
      if (idColumnIndex < targetCells.length) {
        const targetCell = targetCells[idColumnIndex];
        row.insertBefore(matchCell, targetCell);
        newCellCount++;
      } else {
        const firstCell = targetCells[0];
        if (firstCell.nextSibling) {
          row.insertBefore(matchCell, firstCell.nextSibling);
          newCellCount++;
        } else {
          row.appendChild(matchCell);
          newCellCount++;
        }
      }
    } else {
      // Insert at exactly the same index as the match header
      const targetCells = row.querySelectorAll('th, td');
      if (matchColumnIndex < targetCells.length) {
        const targetCell = targetCells[matchColumnIndex];
        row.insertBefore(matchCell, targetCell);
        newCellCount++;
      } else {
        row.appendChild(matchCell);
        newCellCount++;
      }
    }
  });
  
  console.log(`Finished processing rows: ${updatedRowCount} updated, ${newCellCount} new match cells added`);
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
  
  // Create wrapper span to match site's styling
  const wrapperSpan = document.createElement('span');
  wrapperSpan.className = 'display--flex';
  
  // Create inner span to display the score with color
  const innerSpan = document.createElement('span');
  innerSpan.style.fontWeight = 'bold';
  innerSpan.style.color = color;
  innerSpan.textContent = score;
  
  // Add inner span to wrapper span
  wrapperSpan.appendChild(innerSpan);
  
  // Add wrapper span to cell
  td.appendChild(wrapperSpan);
  
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
      resolve([]);
    });
  });
}

/**
 * Helper function to find the ID column index
 * @param headerCells The header cells collection
 * @returns The index of the ID column, or 1 if not found
 */
function findIdColumnIndex(headerCells: NodeListOf<HTMLTableHeaderCellElement>): number {
  for (let i = 0; i < headerCells.length; i++) {
    const cellText = headerCells[i].textContent?.trim() || '';
    if (cellText.includes('ID')) {
      return i;
    }
  }
  return 1; // Default to second column if ID column not found
} 
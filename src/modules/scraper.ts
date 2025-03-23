import {JobOverview } from './types';

/**
 * Extracts the action token for getPostingOverview from the page's script tags
 * @returns {string|null} - The action token or null if not found
 */
function extractActionToken(): string | null {
  console.log('scraper.ts extractActionToken');
  try {
    // Convert all script tag contents to a single string
    const scriptTags = Array.from(document.querySelectorAll('script'));
    const scriptText = scriptTags.map(s => s.textContent).join('\n');
    
    // Extract the action token from the getPostingOverview function
    const match = scriptText.match(/getPostingOverview[^}]*action:\s*'([^\']+)'/);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches job overview data for a specific job ID using the API
 * @param {string} jobId - The ID of the job to fetch the overview for
 * @param {string} actionToken - The action token for making the API request
 * @returns {Promise<string|null>} - HTML content of the job overview or null if failed
 */
export async function fetchJobOverview(jobId: string, actionToken: string): Promise<string | null> {
  console.log('scraper.ts fetchJobOverview');
  try {
    // Get the current page URL to determine which endpoint to use
    const currentUrl = window.location.href;

    // Check if the current URL is one of the allowed job pages
    const allowedUrls = [
      '/myAccount/co-op/full/jobs.htm',
      '/myAccount/co-op/direct/jobs.htm',
      '/myAccount/graduating/jobs.htm',
      '/myAccount/contract/jobs.htm'
    ];
    
    const isAllowedUrl = allowedUrls.some(url => currentUrl.includes(url));
    
    if (!isAllowedUrl) {
      console.warn('Not on an allowed job page, skipping fetch');
      return null;
    }
    
    const payload = `action=${encodeURIComponent(actionToken)}&postingId=${jobId}`;
    
    const response = await fetch(currentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: payload,
      credentials: 'include' // Ensures cookies that are already in the session are sent with the request
    });
    
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }
    
    const html = await response.text();
    return html;
  } catch (error) {
    return null;
  }
}

/**
 * Processes and extracts text from job overview HTML without labeling
 * @param {string} html - HTML content of the job overview
 * @returns {object} - Object containing job title and full text content
 */
export function parseJobOverview(html: string): Record<string, string> {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Create a basic overview object with minimal structure
    const overview: Record<string, string> = {};
    
    // Extract job title separately as it's useful for display
    const jobTitle = doc.querySelector('.heading--banner');
    if (jobTitle && jobTitle.textContent) {
      overview['Job Title'] = jobTitle.textContent.trim().replace(/TAGS/i, '').trim();
    } else {
      overview['Job Title'] = 'Unknown Job Title';
    }
    
    // Convert the entire HTML content to text
    // Remove script and style elements first to clean up the content
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());
    
    // Get all text content from the document body
    const textContent = doc.body.textContent || '';
    
    // Clean up the text content (remove excessive whitespace)
    const cleanText = textContent
      .replace(/\s+/g, ' ')
      .trim();
    
    // Store the full text for matching (without labels)
    overview['overview'] = cleanText;
    
    return overview;
  } catch (error) {
    return { 
      'Job Title': 'Error Parsing Job',
      'overview': 'Failed to parse job data'
    };
  }
}

/**
 * Fetches overviews for all jobs from the current page
 * @param {Function} progressCallback - Optional callback function to report progress updates
 * @returns {Promise<JobOverview[]>} - Promise resolving to job overviews with raw HTML
 */
export async function fetchAllJobOverviews(
  progressCallback?: (progress: number, message: string) => void
): Promise<JobOverview[]> {
  console.log('scraper.ts fetchAllJobOverviews');
  try {
    // Function to extract job IDs from current page
    const extractJobIdsFromPage = () => {
      // Get the job table
      const table = document.querySelector('table[data-v-17eef081]');
      if (!table) {
        return [];
      }
      
      // Find all rows in the table
      const rows = table.querySelectorAll('tr');
      const jobIds: string[] = [];
      
      // Process each row to extract the job ID
      rows.forEach((row, index) => {
        try {
          // Skip header row
          if (row.classList.contains('table__row--header')) {
            return;
          }
          
          // Get all cells in the row (including th and td elements)
          const cells = row.querySelectorAll('td, th');
          
          // First approach: directly check all cell text content for IDs (simplest case)
          let idFound = false;
          for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const text = cell.textContent?.trim() || '';
            
            // Try to extract job ID from cell text (typically digits, allow 5-7 digits to be flexible)
            if (/^\d{5,7}$/.test(text)) {
              if (!jobIds.includes(text)) {
                jobIds.push(text);
                idFound = true;
                break;
              }
            }
          }
          
          // Second approach: Search through all span elements in the row if we didn't find an ID directly
          if (!idFound) {
            // Get all spans in this row
            const spans = row.querySelectorAll('span');
            
            // Check each span for job ID
            for (const span of Array.from(spans)) {
              const text = span.textContent?.trim() || '';
              
              // Check for digit-only text that could be a job ID (5-7 digits)
              if (/^\d{5,7}$/.test(text)) {
                if (!jobIds.includes(text)) {
                  jobIds.push(text);
                  idFound = true;
                  break;
                }
              }
            }
          }
          
          // Third approach: Look for any elements with numeric-only text
          if (!idFound) {
            // Create a TreeWalker to find all text nodes in this row
            const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
            let node;
            while (node = walker.nextNode()) {
              const text = node.textContent?.trim() || '';
              // Check for digit-only text that could be a job ID (5-7 digits)
              if (/^\d{5,7}$/.test(text)) {
                if (!jobIds.includes(text)) {
                  jobIds.push(text);
                  idFound = true;
                  break;
                }
              }
            }
          }
          
        } catch (error) {
          console.error('Error extracting job ID from row:', error);
        }
      });
      
      return jobIds;
    };
    
    // Get all job IDs
    const jobIds = extractJobIdsFromPage();
    
    if (progressCallback) {
      progressCallback(0, `Found ${jobIds.length} jobs. Starting overview fetch...`);
    }
    
    // Extract action token
    const actionToken = extractActionToken();
    if (!actionToken) {
      throw new Error('Failed to extract action token');
    }
    
    // Setup for smooth progress updates
    let lastProgressUpdate = Date.now();
    let currentProgress = 0;
    const updateProgressSmooth = (progress: number, message: string) => {
      if (!progressCallback) return;
      
      // Limit updates to be at least 60ms apart for smooth animation
      const now = Date.now();
      if (now - lastProgressUpdate > 60 || progress >= 99) {
        progressCallback(progress, message);
        lastProgressUpdate = now;
        currentProgress = progress;
      }
    };
    
    // Process jobs in batches to avoid overwhelming the server
    const results: JobOverview[] = [];
    let completedJobs = 0;
    const parallelBatchSize = 20; // Process 20 requests in parallel (increased from 12)
    
    // Function to get a progress value from 0-100 based on completed jobs
    const getProgressValue = (complete: number, total: number, fakeIncrement = 0) => {
      // Calculate real progress, but cap at 99% until fully complete
      const realProgress = (complete / total) * 100;
      return Math.min(realProgress + fakeIncrement, 99);
    };
    
    // Split all job IDs into batches
    for (let i = 0; i < jobIds.length; i += parallelBatchSize) {
      const batch = jobIds.slice(i, i + parallelBatchSize);
      const batchNumber = Math.floor(i/parallelBatchSize) + 1;
      const totalBatches = Math.ceil(jobIds.length/parallelBatchSize);
      
      updateProgressSmooth(
        getProgressValue(completedJobs, jobIds.length),
        `Processing batch ${batchNumber} of ${totalBatches} (${batch.length} jobs in parallel)...`
      );
      
      // Set up an array to track completions for this batch
      let batchCompletions = 0;
      
      // Process all jobs in the current batch in parallel
      const batchPromises = batch.map(async (jobId) => {
        try {
          const html = await fetchJobOverview(jobId, actionToken);
          
          // Update progress smoothly to show incremental completions within a batch
          batchCompletions++;
          const batchProgress = batchCompletions / batch.length;
          const overallProgress = getProgressValue(
            completedJobs + (batchCompletions / batch.length) * batch.length, 
            jobIds.length
          );
          
          updateProgressSmooth(
            overallProgress,
            `Fetching job overviews... (${completedJobs + batchCompletions} of ${jobIds.length})`
          );
          
          if (html) {
            const overview = parseJobOverview(html);
            return { 
              jobId, 
              overview, 
              rawHtml: html 
            };
          }
        } catch (error) {
          // Error handled silently
        }
        return null;
      });
      
      // Wait for all parallel requests in this batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Filter out null results and add to the results array
      batchResults.filter(result => result !== null).forEach(result => {
        if (result) {
          results.push(result);
        }
      });
      
      // Update progress after the batch completes
      completedJobs += batch.length;
      updateProgressSmooth(
        getProgressValue(completedJobs, jobIds.length),
        `Fetched ${results.length} of approximately ${jobIds.length} job overviews`
      );
      
      // Add a small delay between batches to avoid overwhelming the server
      if (i + parallelBatchSize < jobIds.length) {
        // Small micro-updates during the delay to make progress bar appear smoother
        const delayStart = Date.now();
        const totalDelay = 1000; // 1 second delay
        const updateInterval = 150; // Update every 150ms during delay
        
        while (Date.now() - delayStart < totalDelay) {
          const delayElapsed = Date.now() - delayStart;
          const delayProgress = delayElapsed / totalDelay;
          const fakeIncrement = delayProgress * (100 / jobIds.length) * 0.5; // Small increment to show activity
          
          updateProgressSmooth(
            getProgressValue(completedJobs, jobIds.length, fakeIncrement),
            `Fetched ${results.length} job overviews so far... preparing next batch`
          );
          
          await new Promise(resolve => setTimeout(resolve, updateInterval));
        }
      }
    }
    
    // Final progress update
    if (progressCallback) {
      progressCallback(100, `Completed! Fetched ${results.length} job overviews.`);
    }
    
    return results;
  } catch (error) {
    throw error;
  }
}

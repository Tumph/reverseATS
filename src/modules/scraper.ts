// Import required dependencies
import axios from 'axios';
import $ from 'jquery';
import { JobDetails, JobOverview } from './types';

/**
 * Scrapes all job IDs from the current page
 * @returns {Array<string>} - Array of job IDs
 */
export function scrapeJobIds(): string[] {
  const jobIds: string[] = [];
  
  // Method 1: Find job IDs from input elements with ID pattern
  $('input[id^="resultRow_"]').each(function() {
    const idAttr = $(this).attr('id');
    if (idAttr) {
      const jobId = idAttr.replace('resultRow_', '');
      if (jobId && !isNaN(Number(jobId)) && !jobIds.includes(jobId)) {
        jobIds.push(jobId);
      }
    }
  });
  
  // Method 2: Find job IDs from table cells (as backup)
  if (jobIds.length === 0) {
    $('.table__row--body').each(function() {
      // The job ID is in the first td element of each row
      const jobId = $(this).find('td:eq(0)').text().trim();
      if (jobId && !isNaN(Number(jobId)) && !jobIds.includes(jobId)) {
        jobIds.push(jobId);
      }
    });
  }
  
  return jobIds;
}

/**
 * Extracts the action token for getPostingOverview from the page's script tags
 * @returns {string|null} - The action token or null if not found
 */
function extractActionToken(): string | null {
  try {
    // Convert all script tag contents to a single string
    const scriptTags = Array.from(document.querySelectorAll('script'));
    const scriptText = scriptTags.map(s => s.textContent).join('\n');
    
    // Extract the action token from the getPostingOverview function
    const match = scriptText.match(/getPostingOverview[^}]*action:\s*'([^\']+)'/);
    if (match && match[1]) {
      console.log('Extracted action token:', match[1]);
      return match[1];
    }
    
    console.error('Action token not found - please report this error to aryansmail@gmail.com');
    return null;
  } catch (error) {
    console.error('Error extracting action token:', error);
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
  try {
    const url = 'https://waterlooworks.uwaterloo.ca/myAccount/co-op/direct/jobs.htm';
    const payload = `action=${encodeURIComponent(actionToken)}&postingId=${jobId}`;
    
    const response = await fetch(url, {
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
    console.error(`Error fetching overview for job ID ${jobId}:`, error);
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
    console.log('Parsing job overview HTML to plain text, length:', html.length);
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
    
    console.log('Extracted plain text length:', cleanText.length);
    console.log('Text sample:', cleanText.substring(0, 100) + '...');
    
    return overview;
  } catch (error) {
    console.error('Error parsing job overview HTML:', error);
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
  try {
    // Get all job IDs
    const jobIds = scrapeJobIds();
    console.log(`Found ${jobIds.length} jobs`);
    
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
    const parallelBatchSize = 12; // Process 12 requests in parallel (increased from 8)
    
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
        console.log(`Fetching overview for job ${jobId}...`);
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
          console.error(`Error fetching job ${jobId}:`, error);
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
    console.error('Error fetching all job overviews:', error);
    throw error;
  }
}

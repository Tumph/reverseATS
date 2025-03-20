// Table processor module

import { 
  createStyledContainer,
  createLoadingIndicator,
  updateLoadingProgress
} from './dom-utils';

import { fetchAllJobOverviews } from './scraper';
import { injectMatchPercentagesIntoTable, removeMatchPercentagesFromTable } from './table-injector';
import { calculateJobResumeMatch } from './similarity';

/**
 * Automatically runs the job scraper when conditions are met
 * This function doesn't add any buttons, just runs the scraper
 */
export async function automaticallyRunScraper(): Promise<void> {
  try {
    console.log('table-processor.ts automaticallyRunScraper');
    
    // Notify that scraping has started
    chrome.runtime.sendMessage({ action: 'scrapingStarted' });
    
    // Check if resume exists first
    const resumeResult = await new Promise<{resumeText?: string}>((resolve) => {
      chrome.storage.local.get(['resumeText'], resolve);
    });
    
    if (!resumeResult.resumeText) {
      chrome.runtime.sendMessage({ action: 'openPopup' });
      // Notify that scraping has finished
      chrome.runtime.sendMessage({ action: 'scrapingFinished' });
      return;
    }
    
    // Remove any existing match percentages from the table
    removeMatchPercentagesFromTable();
    
    // We need to scrape fresh job IDs each time, even if we have existing overviews
    // This ensures we get the current jobs on the page rather than stale data
    
    // Create container for the loading indicator
    const container = createStyledContainer();
    
    // Create loading indicator
    const loadingIndicator = createLoadingIndicator();
    
    // Add the loading indicator to the container
    container.appendChild(loadingIndicator);
    
    // Find the table to insert before
    const table = document.querySelector('table[data-v-17eef081]');
    
    if (table && table.parentNode) {
      // Insert container before the table
      table.parentNode.insertBefore(container, table);
    }
    
    // Show loading indicator
    updateLoadingProgress(loadingIndicator, 0, 'Initializing job overview fetch...');
    loadingIndicator.style.display = 'block';
    
    // Fetch all job overviews with progress updates
    const jobOverviews = await fetchAllJobOverviews((progress, message) => {
      updateLoadingProgress(loadingIndicator, progress, message);
    });
    
    // Hide loading indicator
    loadingIndicator.style.display = 'none';
    
    // Remove container after scraping is complete
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    // Calculate job matches
    await calculateAndSaveJobMatches(jobOverviews, resumeResult.resumeText);
    
    // Save job overviews to chrome.storage.local
    chrome.storage.local.set({ jobOverviews: jobOverviews }, () => {
      // Inject match percentages into the table
      injectMatchPercentagesIntoTable(jobOverviews);
      
      // Notify that scraping has finished
      chrome.runtime.sendMessage({ action: 'scrapingFinished' });
    });
  } catch (error: unknown) {
    // Handle error silently
    
    // Make sure to notify that scraping has finished even if there was an error
    chrome.runtime.sendMessage({ action: 'scrapingFinished' });
  }
}

/**
 * Calculate match scores for all jobs and save them
 * @param jobOverviews The job overviews to calculate matches for
 * @param resumeText The processed resume text
 */
async function calculateAndSaveJobMatches(jobOverviews: any[], resumeText: string): Promise<void> {
  try {
    // Get existing job matches first to avoid recalculating everything
    const existingMatches = await new Promise<Array<{jobId: string, score: number}>>((resolve) => {
      chrome.storage.local.get(['jobMatches'], (result) => {
        if (result.jobMatches && Array.isArray(result.jobMatches)) {
          resolve(result.jobMatches);
        } else {
          resolve([]);
        }
      });
    });
    
    // Create a map of existing job matches for quick lookup
    const existingMatchMap: Record<string, number> = {};
    existingMatches.forEach(match => {
      existingMatchMap[match.jobId] = match.score;
    });
    
    // Only calculate matches for jobs that don't already have a score
    const newJobOverviews = jobOverviews.filter(job => !existingMatchMap[job.jobId]);
    
    // Process new match scores in parallel
    const newMatchPromises = newJobOverviews.map(async ({ jobId, overview }) => {
      try {
        // Extract job description text for matching
        const jobDescriptionText = overview['overview'] || '';
        
        // Calculate similarity
        const score = await calculateJobResumeMatch(jobDescriptionText, resumeText);
        
        return { jobId, score };
      } catch (error) {
        console.error(`Error calculating match for job ${jobId}:`, error);
        return { jobId, score: 0 };
      }
    });
    
    // Wait for all new match calculations to complete
    const newMatches = await Promise.all(newMatchPromises);
    
    // Combine existing and new matches
    const combinedMatches = [...existingMatches];
    
    // Add new matches, avoiding duplicates
    newMatches.forEach(match => {
      // Only add if not already in combined matches
      if (!combinedMatches.some(m => m.jobId === match.jobId)) {
        combinedMatches.push(match);
      }
    });
    
    // Save job matches to chrome.storage.local
    chrome.storage.local.set({ jobMatches: combinedMatches }, () => {
      // After calculating and saving matches, inject them into the table
      try {
        // Remove any existing match percentages before injecting new ones
        removeMatchPercentagesFromTable();
        injectMatchPercentagesIntoTable(jobOverviews);
      } catch (error) {
        console.error('Error injecting match percentages:', error);
      }
    });
  } catch (error) {
    console.error('Error in calculateAndSaveJobMatches:', error);
  }
}

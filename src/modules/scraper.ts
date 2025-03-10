// Import required dependencies
import axios from 'axios';
import $ from 'jquery';
import { JobDetails } from './types';

/**
 * Extracts job details directly from the table row
 * @param {string} jobId - The ID of the job to extract details for
 * @returns {JobDetails | null} - Job details extracted from the table
 */
export function extractJobDetailsFromTable(jobId: string): JobDetails | null {
  try {
    // Find the job row for the given job ID - either by ID attribute or by content
    let jobRow = $(`#resultRow_${jobId}`).closest('tr');
    
    // If not found by ID, try finding by content
    if (!jobRow.length) {
      jobRow = $(`td:contains("${jobId}")`).filter(function() {
        return $(this).text().trim() === jobId;
      }).closest('tr');
    }
    
    if (!jobRow.length) {
      console.error(`Row for job ID ${jobId} not found`);
      return null;
    }
    
    // Extract all available information from the table row
    // The structure is based on the new UI where:
    // - First column (th) contains term info
    // - First td contains job ID
    // - Second td contains job title (with link)
    // - Third td contains organization
    // - Fourth td contains location
    // - Fifth td contains openings
    // - Sixth td contains status
    // - Seventh td contains city
    // - Eighth td contains level
    // - Ninth td contains application deadline
    
    const term = jobRow.find('th span:last').text().trim();
    const jobTitle = jobRow.find('td:eq(1) a').text().trim();
    const organization = jobRow.find('td:eq(2)').text().trim();
    const location = jobRow.find('td:eq(3)').text().trim();
    const openings = jobRow.find('td:eq(4)').text().trim();
    const status = jobRow.find('td:eq(5)').text().trim();
    const city = jobRow.find('td:eq(6)').text().trim();
    const level = jobRow.find('td:eq(7)').text().trim();
    const deadline = jobRow.find('td:eq(8)').text().trim();
    
    // Create a job details object with all available information
    const jobDetails: JobDetails = {
      jobId: jobId,
      jobTitle: jobTitle || null,
      organization: organization || null,
      location: location || null,
      city: city || null,
      openings: openings || null,
      status: status || null,
      level: level || null,
      deadline: deadline || null,
      term: term || null,
      
      // These fields can't be extracted from the table
      jobCategory: null,
      specialRequirements: null,
      jobSummary: null,
      jobResponsibilities: null,
      requiredSkills: null,
      division: null,
      
      // Metadata
      scrapedAt: new Date().toISOString()
    };
    
    return jobDetails;
  } catch (error) {
    console.error(`Error extracting details for job ID ${jobId}:`, error);
    return null;
  }
}

/**
 * Fetches job details - now just a wrapper around extractJobDetailsFromTable
 * @param {string} jobId - The ID of the job to fetch details for
 * @returns {Promise<JobDetails | null>} - A promise that resolves to job details
 */
export async function fetchJobDetails(jobId: string): Promise<JobDetails | null> {
  return extractJobDetailsFromTable(jobId);
}

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
 * Processes job details in batches using Promise.all for parallel processing
 * @param {string[]} jobIds - Array of job IDs to process
 * @param {number} batchSize - Number of jobs to process in parallel
 * @returns {Promise<JobDetails[]>} - Promise resolving to an array of job details
 */
async function processJobsInBatches(jobIds: string[], batchSize: number = 10): Promise<JobDetails[]> {
  const allJobDetails: JobDetails[] = [];
  
  // Process jobs in batches
  for (let i = 0; i < jobIds.length; i += batchSize) {
    const batch = jobIds.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(jobIds.length/batchSize)}`);
    
    // Process batch in parallel - since we're just extracting from DOM, we can use a larger batch size
    const batchResults = batch.map(jobId => {
      console.log(`Extracting details for job ${jobId}...`);
      return extractJobDetailsFromTable(jobId);
    });
    
    // Filter out null results and add to the collection
    batchResults.forEach(result => {
      if (result) {
        allJobDetails.push(result);
      }
    });
    
    // Small delay to avoid UI freezing
    if (i + batchSize < jobIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return allJobDetails;
}

/**
 * Scrapes all job details from the current page using parallel processing
 * @returns {Promise<Array<JobDetails>>} - Promise resolving to an array of job details
 */
export async function scrapeAllJobDetails(): Promise<JobDetails[]> {
  // Get all job IDs
  const jobIds = scrapeJobIds();
  console.log(`Found ${jobIds.length} jobs`);
  
  // Process jobs in batches for better performance
  return processJobsInBatches(jobIds);
}

// Legacy function for backward compatibility
export async function fetchJobDetailsWithAxios(jobId: string): Promise<JobDetails | null> {
  console.warn('fetchJobDetailsWithAxios is deprecated. Use fetchJobDetails instead.');
  return fetchJobDetails(jobId);
}
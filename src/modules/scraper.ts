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
    
    // Fallback: try to find any action token pattern
    const fallbackMatch = scriptText.match(/action:\s*'([^\']+)'/);
    if (fallbackMatch && fallbackMatch[1]) {
      console.log('Extracted fallback action token:', fallbackMatch[1]);
      return fallbackMatch[1];
    }
    
    console.error('Action token not found');
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
      credentials: 'include' // Ensures cookies are sent with the request
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
 * Processes and extracts key information from job overview HTML
 * @param {string} html - HTML content of the job overview
 * @returns {object} - Object containing extracted job overview data
 */
export function parseJobOverview(html: string): Record<string, string> {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract key fields - adjust selectors based on actual HTML structure
    const overview: Record<string, string> = {};
    
    // Try to get the job title first
    const jobTitle = doc.querySelector('.heading--banner');
    if (jobTitle) {
      overview['Job Title'] = jobTitle.textContent?.trim() || '';
    }
    
    // Common job information fields - check for table with job details
    const jobInfoSection = doc.querySelector('.orbis-posting-information, .job-information-table');
    if (jobInfoSection) {
      const rows = jobInfoSection.querySelectorAll('tr');
      rows.forEach(row => {
        const label = row.querySelector('th')?.textContent?.trim();
        const value = row.querySelector('td')?.textContent?.trim();
        if (label && value) {
          overview[label] = value;
        }
      });
    }
    
    // Job description section - look for different possible selectors
    const jobDescriptionSection = doc.querySelector('.orbis-posting-description, .job-description-container');
    if (jobDescriptionSection) {
      // Try to find card structure first
      const sections = jobDescriptionSection.querySelectorAll('div.card, .job-description-card');
      
      if (sections.length > 0) {
        sections.forEach(section => {
          const title = section.querySelector('.card-header, .description-header')?.textContent?.trim();
          const content = section.querySelector('.card-body, .description-content')?.textContent?.trim();
          if (title && content) {
            overview[title] = content;
          }
        });
      } else {
        // If no card structure, try other common patterns
        const descriptionBlocks = jobDescriptionSection.querySelectorAll('div[class*="description"], div[class*="posting-field"], .description-text');
        
        descriptionBlocks.forEach(block => {
          // Get title from heading or attribute
          let title = block.querySelector('h1, h2, h3, h4, h5, h6')?.textContent?.trim();
          
          // If no title found, try using a data attribute or class name
          if (!title) {
            const className = Array.from(block.classList).find(c => 
              c.includes('description') || c.includes('field') || c.includes('posting')
            );
            title = className ? className.replace(/-/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2') : 'Description';
          }
          
          // Get content by removing any title/heading elements and getting remaining text
          const contentNodes = Array.from(block.childNodes).filter(node => 
            !(node.nodeType === 1 && 
              ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER'].includes((node as Element).tagName))
          );
          
          let content = '';
          contentNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              content += (node as Element).textContent?.trim() + '\n';
            } else if (node.nodeType === 3) { // Text node
              const text = (node as Text).textContent?.trim();
              if (text) content += text + '\n';
            }
          });
          
          if (title && content.trim()) {
            overview[title] = content.trim();
          }
        });
      }
    }
    
    // If structured parsing fails, try to extract any visible text content by section
    if (Object.keys(overview).length === 0) {
      // Find main content areas
      const mainContent = doc.querySelector('main, .main-content, #content, body');
      
      if (mainContent) {
        // Job title might be in a heading
        const title = mainContent.querySelector('h1, h2, .job-title, .heading')?.textContent?.trim();
        if (title) {
          overview['Job Title'] = title;
        }
        
        // Try to find paragraphs or text blocks
        const paragraphs = mainContent.querySelectorAll('p, .text-block, div[class*="description"]');
        if (paragraphs.length > 0) {
          let description = '';
          paragraphs.forEach(p => {
            const text = p.textContent?.trim();
            if (text) description += text + '\n\n';
          });
          
          if (description) {
            overview['Job Description'] = description.trim();
          }
        }
        
        // If still no content, just grab all text
        if (Object.keys(overview).length === 0 || 
            (Object.keys(overview).length === 1 && overview['Job Title'])) {
          overview['Full Content'] = mainContent.textContent?.trim() || 'No content found';
        }
      } else {
        // Last resort - get body text
        overview['Content'] = doc.body.textContent?.trim() || 'No content found';
      }
    }
    
    // Process and clean up the extracted data
    const cleanedOverview: Record<string, string> = {};
    Object.entries(overview).forEach(([key, value]) => {
      // Clean up whitespace and normalize line breaks
      const cleanedValue = value
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n') // Normalize multiple line breaks
        .trim();
      
      if (cleanedValue) {
        cleanedOverview[key] = cleanedValue;
      }
    });
    
    return cleanedOverview;
  } catch (error) {
    console.error('Error parsing job overview HTML:', error);
    return { 'Error': 'Failed to parse job overview', 'Raw Content': html.substring(0, 500) + '...' };
  }
}

/**
 * Fetches overviews for all jobs from the current page
 * @returns {Promise<Array<{jobId: string, overview: Record<string, string>}>>} - Promise resolving to job overviews
 */
export async function fetchAllJobOverviews(): Promise<Array<{jobId: string, overview: Record<string, string>}>> {
  try {
    // Get all job IDs
    const jobIds = scrapeJobIds();
    console.log(`Found ${jobIds.length} jobs`);
    
    // Extract action token
    const actionToken = extractActionToken();
    if (!actionToken) {
      throw new Error('Failed to extract action token');
    }
    
    // Process jobs in batches to avoid overwhelming the server
    const results: Array<{jobId: string, overview: Record<string, string>}> = [];
    const batchSize = 5; // Smaller batch size for API calls
    
    for (let i = 0; i < jobIds.length; i += batchSize) {
      const batch = jobIds.slice(i, i + batchSize);
      console.log(`Processing overview batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(jobIds.length/batchSize)}`);
      
      // Process each job in the batch sequentially
      for (const jobId of batch) {
        console.log(`Fetching overview for job ${jobId}...`);
        const html = await fetchJobOverview(jobId, actionToken);
        
        if (html) {
          const overview = parseJobOverview(html);
          results.push({ jobId, overview });
        }
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching all job overviews:', error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function fetchJobDetailsWithAxios(jobId: string): Promise<JobDetails | null> {
  console.warn('fetchJobDetailsWithAxios is deprecated. Use fetchJobDetails instead.');
  return fetchJobDetails(jobId);
}
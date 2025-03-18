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
    
    // Process jobs in batches to avoid overwhelming the server
    const results: JobOverview[] = [];
    const batchSize = 5; // Smaller batch size for API calls
    let completedJobs = 0;
    
    for (let i = 0; i < jobIds.length; i += batchSize) {
      const batch = jobIds.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(jobIds.length/batchSize);
      
      console.log(`Processing overview batch ${batchNumber} of ${totalBatches}`);
      if (progressCallback) {
        progressCallback(
          (i / jobIds.length) * 100, 
          `Processing batch ${batchNumber} of ${totalBatches}...`
        );
      }
      
      // Process each job in the batch sequentially
      for (const jobId of batch) {
        console.log(`Fetching overview for job ${jobId}...`);
        const html = await fetchJobOverview(jobId, actionToken);
        
        if (html) {
          const overview = parseJobOverview(html);
          // Store the raw HTML along with the parsed overview
          results.push({ 
            jobId, 
            overview, 
            rawHtml: html 
          });
        }
        
        // Update progress after each job
        completedJobs++;
        if (progressCallback) {
          const jobProgress = (completedJobs / jobIds.length) * 100;
          progressCallback(
            jobProgress, 
            `Fetched ${completedJobs} of ${jobIds.length} job overviews (${Math.round(jobProgress)}%)`
          );
        }
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (progressCallback) {
      progressCallback(100, `Completed! Fetched ${results.length} job overviews.`);
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching all job overviews:', error);
    throw error;
  }
}

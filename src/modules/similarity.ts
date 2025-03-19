/**
 * Similarity comparison module for job descriptions and resumes
 * Uses compromise.js for NLP operations
 */
import nlp from 'compromise';

/**
 * Common English stopwords to filter out from texts
 */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'to', 'at', 'in', 'on', 'by', 'for', 'with', 'about', 'against',
  'of', 'from', 'as', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours',
  'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'am', 'will', 'would', 'can', 'could', 'shall', 'should', 'may',
  'might', 'must', 'ought', 'im', 'youre', 'hes', 'shes', 'its',
  'were', 'theyre', 'ive', 'youve', 'weve', 'theyve', 'id', 'youd',
  'hed', 'shed', 'wed', 'theyd', 'ill', 'youll', 'hell', 'shell',
  'well', 'theyll', 'isnt', 'arent', 'wasnt', 'werent', 'hasnt',
  'havent', 'hadnt', 'doesnt', 'dont', 'didnt', 'wont', 'wouldnt',
  'cant', 'cannot', 'couldnt', 'if', 'then', 'else', 'when', 'up', 'down', 
  'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'just', 'now'
]);

/**
 * Important technical and job-related terms and their weights
 */
export const TERM_WEIGHTS: Record<string, number> = {
  // Programming languages
  'javascript': 1.5,
  'typescript': 1.5,
  'python': 1.5,
  'java': 1.5,
  'c++': 1.5,
  'c#': 1.5,
  'php': 1.5,
  'ruby': 1.5,
  'swift': 1.5,
  'kotlin': 1.5,
  'rust': 1.5,
  'go': 1.5,
  
  // Technologies & Frameworks
  'react': 1.4,
  'angular': 1.4,
  'vue': 1.4,
  'node': 1.4,
  'express': 1.4,
  'django': 1.4,
  'flask': 1.4,
  'spring': 1.4,
  'rails': 1.4,
  'laravel': 1.4,
  
  // Database & Cloud
  'sql': 1.3,
  'mongodb': 1.3,
  'aws': 1.3,
  'azure': 1.3,
  'google cloud': 1.3,
  'firebase': 1.3,
  'docker': 1.3,
  'kubernetes': 1.3,
  
  // Common job skills
  'algorithm': 1.2,
  'api': 1.2,
  'architecture': 1.2,
  'design': 1.2,
  'test': 1.2,
  'debug': 1.2,
  'deploy': 1.2,
  'agile': 1.2,
  'scrum': 1.2,
  'lead': 1.2,
  'manage': 1.2,
  'collaborate': 1.2,
  'team': 1.2,
  'problem solving': 1.2
};

/**
 * Extracts plain text from HTML string
 * @param html HTML content
 * @returns Extracted plain text
 */
export function extractTextFromHtml(html: string): string {
  try {
    const doc = document.createElement('div');
    doc.innerHTML = html;
    
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(element => element.remove());
    
    return doc.textContent || doc.innerText || '';
  } catch (error) {
    return '';
  }
}

/**
 * Extracts the job description text between "Job Description" and "Targeted Clusters"
 * @param text The full overview text
 * @returns The extracted job description or the original text if the markers aren't found
 */
export function extractJobDescription(text: string): string {
  try {
    const startMarker = "Job Description";
    const endMarker = "Targeted Clusters";
    
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return text;
    
    const startPos = startIndex + startMarker.length;
    const endPos = text.indexOf(endMarker, startPos);
    
    if (endPos === -1) return text.substring(startPos);
    
    return text.substring(startPos, endPos).trim();
  } catch (error) {
    return text;
  }
}

/**
 * Preprocesses text using compromise.js
 * 
 * @param text Raw text to process
 * @returns Processed text document
 */
export function preprocessText(text: string) {
  const doc = nlp(text);
  
  // Normalize the text (lowercase, handle contractions)
  doc.normalize();
  
  return doc;
}

/**
 * Extract keywords from text using compromise.js
 * 
 * @param text Text to extract keywords from
 * @returns Array of keywords
 */
export function extractKeywords(text: string): string[] {
  const doc = preprocessText(text);
  
  // Get nouns, technical terms and important verbs
  const terms = doc.nouns().out('array');
  const verbs = doc.verbs().out('array');
  const techs = doc.match('#Technology').out('array');
  
  // Combine all terms
  const allTerms = [...new Set([...terms, ...verbs, ...techs])];
  
  // Filter out stopwords and short terms
  return allTerms
    .filter((term: string) => term.length > 2 && !STOPWORDS.has(term.toLowerCase()))
    .map((term: string) => term.toLowerCase());
}

/**
 * Get common keywords between two sets of terms
 * 
 * @param terms1 First set of terms
 * @param terms2 Second set of terms
 * @returns Object with common terms and match percentage
 */
function getCommonTerms(terms1: string[], terms2: string[]): { 
  common: string[]; 
  percentMatch: number; 
} {
  if (!terms1.length || !terms2.length) {
    return { common: [], percentMatch: 0 };
  }
  
  const set1 = new Set(terms1.map(term => term.toLowerCase()));
  const set2 = new Set(terms2.map(term => term.toLowerCase()));
  
  const common: string[] = [];
  for (const term of set1) {
    if (set2.has(term)) {
      common.push(term);
    }
  }
  
  const minSetSize = Math.min(set1.size, set2.size);
  const percentMatch = minSetSize > 0 ? common.length / minSetSize : 0;
  
  return { common, percentMatch };
}

/**
 * Calculate text similarity using compromise.js
 * 
 * @param text1 First text
 * @param text2 Second text
 * @returns Similarity score between 0 and 1
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  // Preprocess texts
  const doc1 = preprocessText(text1);
  const doc2 = preprocessText(text2);
  
  // Get terms from both texts
  const terms1 = doc1.terms().out('array').map((t: string) => t.toLowerCase());
  const terms2 = doc2.terms().out('array').map((t: string) => t.toLowerCase());
  
  // Filter out stopwords
  const filteredTerms1 = terms1.filter((term: string) => !STOPWORDS.has(term) && term.length > 2);
  const filteredTerms2 = terms2.filter((term: string) => !STOPWORDS.has(term) && term.length > 2);
  
  if (filteredTerms1.length === 0 || filteredTerms2.length === 0) {
    return 0;
  }
  
  // Calculate Jaccard similarity
  const set1 = new Set(filteredTerms1);
  const set2 = new Set(filteredTerms2);
  
  const intersection = new Set([...set1].filter(term => set2.has(term)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Calculate weighted similarity with emphasis on technical terms
 * 
 * @param text1 First text
 * @param text2 Second text
 * @returns Weighted similarity score between 0 and 1
 */
function calculateWeightedSimilarity(text1: string, text2: string): number {
  // Extract all terms
  const doc1 = preprocessText(text1);
  const doc2 = preprocessText(text2);
  
  // Get all terms
  const terms1 = doc1.terms().out('array').map((t: string) => t.toLowerCase());
  const terms2 = doc2.terms().out('array').map((t: string) => t.toLowerCase());
  
  // Filter out stopwords
  const filteredTerms1 = terms1.filter((term: string) => !STOPWORDS.has(term) && term.length > 2);
  const filteredTerms2 = terms2.filter((term: string) => !STOPWORDS.has(term) && term.length > 2);
  
  if (filteredTerms1.length === 0 || filteredTerms2.length === 0) {
    return 0;
  }
  
  // Get technical terms specifically
  const techTerms1 = filteredTerms1.filter((term: string) => TERM_WEIGHTS[term]);
  const techTerms2 = filteredTerms2.filter((term: string) => TERM_WEIGHTS[term]);
  
  // Calculate base Jaccard similarity for all terms
  const set1 = new Set(filteredTerms1);
  const set2 = new Set(filteredTerms2);
  const intersection = new Set([...set1].filter((term) => set2.has(term as string)));
  const union = new Set([...set1, ...set2]);
  
  // Weight technical matches more heavily
  let techBoost = 0;
  if (techTerms1.length > 0 && techTerms2.length > 0) {
    const techSet1 = new Set(techTerms1);
    const techSet2 = new Set(techTerms2);
    const techIntersection = new Set([...techSet1].filter((term) => techSet2.has(term as string)));
    techBoost = (techIntersection.size / Math.min(techSet1.size, techSet2.size)) * 0.3;
  }
  
  // Combine base similarity with technical boost
  return Math.min((intersection.size / union.size) + techBoost, 1.0);
}

/**
 * Calculates similarity between job description and resume
 * 
 * @param jobText Job description text
 * @param resumeText Resume text
 * @returns Promise with similarity score between 0 and 1
 */
export async function calculateJobResumeMatch(jobText: string, resumeText: string): Promise<number> {
  try {
    // Extract job description section
    const jobDescription = extractJobDescription(jobText);
    
    // Calculate similarity
    const similarity = calculateWeightedSimilarity(jobDescription, resumeText);
    
    // Extract keywords for additional weight
    const jobKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);
    
    // Get common keywords
    const { percentMatch } = getCommonTerms(jobKeywords, resumeKeywords);
    
    // Final score is weighted combination of text similarity and keyword matches
    const finalScore = (similarity * 0.6) + (percentMatch * 0.4);
    
    // Ensure score is between 0 and 1
    return Math.min(Math.max(finalScore, 0.05), 1.0);
  } catch (error) {
    console.error('Error calculating job-resume match:', error);
    // Fallback to 0.05 (5%) as minimum score
    return 0.05;
  }
}

/**
 * Formats similarity score as a percentage with color coding
 * 
 * @param similarity Similarity score between 0 and 1
 * @returns Object with formatted percentage and color
 */
export function formatSimilarityScore(similarity: number): { 
  score: string; 
  color: string;
  isGoodMatch: boolean;
} {
  const matchScore = Math.round(similarity * 100);
  
  let color = '#dc3545'; // Poor match - red
  let isGoodMatch = false;
  
  // Color thresholds
  if (matchScore >= 80) {
    color = '#28a745'; // Excellent match - green
    isGoodMatch = true;
  } else if (matchScore >= 65) {
    color = '#20c997'; // Good match - lighter green
    isGoodMatch = true;
  } else if (matchScore >= 50) {
    color = '#fd7e14'; // Medium match - orange
    isGoodMatch = false;
  } else if (matchScore >= 35) {
    color = '#ffc107'; // Below average - yellow
    isGoodMatch = false;
  } else if (matchScore >= 20) {
    color = '#e83e8c'; // Poor match - pink
    isGoodMatch = false;
  }
  
  return {
    score: `${matchScore}% Match`,
    color,
    isGoodMatch
  };
} 
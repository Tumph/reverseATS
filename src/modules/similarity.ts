/**
 * Similarity comparison module for job descriptions and resumes
 * Includes text processing utilities for NLP operations
 */

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
 * Important skills and keywords with their weights
 * Higher weight means the term is more important in the matching
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
 * Additional engineering and job-specific terms that should be weighted
 * even if they don't appear in the main TERM_WEIGHTS list
 */
export const ADDITIONAL_IMPORTANT_TERMS = [
  // Engineering job titles
  'engineer', 'developer', 'programmer', 'architect',
  'scientist', 'analyst', 'administrator', 'devops',
  
  // Technical skills
  'machine learning', 'data', 'security', 'networking',
  'cloud', 'backend', 'frontend', 'fullstack', 'web',
  'mobile', 'distributed', 'system', 'database',
  'infrastructure', 'automation', 'testing', 'analytics',
  
  // Soft skills
  'leadership', 'communication', 'teamwork', 'problem-solving',
  'critical thinking', 'creativity', 'adaptability',
  
  // Common terms
  'experience', 'skills', 'knowledge', 'degree', 'qualification',
  'project', 'development', 'implementation', 'optimization',
  'analysis', 'design', 'management', 'research', 'team',
  'responsible', 'built', 'created', 'led', 'improved', 'increased'
];

/**
 * Synonym mapping for job/resume terms
 * Maps common terms to their synonyms or related terms
 */
export const SYNONYM_MAP: Record<string, string[]> = {
  // Development roles
  'developer': ['engineer', 'programmer', 'coder', 'software engineer', 'implementer'],
  'software engineer': ['developer', 'programmer', 'coder', 'engineer'],
  'frontend': ['front-end', 'front end', 'ui', 'client-side'],
  'backend': ['back-end', 'back end', 'server-side', 'api'],
  'fullstack': ['full-stack', 'full stack', 'end-to-end'],
  
  // Common verbs
  'develop': ['create', 'build', 'implement', 'code', 'program', 'engineer'],
  'design': ['architect', 'plan', 'model', 'structure'],
  'analyze': ['examine', 'assess', 'evaluate', 'review'],
  'lead': ['manage', 'direct', 'guide', 'coordinate', 'supervise'],
  'collaborate': ['work with', 'cooperate', 'team up', 'partner'],
  
  // Technical terms
  'api': ['interface', 'endpoint', 'service', 'integration'],
  'database': ['db', 'data store', 'storage', 'repository'],
  'algorithm': ['method', 'procedure', 'routine', 'computation'],
  'deploy': ['release', 'ship', 'publish', 'launch'],
  'debug': ['troubleshoot', 'fix', 'resolve', 'diagnose']
};

/**
 * Weights for different sections in the matching algorithm
 */
export const SECTION_WEIGHTS: Record<string, number> = {
  'skills': 2.0,
  'experience': 1.5,
  'responsibilities': 1.8,
  'requirements': 1.8,
  'education': 0.7
};

/**
 * Configure weights for the hybrid scoring approach
 */
export const SCORING_WEIGHTS = {
  KEYWORD_MATCH: 0.45,      // Direct keyword matching
  COSINE_SIMILARITY: 0.35,  // Cosine similarity score
  ENTITY_EXTRACTION: 0.2,   // Entity extraction matching
  
  // Score boosting parameters
  SKILL_MATCH_BOOST: 0.3,   // Reduced from 1.5 to 0.3 - Boost if key skills match
  CONTEXT_BOOST: 0.2,       // Reduced from 1.2 to 0.2 - Boost if important context words match
  
  // Minimum baseline score (to avoid extremely low percentages)
  MIN_BASELINE_SCORE: 0.05  // Reduced from 0.15 to 0.05 - 5% minimum score for any comparison
};

/**
 * Check if a text contains important keywords
 * @param text Text to check for important keywords
 * @returns Object with found keywords and their importance
 */
export function extractImportantKeywords(text: string): {
  keywords: string[];
  importance: number;
} {
  if (!text) {
    return { keywords: [], importance: 0 };
  }
  
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  const foundKeywords: string[] = [];
  let totalImportance = 0;
  
  // Check for terms from TERM_WEIGHTS
  for (const [term, weight] of Object.entries(TERM_WEIGHTS)) {
    if (lowerText.includes(term)) {
      foundKeywords.push(term);
      totalImportance += weight;
    }
  }
  
  // Check for additional important terms
  for (const term of ADDITIONAL_IMPORTANT_TERMS) {
    if (lowerText.includes(term) && !foundKeywords.includes(term)) {
      foundKeywords.push(term);
      totalImportance += 1.0; // Default weight for additional terms
    }
  }
  
  return {
    keywords: foundKeywords,
    importance: totalImportance
  };
}

/**
 * Browser-friendly implementation to extract entities and key phrases from text
 * @param text Text to analyze
 * @returns Array of extracted entities and key phrases
 */
export function extractEntities(text: string): string[] {
  // Tokenize the text first
  const tokens = tokenize(text);
  
  // Filter out stopwords and short tokens
  const filteredTokens = tokens
    .filter(token => token.length > 2 && !STOPWORDS.has(token.toLowerCase()))
    .map(token => token.toLowerCase());
  
  // Count token frequencies to identify key terms
  const tokenCounts: Record<string, number> = {};
  for (const token of filteredTokens) {
    tokenCounts[token] = (tokenCounts[token] || 0) + 1;
  }
  
  // Sort by frequency and return top terms
  const sortedTokens = Object.entries(tokenCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token);
  
  // Return top entities (limited to 50 to avoid excessive matching)
  return sortedTokens.slice(0, 50);
}

/**
 * Get common keywords between two sets
 * @param set1 First set of keywords
 * @param set2 Second set of keywords
 * @returns Object with common keywords and percentage match
 */
export function getCommonKeywords(set1: string[], set2: string[]): {
  common: string[];
  percentMatch: number;
} {
  if (!set1.length || !set2.length) {
    return { common: [], percentMatch: 0 };
  }
  
  // Convert to Sets for faster lookups
  const set1Lower = new Set(set1.map(k => k.toLowerCase()));
  const set2Lower = new Set(set2.map(k => k.toLowerCase()));
  
  // Find common keywords
  const common: string[] = [];
  for (const keyword of Array.from(set1Lower)) {
    if (set2Lower.has(keyword)) {
      common.push(keyword);
    }
  }
  
  // Calculate percentage based on the smaller set's size
  const minSetSize = Math.min(set1Lower.size, set2Lower.size);
  const percentMatch = minSetSize > 0 ? common.length / minSetSize : 0;
  
  return { common, percentMatch };
}

/**
 * Simplified stemming function
 * @param word Word to stem
 * @returns Stemmed word
 */
export function stem(word: string): string {
  if (word.length < 3) return word;
  
  // Simple stemming rules
  if (word.endsWith('ing')) {
    const stem = word.slice(0, -3);
    return stem.length > 2 ? stem : word;
  } else if (word.endsWith('ed') && !word.endsWith('eed')) {
    const stem = word.slice(0, -2);
    return stem.length > 2 ? stem : word;
  } else if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) {
    return word.slice(0, -1);
  } else if (word.endsWith('ly')) {
    return word.slice(0, -2);
  } else if (word.endsWith('ment')) {
    return word.slice(0, -4);
  } else if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  } else if (word.endsWith('es') && !word.endsWith('ss')) {
    return word.slice(0, -2);
  }
  
  return word;
}

/**
 * Tokenize text into words
 * @param text Text to tokenize
 * @returns Array of tokens
 */
export function tokenize(text: string): string[] {
  // Remove non-alphanumeric characters and convert to lowercase
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
    .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
    .trim();                   // Remove leading/trailing spaces
  
  // Split by whitespace
  return cleanText.split(' ');
}

/**
 * Enhanced preprocessing for text
 * This version preserves important terms that might be removed by
 * standard preprocessing
 * @param text Raw text to preprocess
 * @returns Array of processed tokens
 */
export function preprocessText(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Extract important keywords first so they don't get stemmed/filtered
  const { keywords } = extractImportantKeywords(text);
  
  // Tokenize
  const tokens = tokenize(text);
  
  // Filter out stopwords and stem
  const processedTokens = tokens
    .filter(token => token.length > 2 && !STOPWORDS.has(token))
    .map(token => stem(token));
  
  // Add important keywords back in
  return [...new Set([...processedTokens, ...keywords])];
}

/**
 * Calculates basic term frequency for tokens
 * @param tokens Array of tokens
 * @returns Map of term frequencies
 */
export function calculateTermFrequency(tokens: string[]): Record<string, number> {
  const freqMap: Record<string, number> = {};
  
  for (const token of tokens) {
    freqMap[token] = (freqMap[token] || 0) + 1;
  }
  
  return freqMap;
}

/**
 * Extracts plain text from HTML string
 * @param html HTML content
 * @returns Extracted plain text
 */
export function extractTextFromHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  try {
    // Create a temporary DOM element
    const doc = document.createElement('div');
    doc.innerHTML = html;
    
    // Remove script and style elements
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(element => element.remove());
    
    // Get text content
    return doc.textContent || doc.innerText || '';
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    return '';
  }
}

/**
 * Calculates the cosine similarity between two texts
 * @param text1 First text for comparison
 * @param text2 Second text for comparison
 * @returns Similarity score between 0 and 1
 */
export function calculateCosineSimilarity(text1: string, text2: string): number {
  // Preprocess both texts
  const tokens1 = preprocessText(text1);
  const tokens2 = preprocessText(text2);
  
  if (tokens1.length === 0 || tokens2.length === 0) {
    return 0;
  }
  
  // Calculate term frequencies
  const freqMap1 = calculateTermFrequency(tokens1);
  const freqMap2 = calculateTermFrequency(tokens2);
  
  // Get all unique terms
  const allTerms = new Set([...tokens1, ...tokens2]);
  
  // Calculate cosine similarity
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  // For each term in the combined vocabulary
  allTerms.forEach(term => {
    const val1 = freqMap1[term] || 0;
    const val2 = freqMap2[term] || 0;
    
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  });
  
  // Prevent division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  // Calculate cosine similarity
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
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
    console.error("Error extracting job description:", error);
    return text;
  }
}

/**
 * Expands text with synonyms for better matching
 * @param text The original text
 * @returns Text expanded with synonyms
 */
export function expandWithSynonyms(text: string): string {
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Create an array to store the added synonyms
  const synonymsToAdd: string[] = [];
  
  // Check each term in synonym map
  for (const [term, synonyms] of Object.entries(SYNONYM_MAP)) {
    // If the text contains the term, add all its synonyms
    if (lowerText.includes(term)) {
      synonyms.forEach(synonym => {
        // Only add the synonym if it's not already in the text
        if (!lowerText.includes(synonym)) {
          synonymsToAdd.push(synonym);
        }
      });
    }
  }
  
  // Return the original text if no synonyms to add
  if (synonymsToAdd.length === 0) {
    return text;
  }
  
  // Add the synonyms to the original text
  return `${text} ${synonymsToAdd.join(' ')}`;
}

/**
 * Applies weights to term frequencies for enhanced matching
 * @param tokens Array of tokens
 * @returns Weighted term frequency map
 */
export function calculateWeightedTermFrequency(tokens: string[]): Record<string, number> {
  const freqMap: Record<string, number> = {};
  
  for (const token of tokens) {
    // Convert to lowercase for case-insensitive matching
    const lowerToken = token.toLowerCase();
    
    // Apply weight if the token is in the term weights map
    const weight = TERM_WEIGHTS[lowerToken] || 1.0;
    
    // Update the frequency map with the weighted value
    freqMap[lowerToken] = (freqMap[lowerToken] || 0) + weight;
  }
  
  return freqMap;
}

/**
 * Calculate weighted cosine similarity between two texts
 * @param text1 First text
 * @param text2 Second text
 * @returns Similarity score between 0 and 1
 */
export function calculateWeightedCosineSimilarity(text1: string, text2: string): number {
  // Preprocess both texts
  const tokens1 = preprocessText(text1);
  const tokens2 = preprocessText(text2);
  
  if (tokens1.length === 0 || tokens2.length === 0) {
    return 0;
  }
  
  // Calculate weighted term frequencies
  const freqMap1 = calculateWeightedTermFrequency(tokens1);
  const freqMap2 = calculateWeightedTermFrequency(tokens2);
  
  // Get all unique terms
  const allTerms = new Set([...tokens1, ...tokens2]);
  
  // Calculate weighted cosine similarity
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  // For each term in the combined vocabulary
  allTerms.forEach(term => {
    const val1 = freqMap1[term] || 0;
    const val2 = freqMap2[term] || 0;
    
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  });
  
  // Prevent division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  // Calculate cosine similarity
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

/**
 * Identify skill-related sections in job description
 * @param text Full text to analyze
 * @returns Object with extracted sections
 */
export function extractTextSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Simple section identification based on common keywords
  if (text.toLowerCase().includes('qualifications') || text.toLowerCase().includes('requirements')) {
    const qualificationsStart = text.toLowerCase().indexOf('qualifications');
    const requirementsStart = text.toLowerCase().indexOf('requirements');
    
    let sectionStart = -1;
    let sectionName = '';
    
    if (qualificationsStart !== -1 && (requirementsStart === -1 || qualificationsStart < requirementsStart)) {
      sectionStart = qualificationsStart;
      sectionName = 'requirements';
    } else if (requirementsStart !== -1) {
      sectionStart = requirementsStart;
      sectionName = 'requirements';
    }
    
    if (sectionStart !== -1) {
      // Look for the next section start or use the end of text
      const nextSectionStart = text.toLowerCase().substring(sectionStart + 10).search(/\b(responsibilities|skills|experience|education|about|company)\b/i);
      
      if (nextSectionStart !== -1) {
        sections[sectionName] = text.substring(sectionStart, sectionStart + 10 + nextSectionStart).trim();
      } else {
        sections[sectionName] = text.substring(sectionStart).trim();
      }
    }
  }
  
  // Extract skills section if present
  if (text.toLowerCase().includes('skills')) {
    const skillsStart = text.toLowerCase().indexOf('skills');
    
    // Look for the next section start or use the end of text
    const nextSectionStart = text.toLowerCase().substring(skillsStart + 6).search(/\b(responsibilities|experience|education|qualifications|requirements|about|company)\b/i);
    
    if (nextSectionStart !== -1) {
      sections['skills'] = text.substring(skillsStart, skillsStart + 6 + nextSectionStart).trim();
    } else {
      sections['skills'] = text.substring(skillsStart).trim();
    }
  }
  
  // Extract experience section if present
  if (text.toLowerCase().includes('experience')) {
    const experienceStart = text.toLowerCase().indexOf('experience');
    
    // Look for the next section start or use the end of text
    const nextSectionStart = text.toLowerCase().substring(experienceStart + 10).search(/\b(skills|education|qualifications|requirements|about|company)\b/i);
    
    if (nextSectionStart !== -1) {
      sections['experience'] = text.substring(experienceStart, experienceStart + 10 + nextSectionStart).trim();
    } else {
      sections['experience'] = text.substring(experienceStart).trim();
    }
  }
  
  // Add the full text as a fallback
  sections['full'] = text;
  
  return sections;
}

/**
 * Calculate the combined hybrid similarity score
 * @param jobKeywords Important keywords from job description
 * @param resumeKeywords Important keywords from resume
 * @param cosineSimilarity Cosine similarity score
 * @param entityMatch Entity match percentage
 * @returns Enhanced similarity score between 0 and 1
 */
export function calculateHybridScore(
  jobKeywords: string[],
  resumeKeywords: string[],
  cosineSimilarity: number,
  entityMatch: number
): number {
  // Get common keywords and match percentage
  const { common, percentMatch } = getCommonKeywords(jobKeywords, resumeKeywords);
  
  // Calculate scores for each component
  const keywordScore = percentMatch * SCORING_WEIGHTS.KEYWORD_MATCH;
  const cosineScore = cosineSimilarity * SCORING_WEIGHTS.COSINE_SIMILARITY;
  const entityScore = entityMatch * SCORING_WEIGHTS.ENTITY_EXTRACTION;
  
  // Calculate base score
  let combinedScore = keywordScore + cosineScore + entityScore;
  
  // Apply skill match boost if applicable - with diminishing returns
  if (common.length > 0) {
    // Apply a smaller boost with a log scale to prevent scores from shooting up too high
    const skillBoost = Math.log(common.length + 1) / 10 * SCORING_WEIGHTS.SKILL_MATCH_BOOST;
    combinedScore *= (1 + skillBoost);
  }
  
  // Apply a context boost if important context terms are present - with diminishing returns
  const contextMatches = jobKeywords.filter(kw => 
    TERM_WEIGHTS[kw] && resumeKeywords.includes(kw)
  ).length;
  
  if (contextMatches > 0) {
    // Use a log scale here too to prevent excessive boost
    const contextBoost = Math.log(contextMatches + 1) / 8 * SCORING_WEIGHTS.CONTEXT_BOOST;
    combinedScore *= (1 + contextBoost);
  }
  
  // Apply a more aggressive nonlinear scaling to create better distribution
  // This sigmoid-inspired curve will create more differentiation between scores
  combinedScore = (
    1 / (1 + Math.exp(-10 * (combinedScore - 0.5))) * 0.88 + 
    Math.pow(combinedScore, 1.5) * 0.12
  );
  
  // Enforce minimum baseline score
  combinedScore = Math.max(combinedScore, SCORING_WEIGHTS.MIN_BASELINE_SCORE);
  
  // Cap the score at 1.0
  return Math.min(combinedScore, 1.0);
}

/**
 * Calculates similarity between job description and resume using a hybrid approach
 * @param jobText Job description text
 * @param resumeText Resume text
 * @returns Similarity score between 0 and 1
 */
export async function calculateJobResumeMatch(jobText: string, resumeText: string): Promise<number> {
  try {
    // Extract relevant job description section
    const jobDescription = extractJobDescription(jobText);
    
    // Expand with synonyms
    const expandedJobText = expandWithSynonyms(jobDescription);
    const expandedResumeText = expandWithSynonyms(resumeText);
    
    // Extract keyword sets
    const jobKeywordsObj = extractImportantKeywords(expandedJobText);
    const resumeKeywordsObj = extractImportantKeywords(expandedResumeText);
    
    // Get entities
    const jobEntities = extractEntities(expandedJobText);
    const resumeEntities = extractEntities(expandedResumeText);
    
    // Calculate entity match
    const { percentMatch: entityMatch } = getCommonKeywords(jobEntities, resumeEntities);
    
    // Calculate traditional cosine similarity
    const cosineSimilarity = calculateWeightedCosineSimilarity(expandedJobText, expandedResumeText);
    
    // Calculate hybrid score 
    const hybridScore = calculateHybridScore(
      jobKeywordsObj.keywords,
      resumeKeywordsObj.keywords,
      cosineSimilarity,
      entityMatch
    );
    
    console.log('Match breakdown:', {
      cosineSimilarity,
      entityMatch,
      jobKeywords: jobKeywordsObj.keywords.length,
      resumeKeywords: resumeKeywordsObj.keywords.length,
      hybridScore
    });
    
    return hybridScore;
  } catch (error) {
    console.error("Error in calculateJobResumeMatch:", error);
    // Fallback to simple cosine similarity with minimum baseline
    return Math.max(
      calculateCosineSimilarity(jobText, resumeText), 
      SCORING_WEIGHTS.MIN_BASELINE_SCORE
    );
  }
}

/**
 * Formats similarity score as a percentage with color coding
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
  
  // Color thresholds adjusted for the new scoring curve
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
/**
 * Similarity comparison module for job descriptions and resumes
 * Uses compromise.js for NLP operations
 */
import nlp from 'compromise';

// Debug logging flag - set to false for production
const DEBUG_LOGGING = false;

/**
 * Helper function for consistent logging format
 * @param section The section name for the log
 * @param message The message to log
 * @param data Optional data to include in the log
 */
function debugLog(section: string, message: string, data?: any): void {
  if (!DEBUG_LOGGING) return;
  console.log(`[SIM:${section}] ${message}`, data !== undefined ? data : '');
}

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
 * Job domains and their associated keywords for domain detection
 */
const JOB_DOMAINS: Record<string, string[]> = {
  'technology': ['software', 'developer', 'engineer', 'programming', 'code', 'web', 'app', 'development', 'database', 'frontend', 'backend', 'fullstack'],
  'finance': ['finance', 'accounting', 'audit', 'banking', 'financial', 'investment', 'tax', 'budget', 'revenue', 'assets'],
  'healthcare': ['health', 'medical', 'clinical', 'patient', 'doctor', 'nurse', 'care', 'hospital', 'healthcare', 'therapy'],
  'marketing': ['marketing', 'brand', 'social media', 'seo', 'content', 'advertising', 'market', 'campaign', 'digital marketing'],
  'education': ['education', 'teaching', 'teacher', 'student', 'school', 'university', 'academic', 'professor', 'instructor', 'curriculum'],
  'legal': ['legal', 'law', 'attorney', 'lawyer', 'litigation', 'compliance', 'contract', 'paralegal', 'regulation'],
  'engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'design', 'construction', 'manufacturing', 'product', 'industrial'],
  'retail': ['retail', 'sales', 'customer', 'store', 'product', 'inventory', 'merchandising', 'consumer', 'ecommerce'],
  'hr': ['human resources', 'hr', 'recruiting', 'talent', 'hiring', 'employee', 'benefits', 'compensation', 'workforce']
};

/**
 * Domain-specific term weights
 */
const DOMAIN_WEIGHTS: Record<string, Record<string, number>> = {
  'technology': {
    'javascript': 2.5, 'typescript': 2.5, 'python': 2.5, 'java': 2.5, 'c++': 2.5,
    'react': 2.2, 'node': 2.2, 'angular': 2.2, 'vue': 2.2, 'html': 1.8, 'css': 1.8,
    'database': 2.0, 'aws': 2.0, 'cloud': 2.0, 'api': 2.0, 'web': 1.8,
    'algorithm': 1.5, 'data structure': 1.5, 'software': 1.5, 'architecture': 1.5,
    'agile': 1.3, 'scrum': 1.3, 'testing': 1.3, 'git': 1.3, 'ci/cd': 1.5
  },
  'finance': {
    'accounting': 2.5, 'finance': 2.5, 'audit': 2.5, 'financial': 2.5, 'tax': 2.5,
    'investment': 2.2, 'banking': 2.2, 'budget': 2.2, 'revenue': 2.2,
    'analysis': 2.0, 'forecast': 2.0, 'portfolio': 2.0, 'compliance': 2.0,
    'excel': 1.8, 'financial modeling': 1.8, 'gaap': 1.8, 'cpa': 2.0,
    'risk': 1.5, 'balance sheet': 1.5, 'cash flow': 1.5, 'profit': 1.5
  },
  'healthcare': {
    'nurse': 2.5, 'doctor': 2.5, 'patient': 2.5, 'hospital': 2.5, 'healthcare': 2.5,
    'therapy': 2.2, 'pharmacy': 2.2, 'nursing': 2.2, 'medical': 2.0,
    'surgery': 1.8, 'diagnosis': 1.8, 'treatment': 1.8, 'medicine': 1.8
  },
  'marketing': {
    'social media': 2.5, 'seo': 2.5, 'content': 2.5, 'advertising': 2.5, 'brand': 2.5,  
    'marketing': 2.2, 'campaign': 2.2, 'digital marketing': 2.2,
    'email marketing': 1.8, 'marketing automation': 1.8, 'analytics': 1.8
  },
  'education': {
    'teaching': 2.5, 'student': 2.5, 'school': 2.5, 'university': 2.5, 'academic': 2.5,
    'education': 2.2, 'curriculum': 2.2, 'instructor': 2.0, 'research': 1.8
  },
  'legal': {
    'law': 2.5, 'attorney': 2.5, 'litigation': 2.5, 'contract': 2.5, 'paralegal': 2.5,
    'regulation': 2.2, 'compliance': 2.2, 'legal': 2.0
  },
  'engineering': {
    'mechanical': 2.5, 'electrical': 2.5, 'civil': 2.5, 'design': 2.5, 'construction': 2.5,
    'manufacturing': 2.2, 'product': 2.0, 'industrial': 1.8
  },
  'retail': {
    'sales': 2.5, 'customer': 2.5, 'store': 2.5, 'inventory': 2.5, 'merchandising': 2.5,
    'retail': 2.2, 'consumer': 2.0, 'ecommerce': 1.8
  },
  'hr': {
    'human resources': 2.5, 'hr': 2.5, 'recruiting': 2.5, 'talent': 2.5, 'hiring': 2.5,
    'employee': 2.2, 'benefits': 2.0, 'compensation': 1.8
  }
};

/**
 * Important terms that apply across all job domains and their weights
 */
export const TERM_WEIGHTS: Record<string, number> = {
  // Generic skills valued in most jobs
  'management': 1.8, 'leadership': 1.8, 'communication': 1.8, 
  'problem solving': 1.8, 'teamwork': 1.8, 'analytical': 1.8,
  'organization': 1.6, 'planning': 1.6, 'time management': 1.6,
  'project management': 1.6, 'strategic': 1.6, 'innovative': 1.6,
  'research': 1.5, 'analysis': 1.5, 'reporting': 1.5,
  'presentation': 1.5, 'coordination': 1.5, 'collaboration': 1.5,
  
  // Experience levels
  'senior': 2.0, 'lead': 2.0, 'manager': 2.0, 'director': 2.0,
  'junior': 1.8, 'entry level': 1.8, 'intern': 1.8, 'associate': 1.8,
  'experienced': 1.7, 'professional': 1.7, 'specialist': 1.7,
  
  // Education
  'bachelor': 1.5, 'master': 1.5, 'phd': 1.5, 'degree': 1.5,
  'certification': 1.5, 'license': 1.5, 'graduate': 1.5,
  
  // Common software & tools
  'microsoft': 1.4, 'office': 1.4, 'excel': 1.4, 'word': 1.4,
  'powerpoint': 1.4, 'outlook': 1.4, 'software': 1.4,
  
  // Plus the domain-specific terms will be added dynamically
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
    
    const result = doc.textContent || doc.innerText || '';
    debugLog('extractTextFromHtml', `Extracted ${result.length} characters from HTML`);
    return result;
  } catch (error) {
    debugLog('extractTextFromHtml', `Error extracting text from HTML`, error);
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
    if (startIndex === -1) {
      debugLog('extractJobDescription', `Start marker "${startMarker}" not found, using full text`);
      return text;
    }
    
    const startPos = startIndex + startMarker.length;
    const endPos = text.indexOf(endMarker, startPos);
    
    let result;
    if (endPos === -1) {
      debugLog('extractJobDescription', `End marker "${endMarker}" not found, using text from start marker to end`);
      result = text.substring(startPos);
    } else {
      result = text.substring(startPos, endPos).trim();
    }
    
    debugLog('extractJobDescription', `Extracted job description (${result.length} chars)`);
    return result;
  } catch (error) {
    debugLog('extractJobDescription', `Error extracting job description`, error);
    return text;
  }
}

/**
 * Extract all sections from a job posting
 * @param text The full job posting text
 * @returns Object containing different sections
 */
export function extractJobSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {
    description: '',
    requirements: '',
    qualifications: '',
    responsibilities: ''
  };
  
  try {
    // Extract the main job description
    sections.description = extractJobDescription(text);
    
    // Look for other common section headers
    const reqMarkers = ['Requirements', 'Required Skills', 'Required Qualifications', 'What You Need'];
    const qualMarkers = ['Qualifications', 'Preferred Qualifications', 'Education', 'Skills'];
    const respMarkers = ['Responsibilities', 'Duties', 'What You\'ll Do', 'Role Description'];
    
    // Try to find each section
    for (const marker of reqMarkers) {
      const index = text.indexOf(marker);
      if (index !== -1) {
        const endIndex = findNextSectionStart(text, index + marker.length);
        sections.requirements = text.substring(index + marker.length, endIndex).trim();
        debugLog('extractJobSections', `Found requirements section using marker "${marker}" (${sections.requirements.length} chars)`);
        break;
      }
    }
    
    for (const marker of qualMarkers) {
      const index = text.indexOf(marker);
      if (index !== -1) {
        const endIndex = findNextSectionStart(text, index + marker.length);
        sections.qualifications = text.substring(index + marker.length, endIndex).trim();
        debugLog('extractJobSections', `Found qualifications section using marker "${marker}" (${sections.qualifications.length} chars)`);
        break;
      }
    }
    
    for (const marker of respMarkers) {
      const index = text.indexOf(marker);
      if (index !== -1) {
        const endIndex = findNextSectionStart(text, index + marker.length);
        sections.responsibilities = text.substring(index + marker.length, endIndex).trim();
        debugLog('extractJobSections', `Found responsibilities section using marker "${marker}" (${sections.responsibilities.length} chars)`);
        break;
      }
    }
    
    debugLog('extractJobSections', 'Extracted sections', {
      descLength: sections.description.length,
      reqLength: sections.requirements.length,
      qualLength: sections.qualifications.length,
      respLength: sections.responsibilities.length
    });
    
    return sections;
  } catch (error) {
    debugLog('extractJobSections', `Error extracting job sections`, error);
    return sections;
  }
}

/**
 * Helper to find the start of the next section
 */
function findNextSectionStart(text: string, startFrom: number): number {
  const sectionHeaders = [
    'Requirements', 'Qualifications', 'Responsibilities', 'Duties', 
    'Education', 'Experience', 'Skills', 'About Us', 'Company', 
    'Benefits', 'What We Offer', 'About the Role', 'Location'
  ];
  
  const indices = sectionHeaders
    .map(header => ({ header, index: text.indexOf(header, startFrom) }))
    .filter(item => item.index > startFrom)
    .sort((a, b) => a.index - b.index);
  
  return indices.length > 0 ? indices[0].index : text.length;
}

/**
 * Preprocesses text using compromise.js
 * 
 * @param text Raw text to process
 * @returns Processed text document
 */
export function preprocessText(text: string) {
  debugLog('preprocessText', `Processing text (${text.length} chars)`);
  const doc = nlp(text);
  
  // Normalize the text (lowercase, handle contractions)
  doc.normalize();
  
  return doc;
}

/**
 * Detects the most likely job domain from text
 * 
 * @param text The job description text
 * @returns The detected domain name or 'general' if no domain is detected
 */
function detectJobDomain(text: string): string {
  debugLog('detectJobDomain', `Detecting domain from ${text.length} chars of text`);
  const textLower = text.toLowerCase();
  const domainScores: Record<string, number> = {};
  
  // Score each domain based on keyword matches
  for (const [domain, keywords] of Object.entries(JOB_DOMAINS)) {
    let score = 0;
    const keywordMatches: Record<string, number> = {};
    
    for (const keyword of keywords) {
      // Count occurrences of each keyword
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        score += matches.length;
        keywordMatches[keyword] = matches.length;
      }
    }
    
    domainScores[domain] = score;
    debugLog('detectJobDomain', `Domain "${domain}" scored ${score}`, keywordMatches);
  }
  
  // Find the domain with the highest score
  let maxScore = 0;
  let detectedDomain = 'general';
  
  for (const [domain, score] of Object.entries(domainScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedDomain = domain;
    }
  }
  
  debugLog('detectJobDomain', `Detected domain: "${detectedDomain}" with score ${maxScore}`);
  return detectedDomain;
}

/**
 * Extract keywords from text using compromise.js
 * 
 * @param text Text to extract keywords from
 * @returns Array of keywords
 */
export function extractKeywords(text: string): string[] {
  debugLog('extractKeywords', `Extracting keywords from text (${text.length} chars)`);
  
  const doc = preprocessText(text);
  
  // Get nouns, technical terms and important verbs
  const terms = doc.nouns().out('array');
  const verbs = doc.verbs().out('array');
  const techs = doc.match('#Technology').out('array');
  const entities = doc.match('#Organization|#Company|#Industry').out('array');
  
  // Explicitly look for skill words that might not be caught by standard tags
  const skills = doc.match('(skill|ability|proficiency|competency|experience) (with|in|using)? #Noun+').out('array');
  
  // Look for programming languages and technologies specifically
  const techTerms = doc.match('(java|python|javascript|typescript|react|angular|vue|node|aws|azure|html|css|sql|nosql|mongodb|database|cloud|api|web|mobile|frontend|backend|fullstack)').out('array');
  
  debugLog('extractKeywords', 'Raw terms extracted', {
    nouns: terms.length,
    verbs: verbs.length,
    techs: techs.length,
    entities: entities.length,
    skills: skills.length,
    techTerms: techTerms.length
  });
  
  // Combine all terms
  const allTerms = [...new Set([...terms, ...verbs, ...techs, ...entities, ...skills, ...techTerms])];
  
  // Filter out stopwords and short terms
  const filteredTerms = allTerms
    .filter((term: string) => term.length > 2 && !STOPWORDS.has(term.toLowerCase()))
    .map((term: string) => term.toLowerCase());
  
  debugLog('extractKeywords', `Extracted ${filteredTerms.length} keywords from ${allTerms.length} raw terms`, 
    filteredTerms.length > 0 ? filteredTerms.slice(0, 20) : 'No keywords found');
  
  return filteredTerms;
}

/**
 * Extract keyphrases from text - finds multi-word terms
 * 
 * @param text Text to extract keyphrases from
 * @returns Array of keyphrases
 */
function extractKeyphrases(text: string): string[] {
  debugLog('extractKeyphrases', `Extracting keyphrases from text (${text.length} chars)`);
  const doc = preprocessText(text);
  
  // Extract noun phrases
  const nounPhrases = doc.match('#Adjective? #Noun+ (#Preposition #Noun+)?').out('array');
  
  // Extract skill-like phrases
  const skillPhrases = doc.match('(experience|skills|knowledge|proficiency|expertise) (in|with) #Adjective? #Noun+').out('array');
  
  // Get year-experience phrases
  const expPhrases = doc.match('#Cardinal (year|years) #Preposition? (experience|work|industry)').out('array');
  
  debugLog('extractKeyphrases', 'Raw phrases extracted', {
    nounPhrases: nounPhrases.length,
    skillPhrases: skillPhrases.length,
    expPhrases: expPhrases.length
  });
  
  // Combine all phrases
  const allPhrases = [...new Set([...nounPhrases, ...skillPhrases, ...expPhrases])];
  
  // Filter out short phrases and normalize
  const filteredPhrases = allPhrases
    .filter(phrase => phrase.length > 5)
    .map(phrase => phrase.toLowerCase());
  
  debugLog('extractKeyphrases', `Extracted ${filteredPhrases.length} keyphrases from ${allPhrases.length} raw phrases`,
    filteredPhrases.length > 0 ? filteredPhrases.slice(0, 10) : 'No keyphrases found');
  
  return filteredPhrases;
}

/**
 * Extracts important words from text with domain-specific weighting
 * 
 * @param text Text to extract important words from
 * @param domain Job domain for domain-specific weighting
 * @returns Map of important words and their weights
 */
function extractImportantWords(text: string, domain: string = 'general'): Map<string, number> {
  debugLog('extractImportantWords', `Extracting important words for domain "${domain}" from text (${text.length} chars)`);
  const keywords = extractKeywords(text);
  const keyphrases = extractKeyphrases(text);
  const result = new Map<string, number>();
  
  // Get domain-specific weights if available
  const domainWeights = DOMAIN_WEIGHTS[domain] || {};
  
  let defaultTerms = 0;
  let domainSpecificTerms = 0;
  let generalImportantTerms = 0;
  
  // Process keywords
  for (const word of keywords) {
    // Check if it's a domain-specific term
    if (domainWeights[word]) {
      result.set(word, domainWeights[word]);
      domainSpecificTerms++;
    }
    // Check if it's a general important term
    else if (TERM_WEIGHTS[word]) {
      result.set(word, TERM_WEIGHTS[word]);
      generalImportantTerms++;
    }
    // Otherwise use default weight
    else {
      result.set(word, 1.0);
      defaultTerms++;
    }
  }
  
  // Process keyphrases with higher weights
  let domainPhrases = 0;
  let generalPhrases = 0;
  let defaultPhrases = 0;
  
  for (const phrase of keyphrases) {
    if (domainWeights[phrase]) {
      result.set(phrase, domainWeights[phrase] * 1.2); // Boost phrases in domain
      domainPhrases++;
    } else if (TERM_WEIGHTS[phrase]) {
      result.set(phrase, TERM_WEIGHTS[phrase] * 1.2); // Boost phrases in general terms
      generalPhrases++;
    } else {
      result.set(phrase, 1.2); // Default boost for phrases
      defaultPhrases++;
    }
  }
  
  debugLog('extractImportantWords', `Term weight distribution:`, {
    totalTerms: result.size,
    keywords: {
      domainSpecific: domainSpecificTerms,
      generalImportant: generalImportantTerms,
      default: defaultTerms
    },
    keyphrases: {
      domainSpecific: domainPhrases,
      generalImportant: generalPhrases,
      default: defaultPhrases
    }
  });
  
  // Log some sample terms with their weights
  if (result.size > 0) {
    const sampleTerms: Record<string, number> = {};
    let count = 0;
    for (const [term, weight] of result.entries()) {
      if (count < 15) {
        sampleTerms[term] = weight;
        count++;
      } else {
        break;
      }
    }
    debugLog('extractImportantWords', 'Sample terms with weights:', sampleTerms);
  }
  
  return result;
}

/**
 * Get common keywords between two sets of terms with weights
 * 
 * @param job Job terms with weights
 * @param resume Resume terms with weights
 * @returns Match percentage and common terms
 */
function calculateTermsMatch(job: Map<string, number>, resume: Map<string, number>): {
  score: number;
  common: string[];
} {
  debugLog('calculateTermsMatch', `Calculating match between terms:`, {
    jobTermsCount: job.size,
    resumeTermsCount: resume.size
  });
  
  const common: string[] = [];
  let totalWeight = 0;
  let matchWeight = 0;
  
  // Process job terms
  for (const [term, weight] of job.entries()) {
    totalWeight += weight;
    
    // Check for exact matches
    if (resume.has(term)) {
      common.push(term);
      matchWeight += weight;
    } else {
      // Check for substring matches in phrases
      let foundPartialMatch = false;
      for (const [resumeTerm, resumeWeight] of resume.entries()) {
        // Improved partial matching - check if either contains the other as whole word
        const jobTermWords = term.split(/\s+/);
        const resumeTermWords = resumeTerm.split(/\s+/);
        
        const hasCommonWord = jobTermWords.some(word => 
          word.length > 3 && resumeTermWords.includes(word));
          
        if (resumeTerm.includes(term) || term.includes(resumeTerm) || hasCommonWord) {
          common.push(`${term} ≈ ${resumeTerm}`);
          matchWeight += weight * 0.7; // Partial credit
          foundPartialMatch = true;
          break;
        }
      }
      
      // Try word stem/root matching if no match yet (programming/programmer, develop/developer)
      if (!foundPartialMatch) {
        for (const [resumeTerm, resumeWeight] of resume.entries()) {
          // Simple stemming - check if terms share a common root of at least 5 chars
          if (term.length >= 5 && resumeTerm.length >= 5) {
            const minLength = Math.min(term.length, resumeTerm.length);
            const checkLength = Math.min(minLength, 5);
            
            if (term.substring(0, checkLength) === resumeTerm.substring(0, checkLength)) {
              common.push(`${term} ~ ${resumeTerm}`);
              matchWeight += weight * 0.5; // Lower credit for stem matches
              break;
            }
          }
        }
      }
    }
  }
  
  // Add some weight for resume terms not in job
  let resumeOnlyWeight = 0;
  for (const [term, weight] of resume.entries()) {
    if (!job.has(term)) {
      resumeOnlyWeight += weight * 0.3; // Consider resume-only terms, but with lower weight
      totalWeight += weight * 0.3;
    }
  }
  
  // Adjust raw score to give better baseline
  let score = totalWeight > 0 ? matchWeight / totalWeight : 0;
  
  // Boost score by a small amount to account for semantic similarity not captured
  // This helps prevent universally low scores
  const baselineBoost = 0.07; // 7% baseline boost
  score = Math.min(score + baselineBoost, 1.0);
  
  debugLog('calculateTermsMatch', `Match calculation results:`, {
    totalJobWeight: Array.from(job.values()).reduce((sum, w) => sum + w, 0),
    totalResumeWeight: Array.from(resume.values()).reduce((sum, w) => sum + w, 0),
    matchWeight,
    totalWeight,
    resumeOnlyWeight,
    rawScore: score,
    commonTermsCount: common.length,
    commonTermsSample: common.length > 0 ? common.slice(0, 20) : 'No common terms'
  });
  
  return { score, common };
}

/**
 * Calculates similarity between job description and resume with improved scaling
 * 
 * @param jobText Job description text
 * @param resumeText Resume text
 * @returns Promise with similarity score between 0 and 1
 */
export async function calculateJobResumeMatch(jobText: string, resumeText: string): Promise<number> {
  try {
    debugLog('calculateJobResumeMatch', `Starting job-resume matching:`, {
      jobTextLength: jobText.length,
      resumeTextLength: resumeText.length
    });
    
    // Extract job sections and detect domain
    const jobSections = extractJobSections(jobText);
    const domain = detectJobDomain(jobText);
    
    // Combine all job sections with different weights
    const jobFullText = [
      jobSections.description,
      jobSections.requirements ? jobSections.requirements.repeat(2) : '',  // Double weight for requirements
      jobSections.qualifications,
      jobSections.responsibilities
    ].join(' ');
    
    debugLog('calculateJobResumeMatch', `Combined job text for matching:`, {
      combinedLength: jobFullText.length,
      domain
    });
    
    // Extract important words with domain-specific weighting
    const jobTerms = extractImportantWords(jobFullText, domain);
    const resumeTerms = extractImportantWords(resumeText, domain);
    
    // Calculate match percentage
    const { score: rawScore, common } = calculateTermsMatch(jobTerms, resumeTerms);
    
    debugLog('calculateJobResumeMatch', `Raw match score before scaling: ${rawScore * 100}%`);
    
    // Apply more generous scaling to spread scores across the range
    let scaledScore: number;
    
    // Scaling function designed to give better distribution:
    // - Provides a higher baseline (min 15% instead of near 0%)
    // - More linear scaling in the middle ranges
    // - Still makes 90%+ difficult to achieve
    if (rawScore <= 0.1) {
      // Boost very low scores to minimum 15%
      scaledScore = 15 + (rawScore * 250); // 15-40% range
      debugLog('calculateJobResumeMatch', `Low match scaling: ${rawScore} -> ${scaledScore}`);
    } else if (rawScore <= 0.3) {
      // Medium-low matches to 40-70% range
      scaledScore = 40 + ((rawScore - 0.1) * 150);
      debugLog('calculateJobResumeMatch', `Medium-low match scaling: ${rawScore} -> ${scaledScore}`);
    } else if (rawScore <= 0.5) {
      // Medium-high matches to 70-85% range
      scaledScore = 70 + ((rawScore - 0.3) * 75);
      debugLog('calculateJobResumeMatch', `Medium-high match scaling: ${rawScore} -> ${scaledScore}`);
    } else {
      // Top matches to 85-100% range, making 100% very hard to achieve
      scaledScore = 85 + ((rawScore - 0.5) * 30);
      debugLog('calculateJobResumeMatch', `Top match scaling: ${rawScore} -> ${scaledScore}`);
    }
    
    // Ensure score is between 0 and 100%
    scaledScore = Math.min(Math.max(scaledScore, 15), 100);
    const finalScore = scaledScore / 100;
    
    debugLog('calculateJobResumeMatch', `Final match results:`, {
      rawScore,
      scaledScore,
      finalPercentage: (finalScore * 100).toFixed(2) + '%',
      commonTermsCount: common.length
    });
    
    return finalScore;
  } catch (error) {
    debugLog('calculateJobResumeMatch', `Error calculating match:`, error);
    // Fallback to minimum score
    return 0.15; // Set minimum score to 15% instead of 1%
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
  
  // Color thresholds with better distribution
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
  
  debugLog('formatSimilarityScore', `Formatted score: ${matchScore}%, color: ${color}, isGoodMatch: ${isGoodMatch}`);
  
  return {
    score: `${matchScore}% Match`,
    color,
    isGoodMatch
  };
} 
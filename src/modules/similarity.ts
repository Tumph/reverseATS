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
  'finance': ['finance', 'accounting', 'audit', 'banking', 'financial', 'investment', 'tax', 'budget', 'revenue', 'assets', 'portfolio', 'trading', 'risk', 'equity', 'valuation'],
  'healthcare': ['health', 'medical', 'clinical', 'patient', 'doctor', 'nurse', 'care', 'hospital', 'healthcare', 'therapy', 'wellness', 'treatment', 'rehabilitation', 'diagnostic', 'pharmaceutical'],
  'marketing': ['marketing', 'brand', 'social media', 'seo', 'content', 'advertising', 'market', 'campaign', 'digital marketing', 'communications', 'public relations', 'creative', 'strategy', 'branding', 'engagement'],
  'education': ['education', 'teaching', 'teacher', 'student', 'school', 'university', 'academic', 'professor', 'instructor', 'curriculum', 'learning', 'training', 'development', 'mentoring', 'coaching'],
  'legal': ['legal', 'law', 'attorney', 'lawyer', 'litigation', 'compliance', 'contract', 'paralegal', 'regulation', 'policy', 'governance', 'rights', 'legislation', 'counsel'],
  'engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'design', 'construction', 'manufacturing', 'product', 'industrial', 'systems', 'process', 'quality', 'safety', 'technical'],
  'retail': ['retail', 'sales', 'customer', 'store', 'product', 'inventory', 'merchandising', 'consumer', 'ecommerce', 'operations', 'service', 'business', 'client', 'account'],
  'hr': ['human resources', 'hr', 'recruiting', 'talent', 'hiring', 'employee', 'benefits', 'compensation', 'workforce', 'development', 'training', 'culture', 'engagement', 'diversity'],
  'operations': ['operations', 'logistics', 'supply chain', 'procurement', 'inventory', 'warehouse', 'distribution', 'planning', 'process', 'quality', 'management', 'efficiency'],
  'research': ['research', 'analysis', 'data', 'insights', 'study', 'investigation', 'methodology', 'evaluation', 'assessment', 'findings', 'development'],
  'design': ['design', 'creative', 'user experience', 'visual', 'graphic', 'product', 'interface', 'brand', 'art', 'media', 'content', 'production'],
  'consulting': ['consulting', 'strategy', 'advisory', 'business', 'solutions', 'client', 'stakeholder', 'management', 'transformation', 'innovation']
};

/**
 * Domain-specific term weights
 */
const DOMAIN_WEIGHTS: Record<string, Record<string, number>> = {
  'technology': {
    // Software Development (High-level languages) - Highest weights for most commonly used
    'python': 3.0, 'javascript': 3.0, 'typescript': 3.0, 'java': 3.0, 'c#': 3.0,
    'c++': 3.0, 'c': 3.0, 'go': 3.0, 'golang': 3.0, 'ruby': 3.0,
    'php': 3.0, 'swift': 3.0, 'kotlin': 3.0, 'rust': 3.0, 'r': 3.0,
    'sql': 3.0, 'dart': 3.0, 'scala': 3.0, 'lua': 3.0, 'shell': 3.0,
    'bash': 3.0, 'powershell': 3.0, 'matlab': 3.0,
    
    // Hardware/Low-level Development
    'vhdl': 3.0, 'verilog': 3.0, 'cuda': 3.0, 'opencl': 3.0,
    'assembly': 3.0, 'asm': 3.0, 'systemverilog': 3.0, 'ada': 3.0,
    'fortran': 3.0, 'objective-c': 3.0, 'zig': 3.0,
    
    // Special Purpose Languages
    'webassembly': 3.0, 'wasm': 3.0, 'f#': 3.0, 'fsharp': 3.0,
    'risc-v': 3.0, 'riscv': 3.0,
    
    // Frameworks and Technologies - High weights for popular frameworks
    'react': 2.8, 'node': 2.8, 'angular': 2.8, 'vue': 2.8,
    'django': 2.8, 'flask': 2.8, 'spring': 2.8, 'rails': 2.8,
    'unity': 2.8, 'flutter': 2.8, '.net': 2.8, 'dotnet': 2.8,
    'laravel': 2.8, 'express': 2.8, 'next.js': 2.8, 'nuxt': 2.8,
    
    // Web Technologies
    'html': 2.8, 'css': 2.8, 'sass': 2.8, 'less': 2.8,
    'graphql': 2.8, 'rest': 2.8, 'websocket': 2.8,
    
    // Cloud and Infrastructure
    'aws': 2.8, 'azure': 2.8, 'gcp': 2.8, 'docker': 2.8,
    'kubernetes': 2.8, 'terraform': 2.8, 'jenkins': 2.8,
    'gitlab': 2.8, 'github': 2.8, 'bitbucket': 2.8,
    
    // Databases
    'mysql': 2.8, 'postgresql': 2.8, 'mongodb': 2.8, 'redis': 2.8,
    'elasticsearch': 2.8, 'cassandra': 2.8, 'oracle': 2.8,
    'database': 2.8, 'nosql': 2.8, 'sql server': 2.8,
    
    // Development Concepts and Tools
    'api': 2.8, 'web': 2.8, 'mobile': 2.8, 'cloud': 2.8,
    'frontend': 2.8, 'backend': 2.8, 'fullstack': 2.8,
    'devops': 2.8, 'ci/cd': 2.8, 'microservices': 2.8,
    'architecture': 2.8, 'design patterns': 2.8,
    
    // Version Control and Development Tools
    'git': 2.5, 'svn': 2.5, 'mercurial': 2.5,
    'vscode': 2.5, 'intellij': 2.5, 'eclipse': 2.5,
    
    // Development Practices
    'agile': 2.0, 'scrum': 2.0, 'kanban': 2.0,
    'tdd': 2.0, 'bdd': 2.0, 'testing': 2.0,
    'code review': 2.0, 'pair programming': 2.0,
    
    // Software Engineering Concepts
    'algorithm': 2.0, 'data structure': 2.0, 'software': 2.0,
    'object oriented': 2.0, 'functional programming': 2.0,
    'concurrent': 2.0, 'parallel': 2.0, 'distributed': 2.0
  },
  'finance': {
    // Financial tools and skills with high weights
    'bloomberg': 3.0, 'factset': 3.0, 'capital iq': 3.0, 'excel': 3.0,
    'financial modeling': 3.0, 'valuation': 3.0, 'deal management': 3.0,
    'accounting': 2.8, 'finance': 2.8, 'audit': 2.8, 'financial': 2.8,
    'investment': 2.5, 'banking': 2.5, 'budget': 2.5, 'revenue': 2.5,
    'analysis': 2.3, 'forecast': 2.3, 'portfolio': 2.3, 'compliance': 2.3
  },
  'healthcare': {
    'nurse': 2.8, 'doctor': 2.8, 'patient': 2.8, 'hospital': 2.8, 'healthcare': 2.8,
    'therapy': 2.5, 'pharmacy': 2.5, 'nursing': 2.5, 'medical': 2.5,
    'surgery': 2.3, 'diagnosis': 2.3, 'treatment': 2.3, 'medicine': 2.3,
    'clinical': 2.5, 'care': 2.5, 'health': 2.5, 'wellness': 2.3,
    'rehabilitation': 2.3, 'diagnostic': 2.3, 'pharmaceutical': 2.3
  },
  'marketing': {
    // Marketing tools and platforms with high weights
    'hubspot': 3.0, 'salesforce': 3.0, 'marketo': 3.0, 'mailchimp': 3.0,
    'google analytics': 3.0, 'google ads': 3.0, 'facebook ads': 3.0,
    'social media management': 2.8, 'content management': 2.8, 'seo': 2.8,
    'marketing automation': 2.8, 'email marketing': 2.8, 'crm': 2.8,
    'marketing': 2.5, 'brand': 2.5, 'social media': 2.5, 'content': 2.5,
    'campaign': 2.3, 'digital marketing': 2.3, 'communications': 2.3,
    'creative': 2.0, 'strategy': 2.0, 'branding': 2.0, 'engagement': 2.0
  },
  'education': {
    'teaching': 2.8, 'education': 2.8, 'student': 2.8, 'learning': 2.8, 'curriculum': 2.8,
    'instructor': 2.5, 'professor': 2.5, 'academic': 2.5, 'school': 2.5,
    'training': 2.3, 'development': 2.3, 'mentoring': 2.3, 'coaching': 2.3,
    'assessment': 2.3, 'instruction': 2.3, 'classroom': 2.3, 'pedagogy': 2.5
  },
  'operations': {
    // Operations tools and skills with high weights
    'sap': 3.0, 'oracle': 3.0, 'quickbooks': 3.0, 'netsuite': 3.0,
    'jira': 3.0, 'trello': 3.0, 'asana': 3.0, 'monday': 3.0,
    'project management': 2.8, 'process automation': 2.8, 'six sigma': 2.8,
    'operations': 2.5, 'logistics': 2.5, 'supply chain': 2.5, 'procurement': 2.5,
    'inventory': 2.3, 'warehouse': 2.3, 'distribution': 2.3, 'planning': 2.3
  },
  'research': {
    'research': 2.8, 'analysis': 2.8, 'study': 2.8, 'methodology': 2.8,
    'data': 2.5, 'insights': 2.5, 'evaluation': 2.5, 'assessment': 2.5,
    'investigation': 2.3, 'findings': 2.3, 'development': 2.3,
    'analytical': 2.3, 'quantitative': 2.3, 'qualitative': 2.3
  },
  'design': {
    // Design tools and skills with high weights
    'adobe creative suite': 3.0, 'photoshop': 3.0, 'illustrator': 3.0,
    'indesign': 3.0, 'figma': 3.0, 'sketch': 3.0, 'xd': 3.0,
    'ui design': 2.8, 'ux design': 2.8, 'graphic design': 2.8,
    'visual design': 2.8, 'web design': 2.8, 'typography': 2.8,
    'design': 2.5, 'creative': 2.5, 'user experience': 2.5, 'visual': 2.5,
    'art': 2.3, 'media': 2.3, 'content': 2.3, 'production': 2.3
  },
  'consulting': {
    'consulting': 2.8, 'strategy': 2.8, 'advisory': 2.8, 'solutions': 2.8,
    'client': 2.5, 'stakeholder': 2.5, 'management': 2.5, 'transformation': 2.5,
    'innovation': 2.3, 'business': 2.3, 'analysis': 2.3, 'recommendation': 2.3,
    'framework': 2.3, 'methodology': 2.3, 'implementation': 2.3
  }
};

/**
 * Important terms that apply across all job domains and their weights
 */
export const TERM_WEIGHTS: Record<string, number> = {
  // Skills and tools (highest weights)
  'automation': 3.0, 'system integration': 3.0, 'data analysis': 3.0,
  'project management': 3.0, 'business intelligence': 3.0,
  'reporting': 3.0, 'dashboard': 3.0, 'analytics': 3.0, 'visualization': 3.0,
  'process improvement': 3.0,
  
  // Generic professional skills (high weights)
  'management': 2.8, 'leadership': 2.8, 'communication': 2.8, 
  'problem solving': 2.8, 'teamwork': 2.8, 'analytical': 2.8,
  'organization': 2.5, 'planning': 2.5, 'time management': 2.5,
  'strategic': 2.5, 'innovative': 2.5,
  
  // Soft skills and interpersonal abilities
  'interpersonal': 2.3, 'relationship building': 2.3, 'negotiation': 2.3,
  'conflict resolution': 2.3, 'mentoring': 2.3, 'coaching': 2.3,
  'facilitation': 2.0, 'public speaking': 2.0, 'written communication': 2.0,
  'verbal communication': 2.0, 'customer service': 2.0, 'client relations': 2.0,
  
  // Business and professional skills
  'strategy': 2.3, 'business development': 2.3, 'stakeholder management': 2.3,
  'change management': 2.3, 'risk management': 2.3,
  'decision making': 2.0, 'problem analysis': 2.0, 'critical thinking': 2.0,
  
  // Experience levels
  'senior': 1.8, 'lead': 1.8, 'manager': 1.8, 'director': 1.8,
  'junior': 1.5, 'entry level': 1.5, 'intern': 1.5, 'associate': 1.5,
  'experienced': 1.5, 'professional': 1.5, 'specialist': 1.5,
  
  // Education
  'bachelor': 1.3, 'master': 1.3, 'phd': 1.3, 'degree': 1.3,
  'certification': 1.3, 'license': 1.3, 'graduate': 1.3,
  
  // Common software & tools (base weights for general tools)
  'microsoft': 1.5, 'office': 1.5, 'powerpoint': 1.5, 'outlook': 1.5
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
    // - Provides a higher baseline (min 20% instead of 15%)
    // - More generous scaling in the middle ranges for non-technical matches
    // - Still makes 95%+ difficult to achieve
    if (rawScore <= 0.1) {
      // Boost very low scores to minimum 20%
      scaledScore = 20 + (rawScore * 300); // 20-50% range
      debugLog('calculateJobResumeMatch', `Low match scaling: ${rawScore} -> ${scaledScore}`);
    } else if (rawScore <= 0.3) {
      // Medium-low matches to 50-75% range
      scaledScore = 50 + ((rawScore - 0.1) * 125);
      debugLog('calculateJobResumeMatch', `Medium-low match scaling: ${rawScore} -> ${scaledScore}`);
    } else if (rawScore <= 0.5) {
      // Medium-high matches to 75-90% range
      scaledScore = 75 + ((rawScore - 0.3) * 75);
      debugLog('calculateJobResumeMatch', `Medium-high match scaling: ${rawScore} -> ${scaledScore}`);
    } else {
      // Top matches to 90-100% range, making 100% very hard to achieve
      scaledScore = 90 + ((rawScore - 0.5) * 20);
      debugLog('calculateJobResumeMatch', `Top match scaling: ${rawScore} -> ${scaledScore}`);
    }
    
    // Ensure score is between 0 and 100%
    scaledScore = Math.min(Math.max(scaledScore, 20), 100);
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
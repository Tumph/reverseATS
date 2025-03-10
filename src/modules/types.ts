// Define shared types for the extension

// Observer configuration type
export interface ObserverConfig {
  childList: boolean;
  subtree: boolean;
  attributes: boolean;
  characterData: boolean;
}

// Table processing result type
export interface TableProcessingResult {
  trCount: number;
  jobIds: string[];
}

// Job details type
export interface JobDetails {
  jobId: string;
  jobTitle: string | null;
  jobCategory: string | null;
  specialRequirements: string | null;
  jobSummary: string | null;
  jobResponsibilities: string | null;
  requiredSkills: string | null;
  organization: string | null;
  division: string | null;
  location: string | null;
  city: string | null;
  openings: string | null;
  status: string | null;
  level: string | null;
  deadline: string | null;
  term: string | null;
  scrapedAt: string;
}

// Extended table processing result with job details
export interface ExtendedTableProcessingResult extends TableProcessingResult {
  jobDetails: JobDetails[];
} 
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
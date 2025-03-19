// Define shared types for the extension

// Observer configuration type
export interface ObserverConfig {
  childList: boolean;
  subtree: boolean;
  attributes: boolean;
  characterData: boolean;
}


// Job overview type with raw HTML
export interface JobOverview {
  jobId: string;
  overview: Record<string, string>;
  rawHtml?: string;
}


import { extractTextFromPdf, extractPdfMetadata } from './modules/pdf-reader';
import { preprocessText, calculateJobResumeMatch } from './modules/similarity';

// DOM Elements
const resumeFileInput = document.getElementById('resumeFile') as HTMLInputElement;
const resumeTextArea = document.getElementById('resumeText') as HTMLTextAreaElement;
const saveButton = document.getElementById('saveBtn') as HTMLButtonElement;
const clearButton = document.getElementById('clearBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;
const fileInfoDiv = document.getElementById('fileInfo') as HTMLDivElement;
const resumeStatusElement = document.getElementById('resumeStatus') as HTMLDivElement;

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check if resume text is already stored and display it
  chrome.storage.local.get(['resumeText', 'resumeMetadata'], (result) => {
    if (result.resumeText) {
      resumeTextArea.value = result.resumeText;
      saveButton.disabled = false;
      
      // Display metadata if available
      if (result.resumeMetadata) {
        displayFileInfo(result.resumeMetadata);
      }
      
      showStatus('Resume loaded from storage', 'info');
      
      // Update resume status
      if (resumeStatusElement) {
        resumeStatusElement.textContent = 'Resume loaded and ready for matching';
        resumeStatusElement.className = 'success';
        resumeStatusElement.style.display = 'block';
      }
    } else {
      // No resume found, show warning
      if (resumeStatusElement) {
        resumeStatusElement.textContent = 'Please upload your resume to enable job matching';
        resumeStatusElement.className = 'warning';
        resumeStatusElement.style.display = 'block';
      }
    }
  });

  // Listen for file upload
  resumeFileInput.addEventListener('change', handleFileUpload);

  // Listen for text changes
  resumeTextArea.addEventListener('input', () => {
    saveButton.disabled = resumeTextArea.value.trim().length === 0;
  });

  // Clear button
  clearButton.addEventListener('click', () => {
    resumeFileInput.value = '';
    resumeTextArea.value = '';
    saveButton.disabled = true;
    
    if (fileInfoDiv) {
      fileInfoDiv.innerHTML = '';
      fileInfoDiv.style.display = 'none';
    }
    
    chrome.storage.local.remove(['resumeText', 'resumeMetadata', 'processedResumeText']);
    showStatus('Resume cleared', 'info');
    
    // Update resume status
    if (resumeStatusElement) {
      resumeStatusElement.textContent = 'Please upload your resume to enable job matching';
      resumeStatusElement.className = 'warning';
      resumeStatusElement.style.display = 'block';
    }
  });

  // Save button
  saveButton.addEventListener('click', saveResume);
});

/**
 * Display file information
 */
function displayFileInfo(metadata: Record<string, any>) {
  if (!fileInfoDiv) return;
  
  fileInfoDiv.innerHTML = '';
  fileInfoDiv.style.display = 'block';
  
  const titleElement = document.createElement('div');
  titleElement.className = 'file-info-item';
  titleElement.innerHTML = `<strong>Title:</strong> ${metadata.title || 'Not available'}`;
  fileInfoDiv.appendChild(titleElement);
  
  const pageCountElement = document.createElement('div');
  pageCountElement.className = 'file-info-item';
  pageCountElement.innerHTML = `<strong>Pages:</strong> ${metadata.pageCount || 'Unknown'}`;
  fileInfoDiv.appendChild(pageCountElement);
  
  if (metadata.author) {
    const authorElement = document.createElement('div');
    authorElement.className = 'file-info-item';
    authorElement.innerHTML = `<strong>Author:</strong> ${metadata.author}`;
    fileInfoDiv.appendChild(authorElement);
  }
}

/**
 * Handle file upload and extract text from PDF
 */
async function handleFileUpload(event: Event) {
  const fileInput = event.target as HTMLInputElement;
  
  if (fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    
    if (file.type !== 'application/pdf') {
      showStatus('Please upload a PDF file', 'error');
      return;
    }
    
    try {
      showStatus('Processing PDF...', 'info');
      
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Extract text from PDF
      const extractedText = await extractTextFromPdf(arrayBuffer);
      
      // Extract metadata
      const metadata = await extractPdfMetadata(arrayBuffer);
      
      // Display file information
      displayFileInfo(metadata);
      
      // Display extracted text
      resumeTextArea.value = extractedText;
      saveButton.disabled = false;
      
      showStatus('Resume text extracted successfully', 'success');
    } catch (error) {
      showStatus(`Error processing PDF: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  }
}

/**
 * Save resume text to Chrome storage
 */
function saveResume() {
  const resumeText = resumeTextArea.value.trim();
  
  if (resumeText.length === 0) {
    showStatus('Please upload a resume or enter text', 'error');
    return;
  }
  
  // Get metadata if available
  const fileInfoContent = fileInfoDiv?.innerHTML || '';
  const resumeMetadata = fileInfoContent ? { html: fileInfoContent } : null;
  
  // Process the resume text for matching
  const processedDoc = preprocessText(resumeText);
  const processedText = processedDoc.text();
  
  chrome.storage.local.set({ 
    resumeText,
    resumeMetadata,
    processedResumeText: processedText // Store processed version for matching
  }, () => {
    // Check if we have any stored job overviews to preview matches
    chrome.storage.local.get(['jobOverviews'], async (result) => {
      if (result.jobOverviews && Array.isArray(result.jobOverviews) && result.jobOverviews.length > 0) {
        showStatus('Analyzing job matches...', 'info');
        
        try {
          // Calculate match scores in parallel
          const scorePromises = result.jobOverviews.map(async (job) => {
            // Use the simplified overview text directly
            const jobText = job.overview['overview'] || '';
            // Calculate similarity between resume and job text
            const similarity = await calculateJobResumeMatch(jobText, resumeText);
            return Math.round(similarity * 100);
          });
          
          // Wait for all calculations to complete
          const scores = await Promise.all(scorePromises);
          
          const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          const highMatches = scores.filter(score => score >= 70).length;
          
          showStatus(
            `Resume saved! Average match: ${avgScore}% (${highMatches} strong matches found)`, 
            'success'
          );
        } catch (error) {
          showStatus('Resume saved, but error calculating matches', 'error');
        }
      } else {
        showStatus('Resume saved successfully! Visit job listings to see matches.', 'success');
      }
    });
  });
}

/**
 * Display status message
 */
function showStatus(message: string, type: 'success' | 'error' | 'info') {
  statusDiv.textContent = message;
  statusDiv.className = type;
  statusDiv.style.display = 'block';
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
} 
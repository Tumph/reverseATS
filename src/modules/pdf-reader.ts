/**
 * PDF Reader module
 * Bundles PDF.js functionality for use in the extension
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

/**
 * Extracts text from a PDF file
 * @param arrayBuffer - PDF file as ArrayBuffer
 * @returns Promise resolving to the extracted text
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Clone the ArrayBuffer to prevent detachment issues
    const bufferClone = arrayBuffer.slice(0);
    
    // Load the PDF file
    const loadingTask = pdfjsLib.getDocument({ data: bufferClone });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    // Clean up the text
    const cleanedText = fullText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    
    return cleanedText;
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extracts metadata from a PDF file
 * @param arrayBuffer - PDF file as ArrayBuffer
 * @returns Promise resolving to PDF metadata
 */
export async function extractPdfMetadata(arrayBuffer: ArrayBuffer): Promise<Record<string, any>> {
  try {
    // Clone the ArrayBuffer to prevent detachment issues
    const bufferClone = arrayBuffer.slice(0);
    
    // Load the PDF file
    const loadingTask = pdfjsLib.getDocument({ data: bufferClone });
    const pdf = await loadingTask.promise;
    
    // Get metadata
    const metadata = await pdf.getMetadata();
    const info = metadata.info as Record<string, any> || {};
    
    return {
      title: info.Title || '',
      author: info.Author || '',
      subject: info.Subject || '',
      keywords: info.Keywords || '',
      creator: info.Creator || '',
      producer: info.Producer || '',
      creationDate: info.CreationDate || '',
      modificationDate: info.ModDate || '',
      pageCount: pdf.numPages
    };
  } catch (error) {
    return {};
  }
}

/**
 * Gets the number of pages in a PDF file
 * @param arrayBuffer - PDF file as ArrayBuffer
 * @returns Promise resolving to page count
 */
export async function getPdfPageCount(arrayBuffer: ArrayBuffer): Promise<number> {
  try {
    // Clone the ArrayBuffer to prevent detachment issues
    const bufferClone = arrayBuffer.slice(0);
    
    // Load the PDF file
    const loadingTask = pdfjsLib.getDocument({ data: bufferClone });
    const pdf = await loadingTask.promise;
    
    return pdf.numPages;
  } catch (error) {
    return 0;
  }
} 
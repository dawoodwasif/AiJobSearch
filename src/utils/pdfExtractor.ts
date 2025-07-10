import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractedText {
  text: string;
  pageCount: number;
  metadata?: any;
}

export async function extractTextFromPDF(file: File): Promise<ExtractedText> {
  try {
    console.log('Starting PDF text extraction for file:', file.name);
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });
    
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    let fullText = '';
    const pageCount = pdf.numPages;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${pageCount}`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items with proper spacing
        const pageText = textContent.items
          .map((item: any) => {
            if ('str' in item) {
              return item.str;
            }
            return '';
          })
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (pageText) {
          fullText += pageText + '\n\n';
          console.log(`Page ${pageNum} extracted ${pageText.length} characters`);
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }
    
    // Clean up the extracted text
    const cleanedText = fullText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    console.log('Text extraction completed. Total characters:', cleanedText.length);
    
    if (!cleanedText || cleanedText.length < 10) {
      throw new Error('No meaningful text could be extracted from the PDF. The file might be image-based or corrupted.');
    }
    
    return {
      text: cleanedText,
      pageCount,
      metadata: {
        title: file.name,
        size: file.size,
        type: file.type,
      }
    };
    
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    
    // Try alternative extraction method using FileReader
    try {
      console.log('Attempting alternative extraction method...');
      return await extractTextAlternative(file);
    } catch (altError) {
      console.error('Alternative extraction also failed:', altError);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Alternative extraction method
async function extractTextAlternative(file: File): Promise<ExtractedText> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Try with different PDF.js configuration
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          verbosity: 0, // Reduce logging
          disableFontFace: true,
          disableRange: true,
          disableStream: true,
        });
        
        const pdf = await loadingTask.promise;
        let text = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str || '');
          text += strings.join(' ') + '\n';
        }
        
        const cleanedText = text.trim();
        
        if (!cleanedText) {
          reject(new Error('No text content found in PDF'));
          return;
        }
        
        resolve({
          text: cleanedText,
          pageCount: pdf.numPages,
          metadata: {
            title: file.name,
            size: file.size,
            type: file.type,
          }
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// Utility function to validate extracted text
export function validateExtractedText(text: string): boolean {
  if (!text || text.length < 10) {
    return false;
  }
  
  // Check if text contains common resume keywords
  const resumeKeywords = [
    'experience', 'education', 'skills', 'work', 'job', 'position',
    'company', 'university', 'degree', 'email', 'phone', 'address'
  ];
  
  const lowerText = text.toLowerCase();
  const foundKeywords = resumeKeywords.filter(keyword => lowerText.includes(keyword));
  
  return foundKeywords.length >= 2; // At least 2 resume-related keywords
}
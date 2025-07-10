import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import * as mammoth from "mammoth";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function extractTextFromPDF(file) {
  try {
    // Use PDF.js to extract text
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => item.str)
          .join(" ");
        text += pageText + "\n";
      }

      return text;
    } catch (pdfJsError) {
      console.warn("PDF.js extraction failed, trying FileReader fallback:", pdfJsError);
      
      // Try FileReader as a fallback
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
          try {
            const text = event.target.result;
            if (typeof text === 'string' && text.trim().length > 0) {
              resolve(text);
            } else {
              throw new Error("Empty text extracted");
            }
          } catch (readerError) {
            reject(new Error("Failed to extract text using FileReader: " + readerError.message));
          }
        };
        reader.onerror = function() {
          reject(new Error("FileReader error occurred"));
        };
        reader.readAsText(file);
      });
    }
  } catch (error) {
    console.error("All PDF extraction methods failed:", error);
    throw new Error("Failed to extract text from PDF: All extraction methods failed - PDF may be image-based or corrupted");
  }
}

async function extractWithPDFJS(file) {
  try {
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF.js extraction failed:', error);
    throw error;
  }
}

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Extracts text from a PDF file using PDF.js
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractTextWithPDFJS(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const maxPages = pdf.numPages;
      let text = "";

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(" ");
        text += pageText + "\n";
      }

      resolve(text.trim());
    } catch (error) {
      reject(new Error(`PDF.js extraction failed: ${error.message}`));
    }
  });
}

/**
 * Extracts text from a PDF file using pdf-parse library
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractTextWithPDFParse(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const result = await pdfParse(data);
      resolve(result.text.trim());
    } catch (error) {
      reject(new Error(`pdf-parse extraction failed: ${error.message}`));
    }
  });
}

/**
 * Extracts text from a DOCX file using mammoth
 * @param file The DOCX file to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      resolve(result.value.trim());
    } catch (error) {
      reject(new Error(`DOCX extraction failed: ${error.message}`));
    }
  });
}

/**
 * Extracts text from a plain text file
 * @param file The text file to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractTextFromTXT(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const text = await file.text();
      resolve(text.trim());
    } catch (error) {
      reject(new Error(`Text file reading failed: ${error.message}`));
    }
  });
}

/**
 * Fallback method to extract text using FileReader
 * @param file The file to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractTextWithFileReader(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result === 'string') {
          resolve(reader.result.trim());
        } else {
          reject(new Error('FileReader did not return a string'));
        }
      } catch (error) {
        reject(new Error(`FileReader extraction failed: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsText(file);
  });
}

/**
 * Main function to extract text from a file with multiple fallback methods
 * @param file The file to extract text from
 * @returns A promise that resolves to the extracted text
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  try {
    // Handle different file types
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        // Try PDF.js first
        return await extractTextWithPDFJS(file);
      } catch (error) {
        console.warn("PDF.js extraction failed, trying pdf-parse:", error);
        try {
          // Try pdf-parse as fallback
          return await extractTextWithPDFParse(file);
        } catch (error2) {
          console.warn("pdf-parse extraction failed:", error2);
          // Last resort: try FileReader
          return await extractTextWithFileReader(file);
        }
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileName.endsWith('.docx')) {
      return await extractTextFromDOCX(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await extractTextFromTXT(file);
    } else {
      // Try generic text extraction for unknown file types
      return await extractTextWithFileReader(file);
    }
  } catch (error) {
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

/**
 * Checks if the extracted text is valid (not empty or too short)
 * @param text The extracted text
 * @returns True if the text is valid, false otherwise
 */
export function isValidExtractedText(text: string): boolean {
  // Text should be at least 50 characters to be considered valid
  return text && text.length > 50;
}
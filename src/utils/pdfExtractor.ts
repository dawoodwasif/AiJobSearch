import * as pdfjsLib from "pdfjs-dist";

// Set up the worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF text extraction...');
    
    // Method 1: Try pdfjs-dist
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      if (fullText.trim()) {
        console.log('Successfully extracted text using pdfjs-dist');
        return fullText.trim();
      }
    } catch (error) {
      console.warn('pdfjs-dist extraction failed:', error);
    }

    // Method 2: Try pdf-parse as fallback
    try {
      const pdfParse = await import('pdf-parse');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const data = await pdfParse.default(buffer);
      
      if (data.text && data.text.trim()) {
        console.log('Successfully extracted text using pdf-parse');
        return data.text.trim();
      }
    } catch (error) {
      console.warn('pdf-parse extraction failed:', error);
    }

    // Method 3: Try reading as text (for text-based PDFs)
    try {
      const text = await file.text();
      if (text && text.trim() && !text.includes('%PDF')) {
        console.log('Successfully extracted text as plain text');
        return text.trim();
      }
    } catch (error) {
      console.warn('Plain text extraction failed:', error);
    }

    // Method 4: Try FileReader approach
    try {
      const fileReader = new FileReader();
      const textContent = await new Promise<string>((resolve, reject) => {
        fileReader.onload = (event) => {
          const text = event.target?.result as string;
          resolve(text || '');
        };
        fileReader.onerror = () => reject(new Error('FileReader failed'));
        fileReader.readAsText(file);
      });

      if (textContent && textContent.trim() && !textContent.includes('%PDF')) {
        console.log('Successfully extracted text using FileReader');
        return textContent.trim();
      }
    } catch (error) {
      console.warn('FileReader extraction failed:', error);
    }

    throw new Error('All extraction methods failed - PDF may be image-based or corrupted');
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Alternative extraction function for different file types
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    // Handle PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    }

    // Handle Word documents
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        fileName.endsWith('.docx')) {
      try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        
        if (result.value && result.value.trim()) {
          console.log('Successfully extracted text from Word document');
          return result.value.trim();
        }
      } catch (error) {
        console.warn('Word document extraction failed:', error);
      }
    }

    // Handle plain text files
    if (fileType.startsWith('text/') || fileName.endsWith('.txt')) {
      const text = await file.text();
      if (text && text.trim()) {
        console.log('Successfully extracted plain text');
        return text.trim();
      }
    }

    // Fallback: try to read as text
    const text = await file.text();
    if (text && text.trim()) {
      console.log('Successfully extracted text using fallback method');
      return text.trim();
    }

    throw new Error(`Unsupported file type: ${fileType}`);
    
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
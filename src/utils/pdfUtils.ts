import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - try multiple approaches
const setupWorker = () => {
    try {
        // Method 1: Try using jsdelivr CDN (most reliable)
        const version = pdfjsLib.version || '4.0.269';
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.js`;
        console.log('PDF.js worker set using jsdelivr CDN');
        return true;
    } catch (error) {
        console.warn('Failed to set jsdelivr worker:', error);

        try {
            // Method 2: Try unpkg CDN
            const version = pdfjsLib.version || '4.0.269';
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;
            console.log('PDF.js worker set using unpkg CDN');
            return true;
        } catch (unpkgError) {
            console.warn('Failed to set unpkg worker:', unpkgError);

            try {
                // Method 3: Try cdnjs
                const version = pdfjsLib.version || '4.0.269';
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
                console.log('PDF.js worker set using cdnjs');
                return true;
            } catch (cdnjsError) {
                console.warn('Failed to set cdnjs worker:', cdnjsError);

                try {
                    // Method 4: Use a more direct approach without worker
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'data:application/javascript;base64,';
                    console.log('PDF.js worker disabled (no-worker mode)');
                    return true;
                } catch (fallbackError) {
                    console.error('All worker setup methods failed:', fallbackError);
                    return false;
                }
            }
        }
    }
};

// Initialize the worker on module load
let workerSetup = setupWorker();

export interface PDFExtractionResult {
    text: string;
    pages: number;
    metadata?: any;
    error?: string;
}

export const extractTextFromPDF = async (file: File): Promise<PDFExtractionResult> => {
    try {
        console.log('Starting PDF text extraction with pdfjs-dist...');
        console.log('File info:', { name: file.name, type: file.type, size: file.size });
        console.log('PDF.js version:', pdfjsLib.version);
        console.log('Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);

        // Retry worker setup if it failed initially
        if (!workerSetup) {
            console.warn('Worker setup failed initially, retrying...');
            workerSetup = setupWorker();
            if (!workerSetup) {
                console.error('Worker setup failed, but continuing with fallback...');
            }
        }

        // Convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);

        // Verify it's actually a PDF
        const firstBytes = new Uint8Array(arrayBuffer.slice(0, 5));
        const pdfHeader = String.fromCharCode(...firstBytes);
        if (!pdfHeader.startsWith('%PDF')) {
            console.warn('File does not appear to be a valid PDF, trying text extraction...');
            return await extractTextWithFileReader(file);
        }

        // Load the PDF document with simplified options
        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            verbosity: 0,
            // Simplified options for better compatibility
            disableFontFace: true,
            disableRange: true,
            disableStream: true,
            useSystemFonts: false,
            standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/web/`
        });

        console.log('Loading PDF document...');
        const pdf = await loadingTask.promise;
        console.log('PDF loaded successfully:', {
            numPages: pdf.numPages,
            fingerprints: pdf.fingerprints
        });

        let fullText = '';
        const totalPages = pdf.numPages;

        // Extract text from each page with timeout
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            try {
                console.log(`Processing page ${pageNum}/${totalPages}`);

                // Add timeout for page loading
                const pagePromise = pdf.getPage(pageNum);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Page load timeout')), 10000)
                );

                const page = await Promise.race([pagePromise, timeoutPromise]) as any;
                console.log(`Page ${pageNum} loaded`);

                // Add timeout for text extraction
                const textPromise = page.getTextContent();
                const textTimeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Text extraction timeout')), 10000)
                );

                const textContent = await Promise.race([textPromise, textTimeoutPromise]) as any;
                console.log(`Text content extracted from page ${pageNum}, items:`, textContent.items.length);

                // Extract text with better spacing and line breaks
                let pageText = '';
                for (let i = 0; i < textContent.items.length; i++) {
                    const item = textContent.items[i];
                    let text = '';

                    if (typeof item === 'string') {
                        text = item;
                    } else if (item && typeof item.str === 'string') {
                        text = item.str;
                    } else if (item && item.str !== undefined) {
                        text = String(item.str);
                    }

                    if (text.trim()) {
                        // Add spacing based on position if available
                        if (i > 0 && item.transform && textContent.items[i - 1].transform) {
                            const prevItem = textContent.items[i - 1];
                            const yDiff = Math.abs(item.transform[5] - prevItem.transform[5]);
                            const xDiff = item.transform[4] - (prevItem.transform[4] + prevItem.width);

                            // Add line break if significant vertical difference
                            if (yDiff > 5) {
                                pageText += '\n';
                            }
                            // Add space if horizontal gap
                            else if (xDiff > 2) {
                                pageText += ' ';
                            }
                        }

                        pageText += text;
                    }
                }

                if (pageText.trim()) {
                    fullText += pageText + '\n\n';
                    console.log(`Page ${pageNum} text length:`, pageText.length);
                } else {
                    console.warn(`No text found on page ${pageNum}`);
                }

                // Clean up page resources
                if (page.cleanup) {
                    page.cleanup();
                }

            } catch (pageError) {
                console.error(`Error processing page ${pageNum}:`, pageError);
                // Don't add error text to fullText, just log and continue
                continue;
            }
        }

        // Get metadata
        let metadata = null;
        try {
            const metadataResult = await pdf.getMetadata();
            metadata = metadataResult?.info || null;
            console.log('PDF metadata extracted:', metadata);
        } catch (metaError) {
            console.warn('Could not extract PDF metadata:', metaError);
        }

        // Clean up PDF resources
        if (pdf.destroy) {
            await pdf.destroy();
        }

        const finalText = fullText.trim();
        const result = {
            text: finalText,
            pages: totalPages,
            metadata
        };

        console.log('PDF text extraction completed:', {
            textLength: result.text.length,
            pages: result.pages,
            wordsExtracted: result.text ? result.text.split(/\s+/).filter(w => w.length > 0).length : 0,
            hasMetadata: !!result.metadata
        });

        // Check if we actually extracted meaningful text
        if (finalText.length < 10) {
            console.warn('Very little text extracted, this might be a scanned PDF');
            return {
                text: finalText,
                pages: totalPages,
                metadata,
                error: 'Very little text was extracted. This might be a scanned PDF or image-based PDF. Please try uploading a text-based PDF or use manual text input.'
            };
        }

        return result;

    } catch (error) {
        console.error('PDF text extraction failed:', error);

        // Enhanced error handling
        let errorMessage = 'Unknown error occurred during PDF processing';

        if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            console.log('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack?.substring(0, 200)
            });

            if (msg.includes('invalid pdf') || msg.includes('corrupted') || msg.includes('malformed')) {
                errorMessage = 'The PDF file appears to be corrupted or invalid. Please try a different PDF file.';
            } else if (msg.includes('password') || msg.includes('encrypted')) {
                errorMessage = 'This PDF is password protected. Please use an unprotected PDF file.';
            } else if (msg.includes('worker') || msg.includes('script')) {
                errorMessage = 'PDF processing worker failed. Trying alternative method...';
                // Try without worker
                try {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
                    return await extractTextFromPDF(file);
                } catch (retryError) {
                    errorMessage = 'PDF processing failed completely. Please use manual text input.';
                }
            } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('load')) {
                errorMessage = 'Network error while loading PDF processing resources. Please check your internet connection.';
            } else if (msg.includes('timeout')) {
                errorMessage = 'PDF processing timed out. The file might be too complex. Please try a simpler PDF or use manual text input.';
            } else if (msg.includes('memory') || msg.includes('size')) {
                errorMessage = 'The PDF file is too large or complex to process. Please try a smaller file.';
            } else {
                errorMessage = `PDF processing error: ${error.message}`;
            }
        }

        // Try fallback method before giving up
        console.log('Trying fallback text extraction method...');
        try {
            const fallbackResult = await extractTextWithFileReader(file);
            if (fallbackResult.text && fallbackResult.text.length > 0) {
                console.log('Fallback extraction succeeded');
                return fallbackResult;
            }
        } catch (fallbackError) {
            console.error('Fallback extraction also failed:', fallbackError);
        }

        return {
            text: '',
            pages: 0,
            error: errorMessage
        };
    }
};

// Alternative extraction method using File Reader for text files
const extractTextWithFileReader = async (file: File): Promise<PDFExtractionResult> => {
    return new Promise((resolve) => {
        const fileReader = new FileReader();

        fileReader.onload = (event) => {
            const content = event.target?.result as string;

            if (content && content.includes('%PDF')) {
                // It's a binary PDF, can't extract with FileReader
                resolve({
                    text: '',
                    pages: 0,
                    error: 'This is a binary PDF file that requires proper PDF processing. Please use manual text input or try a different PDF.'
                });
            } else if (content && content.trim().length > 0) {
                // Successfully read as text (probably a .txt file or text-based file)
                resolve({
                    text: content.trim(),
                    pages: 1,
                    metadata: { source: 'text_file' }
                });
            } else {
                resolve({
                    text: '',
                    pages: 0,
                    error: 'Unable to extract text from this file. Please use manual text input.'
                });
            }
        };

        fileReader.onerror = () => {
            resolve({
                text: '',
                pages: 0,
                error: 'Failed to read the file. Please try manual text input.'
            });
        };

        // Read as text
        fileReader.readAsText(file, 'UTF-8');
    });
};

export const validatePDFFile = (file: File): { isValid: boolean; error?: string } => {
    // Accept PDF and text files
    const allowedTypes = ['application/pdf', 'text/plain'];
    const allowedExtensions = ['.pdf', '.txt'];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        return {
            isValid: false,
            error: 'Please select a PDF (.pdf) or text (.txt) file'
        };
    }

    // Check file size (15MB limit for PDFs, they can be larger)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: 'File size must be less than 15MB'
        };
    }

    // Check if file is empty
    if (file.size === 0) {
        return {
            isValid: false,
            error: 'File appears to be empty'
        };
    }

    // Check minimum size for PDFs
    if (file.type === 'application/pdf' && file.size < 100) {
        return {
            isValid: false,
            error: 'PDF file is too small to be valid'
        };
    }

    return { isValid: true };
};

// Manual text input fallback
export const createManualTextInput = (): PDFExtractionResult => {
    return {
        text: '',
        pages: 0,
        error: 'MANUAL_INPUT_REQUIRED',
        metadata: { requiresManualInput: true }
    };
};

// Test if PDF.js is working with a simple test
export const testPDFJSAvailability = async (): Promise<boolean> => {
    try {
        console.log('Testing PDF.js availability...');
        console.log('PDF.js version:', pdfjsLib.version);
        console.log('Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);

        // Create a very simple PDF test document
        const simplePdfData = new Uint8Array([
            37, 80, 68, 70, 45, 49, 46, 52, 10, // %PDF-1.4\n
            49, 32, 48, 32, 111, 98, 106, 10, // 1 0 obj\n
            60, 60, 47, 84, 121, 112, 101, 47, 67, 97, 116, 97, 108, 111, 103, 47, 80, 97, 103, 101, 115, 32, 50, 32, 48, 32, 82, 62, 62, 10, // <</Type/Catalog/Pages 2 0 R>>\n
            101, 110, 100, 111, 98, 106, 10, // endobj\n
            50, 32, 48, 32, 111, 98, 106, 10, // 2 0 obj\n
            60, 60, 47, 84, 121, 112, 101, 47, 80, 97, 103, 101, 115, 47, 75, 105, 100, 115, 91, 51, 32, 48, 32, 82, 93, 47, 67, 111, 117, 110, 116, 32, 49, 62, 62, 10, // <</Type/Pages/Kids[3 0 R]/Count 1>>\n
            101, 110, 100, 111, 98, 106, 10, // endobj\n
            51, 32, 48, 32, 111, 98, 106, 10, // 3 0 obj\n
            60, 60, 47, 84, 121, 112, 101, 47, 80, 97, 103, 101, 47, 80, 97, 114, 101, 110, 116, 32, 50, 32, 48, 32, 82, 62, 62, 10, // <</Type/Page/Parent 2 0 R>>\n
            101, 110, 100, 111, 98, 106, 10, // endobj\n
            120, 114, 101, 102, 10, // xref\n
            48, 32, 52, 10, // 0 4\n
            48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 32, 54, 53, 53, 51, 53, 32, 102, 32, 10, // 0000000000 65535 f \n
            48, 48, 48, 48, 48, 48, 48, 48, 48, 57, 32, 48, 48, 48, 48, 48, 32, 110, 32, 10, // 0000000009 00000 n \n
            48, 48, 48, 48, 48, 48, 48, 48, 55, 52, 32, 48, 48, 48, 48, 48, 32, 110, 32, 10, // 0000000074 00000 n \n
            48, 48, 48, 48, 48, 48, 48, 49, 50, 49, 32, 48, 48, 48, 48, 48, 32, 110, 32, 10, // 0000000121 00000 n \n
            116, 114, 97, 105, 108, 101, 114, 10, // trailer\n
            60, 60, 47, 83, 105, 122, 101, 32, 52, 47, 82, 111, 111, 116, 32, 49, 32, 48, 32, 82, 62, 62, 10, // <</Size 4/Root 1 0 R>>\n
            115, 116, 97, 114, 116, 120, 114, 101, 102, 10, // startxref\n
            49, 55, 56, 10, // 178\n
            37, 37, 69, 79, 70 // %%EOF
        ]);

        const loadingTask = pdfjsLib.getDocument({
            data: simplePdfData,
            verbosity: 0
        });

        const pdf = await loadingTask.promise;
        console.log('PDF.js availability test passed - pages:', pdf.numPages);

        // Clean up
        if (pdf.destroy) {
            await pdf.destroy();
        }

        return true;
    } catch (error) {
        console.error('PDF.js availability test failed:', error);
        return false;
    }
};

export const setupPDFWorkerAlternative = async () => {
    return setupWorker();
};

export const extractTextFallback = async (file: File): Promise<PDFExtractionResult> => {
    return await extractTextWithFileReader(file);
};

// Export pdfjsLib for debugging
export const getPDFJSInfo = () => {
    return {
        version: pdfjsLib.version,
        workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
        isWorkerSetup: workerSetup
    };
};

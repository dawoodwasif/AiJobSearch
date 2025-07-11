import { pdfjs } from 'react-pdf';

export const setupPDFWorker = () => {
    try {
        // Get the exact version being used
        const version = pdfjs.version;
        console.log('Setting up PDF.js worker for version:', version);

        // Set worker source to match the exact version
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;

        console.log('PDF.js worker configured successfully');
        return true;
    } catch (error) {
        console.error('Failed to setup PDF.js worker:', error);

        // Fallback: try with legacy worker format
        try {
            pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
            console.log('Using fallback worker configuration');
            return true;
        } catch (fallbackError) {
            console.error('Fallback worker setup also failed:', fallbackError);
            // Disable worker as last resort
            pdfjs.GlobalWorkerOptions.workerSrc = '';
            console.log('Worker disabled due to configuration errors');
            return false;
        }
    }
};

// Initialize worker when module is imported
setupPDFWorker();

'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useState, useEffect, useMemo } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '../ui/button';
import { ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';

// Configure PDF.js worker with stable version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

// Import required CSS for react-pdf
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

interface PDFPreviewProps {
    pdfDocument: React.ReactElement;
    title: string;
    onEdit?: () => void;
    onDownload?: () => void;
    width?: number;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
    pdfDocument,
    title,
    onEdit,
    onDownload,
    width = 600
}) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(0.8);
    const [isGenerating, setIsGenerating] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Memoize Document options to prevent unnecessary reloads
    const documentOptions = useMemo(() => ({
        verbosity: 0,
        cMapUrl: '//unpkg.com/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '//unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
    }), []);

    // Generate PDF blob
    useEffect(() => {
        let isMounted = true;

        const generatePDF = async () => {
            try {
                setIsGenerating(true);
                setError(null);

                console.log('Starting PDF generation...');

                // Add timeout for PDF generation
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('PDF generation timeout')), 20000)
                );

                const pdfPromise = pdf(pdfDocument).toBlob();
                const blob = await Promise.race([pdfPromise, timeoutPromise]) as Blob;

                console.log('PDF blob generated:', { size: blob?.size, type: blob?.type });

                if (isMounted && blob && blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                    console.log('PDF URL created:', url);
                } else if (isMounted) {
                    setError('Generated PDF is empty or invalid');
                }
            } catch (error) {
                console.error('Error generating PDF:', error);
                if (isMounted) {
                    if (error instanceof Error && error.message.includes('timeout')) {
                        setError('PDF generation timed out. The document may be too complex.');
                    } else {
                        setError('Failed to generate PDF preview. The document structure may be invalid.');
                    }
                }
            } finally {
                if (isMounted) {
                    setIsGenerating(false);
                }
            }
        };

        generatePDF();

        return () => {
            isMounted = false;
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfDocument]);

    // Cleanup URL on unmount
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    const handleDownload = async () => {
        if (onDownload) {
            onDownload();
        } else if (pdfUrl) {
            // Default download behavior
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${title.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        console.log('PDF loaded successfully with', numPages, 'pages');
        setNumPages(numPages);
        setError(null); // Clear any loading errors
    };

    const onDocumentLoadError = (error: any) => {
        console.error('PDF load error:', error);
        setError('Failed to load PDF preview. The document may be corrupted.');
    };

    const adjustedWidth = useMemo(() => width * scale, [width, scale]);

    if (error) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{title}</h4>
                    {/* Single download button only when there's an error */}
                    {onDownload && (
                        <Button size="sm" onClick={onDownload}>
                            Download PDF
                        </Button>
                    )}
                </div>
                <div className="p-8 text-center">
                    <div className="text-red-600 mb-4">
                        <AlertCircle size={48} className="mx-auto mb-2" />
                        <p className="text-lg font-medium">PDF Preview Failed</p>
                    </div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500">
                        The PDF can still be downloaded using the button above.
                    </p>
                </div>
            </div>
        );
    }

    if (isGenerating) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900">{title}</h4>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Generating PDF preview...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few seconds...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Simplified Toolbar - NO download button here since it's in the parent */}
            <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{title}</h4>
                    {numPages > 0 && (
                        <span className="text-sm text-gray-500">({numPages} page{numPages > 1 ? 's' : ''})</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Zoom controls */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                        disabled={scale <= 0.5}
                    >
                        <ZoomOut size={14} />
                    </Button>
                    <span className="text-xs text-gray-600 px-2">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setScale(Math.min(1.5, scale + 0.1))}
                        disabled={scale >= 1.5}
                    >
                        <ZoomIn size={14} />
                    </Button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="bg-gray-100 flex justify-center" style={{ minHeight: '400px' }}>
                <div className="bg-white shadow-sm">
                    {pdfUrl && (
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                                <div className="flex items-center justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="text-sm text-gray-600 mt-2">Loading PDF...</p>
                                </div>
                            }
                            error={
                                <div className="flex flex-col items-center justify-center p-8 text-red-600">
                                    <AlertCircle size={32} className="mb-2" />
                                    <p>Failed to load PDF preview</p>
                                </div>
                            }
                            options={documentOptions}
                        >
                            {Array.from(new Array(numPages), (_, index) => (
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    width={Math.min(adjustedWidth, 800)}
                                    className="mb-2 border border-gray-300 shadow-sm"
                                    renderAnnotationLayer={false}
                                    renderTextLayer={false}
                                    loading={
                                        <div className="flex items-center justify-center h-96 bg-gray-50">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        </div>
                                    }
                                    error={
                                        <div className="flex items-center justify-center h-96 bg-red-50">
                                            <AlertCircle size={24} className="text-red-500" />
                                            <span className="text-red-600 ml-2">Page failed to load</span>
                                        </div>
                                    }
                                />
                            ))}
                        </Document>
                    )}
                </div>
            </div>
        </div>
    );
};

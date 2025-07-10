import React, { useState, useCallback, useRef } from 'react';
import { X, Upload, FileText, Download, Edit3, Eye, Wand2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { closeModal, setSelectedFile, setError, setShowResults, setOptimizationResults } from '../../store/aiEnhancementModalSlice';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Page, pdfjs } from 'react-pdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ExtractedResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  experience: string;
  skills: string[];
  education: string;
}

interface GeneratedDocuments {
  resume: {
    content: string;
    sections: {
      header: string;
      summary: string;
      experience: string;
      skills: string;
      education: string;
    };
  };
  coverLetter: {
    content: string;
    sections: {
      opening: string;
      body: string[];
      closing: string;
    };
  };
}

const AIEnhancementModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    isOpen, 
    jobDescription, 
    selectedFileMeta, 
    selectedFileContent, 
    error, 
    showResults 
  } = useAppSelector((state) => state.aiEnhancementModal);

  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocuments | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter'>('resume');
  const [editableContent, setEditableContent] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    dispatch(closeModal());
    setExtractedText('');
    setGeneratedDocuments(null);
    setEditableContent('');
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileSelection(pdfFile);
    } else {
      dispatch(setError('Please drop a PDF file'));
    }
  }, [dispatch]);

  const handleFileSelection = async (file: File) => {
    if (file.type !== 'application/pdf') {
      dispatch(setError('Please select a PDF file'));
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      dispatch(setSelectedFile({
        meta: {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified
        },
        content: base64
      }));

      // Extract text from PDF
      await extractTextFromPDF(arrayBuffer);
    } catch (error) {
      dispatch(setError('Failed to process PDF file'));
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      setExtractedText(fullText);
    } catch (error) {
      dispatch(setError('Failed to extract text from PDF'));
    }
  };

  const generateOptimizedDocuments = async () => {
    if (!extractedText || !jobDescription) {
      dispatch(setError('Please upload a resume and provide a job description'));
      return;
    }

    setIsProcessing(true);
    dispatch(setError(''));

    try {
      // Call OpenAI to generate optimized resume and cover letter
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a professional resume and cover letter writer. Given a resume text and job description, create an optimized resume and cover letter tailored to the job. Return the response as JSON with the following structure:
              {
                "resume": {
                  "content": "Full optimized resume content in HTML format",
                  "sections": {
                    "header": "Name and contact info",
                    "summary": "Professional summary",
                    "experience": "Work experience section",
                    "skills": "Skills section",
                    "education": "Education section"
                  }
                },
                "coverLetter": {
                  "content": "Full cover letter content in HTML format",
                  "sections": {
                    "opening": "Opening paragraph",
                    "body": ["Body paragraph 1", "Body paragraph 2"],
                    "closing": "Closing paragraph"
                  }
                }
              }`
            },
            {
              role: 'user',
              content: `Resume Text:\n${extractedText}\n\nJob Description:\n${jobDescription}\n\nPlease create an optimized resume and cover letter tailored to this job.`
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate optimized documents');
      }

      const data = await response.json();
      const generatedContent = JSON.parse(data.choices[0].message.content);
      
      setGeneratedDocuments(generatedContent);
      setEditableContent(generatedContent.resume.content);
      dispatch(setShowResults(true));
      dispatch(setOptimizationResults(generatedContent));

    } catch (error) {
      dispatch(setError('Failed to generate optimized documents. Please check your OpenAI API key.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabChange = (tab: 'resume' | 'coverLetter') => {
    setActiveTab(tab);
    if (generatedDocuments) {
      setEditableContent(
        tab === 'resume' 
          ? generatedDocuments.resume.content 
          : generatedDocuments.coverLetter.content
      );
    }
  };

  const downloadAsPDF = async () => {
    if (!editableContent) return;

    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editableContent;
      tempDiv.style.width = '210mm';
      tempDiv.style.padding = '20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = activeTab === 'resume' ? 'optimized-resume.pdf' : 'cover-letter.pdf';
      pdf.save(fileName);

      // Clean up
      document.body.removeChild(tempDiv);
    } catch (error) {
      dispatch(setError('Failed to generate PDF'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Wand2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Enhanced Resume & Cover Letter Generator
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload your resume and get AI-optimized documents tailored to the job
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
              {error}
            </div>
          )}

          {!showResults ? (
            <div className="space-y-6">
              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Description
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {jobDescription}
                  </p>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Resume (PDF)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : selectedFileMeta
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelection(file);
                    }}
                    className="hidden"
                  />
                  
                  {selectedFileMeta ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 text-green-500 mx-auto" />
                      <p className="text-green-700 dark:text-green-400 font-medium">
                        {selectedFileMeta.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(selectedFileMeta.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Drag & drop your resume PDF here, or{' '}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PDF files only, max 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end">
                <button
                  onClick={generateOptimizedDocuments}
                  disabled={!selectedFileMeta || !jobDescription || isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-medium transition-all disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      <span>Generate using AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Document Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => handleTabChange('resume')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'resume'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <FileText className="inline h-4 w-4 mr-2" />
                  Resume
                </button>
                <button
                  onClick={() => handleTabChange('coverLetter')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'coverLetter'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Edit3 className="inline h-4 w-4 mr-2" />
                  Cover Letter
                </button>
              </div>

              {/* Document Editor */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {activeTab === 'resume' ? 'Optimized Resume' : 'Cover Letter'}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadAsPDF}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Download size={16} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* Editable Content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 min-h-[500px] border">
                  <div
                    contentEditable
                    className="prose max-w-none focus:outline-none"
                    dangerouslySetInnerHTML={{ __html: editableContent }}
                    onBlur={(e) => setEditableContent(e.currentTarget.innerHTML)}
                    style={{
                      minHeight: '500px',
                      lineHeight: '1.6',
                      fontSize: '14px',
                      color: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => dispatch(setShowResults(false))}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Back to Upload
                </button>
                <button
                  onClick={handleClose}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEnhancementModal;
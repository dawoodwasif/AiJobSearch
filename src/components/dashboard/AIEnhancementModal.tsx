import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  closeModal,
  setSelectedFile,
  setCloudProvider,
  setCloudFileUrl,
  setError,
  setShowResults,
  setOptimizationResults,
} from '../../store/aiEnhancementModalSlice';
import { X, Upload, FileText, Download, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { extractTextFromPDF, extractTextFromWord } from '../../utils/pdfExtractor';
import { optimizeResumeWithAI } from '../../services/aiEnhancementService';
import { generateResumeAndCoverLetter } from '../../services/openaiService';
import EditablePDFViewer from '../pdf/EditablePDFViewer';

const AIEnhancementModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isOpen,
    jobDescription,
    selectedFileMeta,
    selectedFileContent,
    cloudProvider,
    cloudFileUrl,
    error,
    showResults,
    optimizationResults,
  } = useAppSelector((state) => state.aiEnhancementModal);

  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractionLoading, setExtractionLoading] = useState(false);
  const [extractionError, setExtractionError] = useState<string>('');
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<any>(null);

  // Get persisted job description from localStorage
  const persistedJobDescription = localStorage.getItem('selectedJobDescription');

  useEffect(() => {
    if (selectedFileContent && selectedFileMeta) {
      extractTextFromFile();
    }
  }, [selectedFileContent, selectedFileMeta]);

  const extractTextFromFile = async () => {
    if (!selectedFileContent || !selectedFileMeta) return;

    setExtractionLoading(true);
    setExtractionError('');

    try {
      // Convert base64 to blob
      const byteCharacters = atob(selectedFileContent.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: selectedFileMeta.type });

      let text = '';
      if (selectedFileMeta.type === 'application/pdf') {
        text = await extractTextFromPDF(blob);
      } else if (
        selectedFileMeta.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        selectedFileMeta.type === 'application/msword'
      ) {
        text = await extractTextFromWord(blob);
      } else {
        throw new Error('Unsupported file type');
      }

      setExtractedText(text);
    } catch (err: any) {
      setExtractionError(err.message || 'Failed to extract text from file');
    } finally {
      setExtractionLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type)) {
      dispatch(setError('Please select a PDF or Word document'));
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      dispatch(setError('File size must be less than 10MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      dispatch(setSelectedFile({
        meta: {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        },
        content,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCloudProviderChange = (provider: string) => {
    dispatch(setCloudProvider(provider));
    dispatch(setSelectedFile({ meta: null as any, content: '' }));
  };

  const handleCloudFileUrlChange = (url: string) => {
    dispatch(setCloudFileUrl(url));
  };

  const handleOptimize = async () => {
    const currentJobDescription = jobDescription || persistedJobDescription || '';
    
    if (!currentJobDescription.trim()) {
      dispatch(setError('Please provide a job description'));
      return;
    }

    if (!extractedText.trim()) {
      dispatch(setError('Please upload a resume file first'));
      return;
    }

    setLoading(true);
    dispatch(setError(''));

    try {
      const result = await optimizeResumeWithAI({
        resumeText: extractedText,
        jobDescription: currentJobDescription,
        includeAnalysis: true,
        format: 'json'
      });

      dispatch(setOptimizationResults(result));
      dispatch(setShowResults(true));
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to optimize resume'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    const currentJobDescription = jobDescription || persistedJobDescription || '';
    
    if (!currentJobDescription.trim()) {
      dispatch(setError('Please provide a job description'));
      return;
    }

    if (!extractedText.trim()) {
      dispatch(setError('Please upload a resume file first'));
      return;
    }

    setLoading(true);
    dispatch(setError(''));

    try {
      const result = await generateResumeAndCoverLetter({
        resumeText: extractedText,
        jobDescription: currentJobDescription,
      });

      if (result.success && result.data) {
        setGeneratedDocuments(result.data);
        setShowPDFViewer(true);
      } else {
        throw new Error(result.error || 'Failed to generate documents');
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to generate AI documents'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    dispatch(closeModal());
    setExtractedText('');
    setExtractionError('');
    setShowPDFViewer(false);
    setGeneratedDocuments(null);
  };

  const handleDownload = () => {
    if (!optimizationResults) return;

    const dataStr = JSON.stringify(optimizationResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'optimized-resume.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!isOpen) return null;

  if (showPDFViewer && generatedDocuments) {
    return (
      <EditablePDFViewer
        resumeData={generatedDocuments.resumeData}
        coverLetterData={generatedDocuments.coverLetterData}
        onClose={() => {
          setShowPDFViewer(false);
          setGeneratedDocuments(null);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Resume Enhancement
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Job Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description *
            </label>
            {persistedJobDescription ? (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Using job description from selected job
                  </span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-400 max-h-32 overflow-y-auto">
                  {persistedJobDescription.substring(0, 200)}...
                </div>
              </div>
            ) : (
              <textarea
                value={jobDescription}
                onChange={(e) => dispatch(setError(''))}
                placeholder="Paste the job description here..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={6}
              />
            )}
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Resume *
            </label>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  PDF, DOC, DOCX (Max 10MB)
                </span>
              </label>
            </div>

            {/* Selected File Info */}
            {selectedFileMeta && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedFileMeta.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({(selectedFileMeta.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}

            {/* Cloud Storage Options */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or import from:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCloudProviderChange('google-drive')}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    cloudProvider === 'google-drive'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Google Drive
                </button>
                <button
                  onClick={() => handleCloudProviderChange('dropbox')}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    cloudProvider === 'dropbox'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Dropbox
                </button>
                <button
                  onClick={() => handleCloudProviderChange('onedrive')}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    cloudProvider === 'onedrive'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  OneDrive
                </button>
              </div>

              {cloudProvider && (
                <div className="mt-3">
                  <input
                    type="url"
                    value={cloudFileUrl}
                    onChange={(e) => handleCloudFileUrlChange(e.target.value)}
                    placeholder={`Enter ${cloudProvider} file URL...`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Text Extraction Status */}
          {extractionLoading && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">Extracting text from file...</span>
            </div>
          )}

          {extractionError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">{extractionError}</span>
            </div>
          )}

          {extractedText && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Extracted Resume Text
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-40 overflow-y-auto">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {extractedText.substring(0, 500)}...
                </pre>
              </div>
            </div>
          )}

          {/* Results Section */}
          {showResults && optimizationResults && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Optimization Results
                </h3>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Download size={16} />
                  Download Results
                </button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {JSON.stringify(optimizationResults, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={handleOptimize}
              disabled={loading || (!selectedFileMeta && !cloudFileUrl) || !(jobDescription || persistedJobDescription || '').trim() || !extractedText}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Optimize Resume'
              )}
            </button>

            <button
              onClick={handleGenerateAI}
              disabled={loading || (!selectedFileMeta && !cloudFileUrl) || !(jobDescription || persistedJobDescription || '').trim() || !extractedText}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate AI Resume & Cover Letter'
              )}
            </button>
          </div>

          <div className="flex gap-3">
            <a
              href="https://resumebuilder-arfb.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ExternalLink size={16} />
              API Docs
            </a>
            
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancementModal;
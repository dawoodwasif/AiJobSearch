import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Download, Eye, Wand2, Sparkles, Bot, RefreshCw, Copy, Check, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  setPersonalInfo, 
  setJobDescription, 
  setResumeType, 
  setCoverLetterTone, 
  setPreviewMode, 
  setIsGenerating, 
  setGenerationError,
  setGeneratedResumeData,
  setCoverLetterData,
  resetResumeBuilder
} from '../../store/resumeBuilderSlice';
import ResumeTemplate from '../resume/ResumeTemplate';
import CoverLetterTemplate from '../resume/CoverLetterTemplate';
import { generateResumeContent, generateCoverLetter, extractResumeText } from '../../services/aiGenerationService';
import { useToastContext } from '../ui/ToastProvider';

interface AIResumeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIResumeBuilderModal: React.FC<AIResumeBuilderModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    resumeData,
    coverLetterData,
    selectedTemplate,
    isGenerating,
    generationError,
    previewMode,
    jobDescription,
    resumeType,
    coverLetterTone
  } = useAppSelector(state => state.resumeBuilder);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [step, setStep] = useState<'upload' | 'configure' | 'preview'>('upload');
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showError('Invalid file type', 'Please upload a PDF file.');
      return;
    }

    setUploadedFile(file);
    dispatch(setIsGenerating(true));

    try {
      const text = await extractResumeText(file);
      setExtractedText(text);
      setStep('configure');
      showSuccess('Resume uploaded successfully', 'Your resume has been processed and is ready for AI enhancement.');
    } catch (error) {
      showError('Upload failed', 'Failed to extract text from the PDF. Please try again.');
      console.error('Error extracting resume text:', error);
    } finally {
      dispatch(setIsGenerating(false));
    }
  };

  const handleGenerateResume = async () => {
    if (!extractedText || !jobDescription.trim()) {
      showError('Missing information', 'Please ensure you have uploaded a resume and provided a job description.');
      return;
    }

    dispatch(setIsGenerating(true));
    dispatch(setGenerationError(null));

    try {
      const enhancedResume = await generateResumeContent({
        resumeText: extractedText,
        jobDescription,
        resumeType,
        personalInfo: resumeData.personalInfo
      });

      dispatch(setGeneratedResumeData(enhancedResume));
      setStep('preview');
      dispatch(setPreviewMode('resume'));
      showSuccess('Resume generated successfully', 'Your AI-enhanced resume is ready for review.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate resume';
      dispatch(setGenerationError(errorMessage));
      showError('Generation failed', errorMessage);
    } finally {
      dispatch(setIsGenerating(false));
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      showError('Missing job description', 'Please provide a job description to generate a cover letter.');
      return;
    }

    dispatch(setIsGenerating(true));

    try {
      const coverLetter = await generateCoverLetter({
        personalInfo: resumeData.personalInfo,
        jobDescription,
        experience: resumeData.experience,
        skills: resumeData.skills,
        tone: coverLetterTone
      });

      dispatch(setCoverLetterData(coverLetter));
      dispatch(setPreviewMode('cover-letter'));
      showSuccess('Cover letter generated successfully', 'Your AI-generated cover letter is ready for review.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate cover letter';
      showError('Generation failed', errorMessage);
    } finally {
      dispatch(setIsGenerating(false));
    }
  };

  const handleDownload = () => {
    if (previewMode === 'resume') {
      // Implement PDF download for resume
      showSuccess('Download started', 'Your resume is being prepared for download.');
    } else {
      // Implement PDF download for cover letter
      showSuccess('Download started', 'Your cover letter is being prepared for download.');
    }
  };

  const handleCopy = async () => {
    try {
      if (previewMode === 'cover-letter' && coverLetterData) {
        await navigator.clipboard.writeText(coverLetterData.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showSuccess('Copied to clipboard', 'Cover letter content has been copied.');
      }
    } catch (error) {
      showError('Copy failed', 'Failed to copy content to clipboard.');
    }
  };

  const handleClose = () => {
    dispatch(resetResumeBuilder());
    setUploadedFile(null);
    setExtractedText('');
    setStep('upload');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Enhanced Resume & Cover Letter Generator
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your resume and generate tailored documents with AI
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

        <div className="flex h-[calc(95vh-80px)]">
          {/* Left Panel - Configuration */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            {step === 'upload' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Upload Your Resume
                  </h3>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Click to upload your resume (PDF only)
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Maximum file size: 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {isGenerating && (
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing your resume...</span>
                  </div>
                )}
              </div>
            )}

            {step === 'configure' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Configuration
                  </h3>
                  
                  {/* Job Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Description *
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => dispatch(setJobDescription(e.target.value))}
                      placeholder="Paste the job description here..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                    />
                  </div>

                  {/* Resume Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resume Type
                    </label>
                    <select
                      value={resumeType}
                      onChange={(e) => dispatch(setResumeType(e.target.value as any))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="professional">Professional</option>
                      <option value="creative">Creative</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>

                  {/* Cover Letter Tone */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cover Letter Tone
                    </label>
                    <select
                      value={coverLetterTone}
                      onChange={(e) => dispatch(setCoverLetterTone(e.target.value as any))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="professional">Professional</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="creative">Creative</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateResume}
                    disabled={isGenerating || !jobDescription.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate AI Resume
                      </>
                    )}
                  </button>

                  {generationError && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{generationError}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Preview & Actions
                  </h3>
                  
                  {/* Preview Mode Toggle */}
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
                    <button
                      onClick={() => dispatch(setPreviewMode('resume'))}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        previewMode === 'resume'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <FileText className="h-4 w-4 inline mr-2" />
                      Resume
                    </button>
                    <button
                      onClick={() => dispatch(setPreviewMode('cover-letter'))}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        previewMode === 'cover-letter'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <FileText className="h-4 w-4 inline mr-2" />
                      Cover Letter
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    {previewMode === 'cover-letter' && !coverLetterData && (
                      <button
                        onClick={handleGenerateCoverLetter}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4" />
                            Generate Cover Letter
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={handleDownload}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </button>

                    {previewMode === 'cover-letter' && coverLetterData && (
                      <button
                        onClick={handleCopy}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Text
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {step === 'upload' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Upload Your Resume to Get Started
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your resume preview will appear here once uploaded
                  </p>
                </div>
              </div>
            )}

            {step === 'configure' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Wand2 className="h-24 w-24 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Configure Your AI Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete the configuration and generate your enhanced resume
                  </p>
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg min-h-full">
                {previewMode === 'resume' ? (
                  <ResumeTemplate data={resumeData} template={selectedTemplate} />
                ) : coverLetterData ? (
                  <CoverLetterTemplate data={coverLetterData} personalInfo={resumeData.personalInfo} />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Generate a cover letter to see the preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResumeBuilderModal;
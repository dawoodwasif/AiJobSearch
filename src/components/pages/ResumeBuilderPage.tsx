import React, { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setPersonalInfo,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  setSkills,
  addProject,
  updateProject,
  removeProject,
  setCertifications,
  setSelectedTemplate,
  setJobDescription,
  setResumeType,
  setCoverLetterTone,
  setPreviewMode,
  setIsGenerating,
  setGenerationError,
  setGeneratedResumeData,
  setCoverLetterData,
  PersonalInfo,
  Experience,
  Education,
  Project,
  Skills,
} from '../../store/resumeBuilderSlice';
import { aiGenerationService } from '../../services/aiGenerationService';
import ResumeTemplate from '../resume/ResumeTemplate';
import CoverLetterTemplate from '../resume/CoverLetterTemplate';
import { useReactToPrint } from 'react-to-print';
import { 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles, 
  Eye, 
  Edit,
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ResumeBuilderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    resumeData,
    coverLetterData,
    selectedTemplate,
    isGenerating,
    generationError,
    previewMode,
    jobDescription,
    resumeType,
    coverLetterTone,
  } = useAppSelector((state) => state.resumeBuilder);

  const [activeSection, setActiveSection] = useState<string>('personal');
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: previewMode === 'resume' ? 'Resume' : 'Cover Letter',
  });

  const generateResumeContent = async () => {
    if (!resumeData.personalInfo.name || !resumeData.personalInfo.email) {
      dispatch(setGenerationError('Please fill in at least your name and email before generating content.'));
      return;
    }

    dispatch(setIsGenerating(true));
    dispatch(setGenerationError(null));

    try {
      const requestData = {
        personalInfo: {
          name: resumeData.personalInfo.name,
          email: resumeData.personalInfo.email,
          phone: resumeData.personalInfo.phone,
          location: resumeData.personalInfo.location,
          title: resumeData.personalInfo.title,
        },
        experience: resumeData.experience.map(exp => ({
          company: exp.company,
          position: exp.position,
          duration: exp.duration,
          description: exp.description,
        })),
        education: resumeData.education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          year: edu.year,
        })),
        skills: [
          ...resumeData.skills.technical,
          ...resumeData.skills.soft,
          ...resumeData.skills.tools,
        ],
        jobDescription: jobDescription || undefined,
        resumeType,
      };

      const generatedContent = await aiGenerationService.generateResumeContent(requestData);
      
      // Update the resume data with AI-generated content
      dispatch(setGeneratedResumeData({
        personalInfo: {
          ...resumeData.personalInfo,
          summary: generatedContent.summary,
        },
        experience: generatedContent.experience.map((exp: any, index: number) => ({
          id: resumeData.experience[index]?.id || `exp-${Date.now()}-${index}`,
          ...exp,
          achievements: exp.achievements || [],
        })),
        skills: generatedContent.skills,
      }));

      setShowPreview(true);
    } catch (error) {
      dispatch(setGenerationError(error instanceof Error ? error.message : 'Failed to generate content'));
    } finally {
      dispatch(setIsGenerating(false));
    }
  };

  const generateCoverLetter = async () => {
    if (!resumeData.personalInfo.name || !resumeData.personalInfo.email) {
      dispatch(setGenerationError('Please fill in your personal information first.'));
      return;
    }

    if (!jobDescription) {
      dispatch(setGenerationError('Please provide a job description to generate a cover letter.'));
      return;
    }

    dispatch(setIsGenerating(true));
    dispatch(setGenerationError(null));

    try {
      const requestData = {
        personalInfo: {
          name: resumeData.personalInfo.name,
          email: resumeData.personalInfo.email,
          phone: resumeData.personalInfo.phone,
          location: resumeData.personalInfo.location,
        },
        jobDetails: {
          company: 'Target Company', // This could be extracted from job description
          position: 'Target Position', // This could be extracted from job description
          jobDescription,
        },
        experience: resumeData.experience.map(exp => exp.description).join(' '),
        skills: [
          ...resumeData.skills.technical,
          ...resumeData.skills.soft,
          ...resumeData.skills.tools,
        ],
        tone: coverLetterTone,
      };

      const generatedCoverLetter = await aiGenerationService.generateCoverLetter(requestData);
      dispatch(setCoverLetterData(generatedCoverLetter));
      dispatch(setPreviewMode('cover-letter'));
      setShowPreview(true);
    } catch (error) {
      dispatch(setGenerationError(error instanceof Error ? error.message : 'Failed to generate cover letter'));
    } finally {
      dispatch(setIsGenerating(false));
    }
  };

  const addNewExperience = () => {
    const newExperience: Experience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      duration: '',
      description: '',
      achievements: [],
    };
    dispatch(addExperience(newExperience));
  };

  const addNewEducation = () => {
    const newEducation: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      year: '',
    };
    dispatch(addEducation(newEducation));
  };

  const addNewProject = () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      technologies: [],
    };
    dispatch(addProject(newProject));
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Preview Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {previewMode === 'resume' ? 'Resume Preview' : 'Cover Letter Preview'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => dispatch(setPreviewMode('resume'))}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      previewMode === 'resume'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => dispatch(setPreviewMode('cover-letter'))}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      previewMode === 'cover-letter'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    disabled={!coverLetterData}
                  >
                    Cover Letter
                  </button>
                </div>
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Preview Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div ref={printRef} className="bg-white rounded-lg shadow-lg">
            {previewMode === 'resume' ? (
              <ResumeTemplate data={resumeData} template={selectedTemplate} />
            ) : (
              coverLetterData && (
                <CoverLetterTemplate 
                  data={coverLetterData} 
                  personalInfo={resumeData.personalInfo} 
                />
              )
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Resume Builder</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPreview(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Eye size={16} />
                Preview
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {/* Section Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'personal', label: 'Personal Info' },
                    { id: 'experience', label: 'Experience' },
                    { id: 'education', label: 'Education' },
                    { id: 'skills', label: 'Skills' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'ai', label: 'AI Generation' },
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeSection === section.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {/* Personal Information */}
                {activeSection === 'personal' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.name}
                          onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.location}
                          onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, location: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Professional Title
                        </label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.title}
                          onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Professional Summary
                        </label>
                        <textarea
                          value={resumeData.personalInfo.summary}
                          onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, summary: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Brief summary of your professional background and key achievements..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Generation Section */}
                {activeSection === 'ai' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Content Generation</h2>
                    
                    {generationError && (
                      <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
                        {generationError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Job Description (Optional)
                        </label>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => dispatch(setJobDescription(e.target.value))}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Paste the job description here to tailor your resume and cover letter..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Resume Type
                          </label>
                          <select
                            value={resumeType}
                            onChange={(e) => dispatch(setResumeType(e.target.value as any))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="professional">Professional</option>
                            <option value="creative">Creative</option>
                            <option value="technical">Technical</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cover Letter Tone
                          </label>
                          <select
                            value={coverLetterTone}
                            onChange={(e) => dispatch(setCoverLetterTone(e.target.value as any))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="professional">Professional</option>
                            <option value="enthusiastic">Enthusiastic</option>
                            <option value="creative">Creative</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={generateResumeContent}
                          disabled={isGenerating}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <Sparkles size={20} />
                          )}
                          Generate Resume Content
                        </button>

                        <button
                          onClick={generateCoverLetter}
                          disabled={isGenerating}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <Sparkles size={20} />
                          )}
                          Generate Cover Letter
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add other sections (experience, education, skills, projects) here */}
                {/* For brevity, I'm showing the structure - you can expand these */}
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Eye size={16} />
                  Preview Resume
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Template</h3>
              <select
                value={selectedTemplate}
                onChange={(e) => dispatch(setSelectedTemplate(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="modern">Modern</option>
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { AIGenerationService } from '../../services/aiGenerationService';
import ResumeTemplate from '../resume/ResumeTemplate';
import CoverLetterTemplate from '../resume/CoverLetterTemplate';
import { ArrowLeft, Download, Wand2, Plus, Trash2, Eye, FileText, Mail } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const ResumeBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const printRef = useRef<HTMLDivElement>(null);
  
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

  const [activeTab, setActiveTab] = useState<'form' | 'ai-generation' | 'preview'>('form');
  const [expandedSections, setExpandedSections] = useState<string[]>(['personal']);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: previewMode === 'resume' ? 'Resume' : 'Cover Letter',
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

  const handleGenerateResume = async () => {
    dispatch(setIsGenerating(true));
    dispatch(setGenerationError(null));

    try {
      const result = await AIGenerationService.generateResumeContent({
        personalInfo: resumeData.personalInfo,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        jobDescription,
        resumeType,
      });

      // Update the resume data with AI-generated content
      dispatch(setGeneratedResumeData({
        personalInfo: {
          ...resumeData.personalInfo,
          summary: result.summary,
        },
        experience: result.experience.map((exp: any) => ({
          id: generateUniqueId(),
          ...exp,
          achievements: exp.achievements || [],
        })),
        skills: result.skills,
        projects: result.additionalSections?.projects?.map((proj: any) => ({
          id: generateUniqueId(),
          ...proj,
          technologies: proj.technologies || [],
        })) || resumeData.projects,
        certifications: result.additionalSections?.certifications || resumeData.certifications,
      }));

      setActiveTab('preview');
      dispatch(setPreviewMode('resume'));
    } catch (error: any) {
      dispatch(setGenerationError(error.message));
    } finally {
      dispatch(setIsGenerating(false));
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      dispatch(setGenerationError('Please provide a job description to generate a cover letter.'));
      return;
    }

    dispatch(setIsGenerating(true));
    dispatch(setGenerationError(null));

    try {
      const experienceSummary = resumeData.experience
        .map(exp => `${exp.position} at ${exp.company}: ${exp.description}`)
        .join('. ');

      const allSkills = [
        ...resumeData.skills.technical,
        ...resumeData.skills.soft,
        ...resumeData.skills.tools,
      ];

      // Extract company and position from job description (simple extraction)
      const lines = jobDescription.split('\n');
      const companyLine = lines.find(line => line.toLowerCase().includes('company:') || line.toLowerCase().includes('at '));
      const positionLine = lines.find(line => line.toLowerCase().includes('position:') || line.toLowerCase().includes('role:'));
      
      const company = companyLine?.split(/company:|at /i)[1]?.trim() || 'Your Company';
      const position = positionLine?.split(/position:|role:/i)[1]?.trim() || 'the position';

      const sections = await AIGenerationService.generateCoverLetter({
        personalInfo: {
          name: resumeData.personalInfo.name,
          email: resumeData.personalInfo.email,
          phone: resumeData.personalInfo.phone,
          location: resumeData.personalInfo.location,
        },
        jobDetails: {
          company,
          position,
          jobDescription,
        },
        experience: experienceSummary,
        skills: allSkills,
        tone: coverLetterTone,
      });

      dispatch(setCoverLetterData({
        content: `${sections.opening}\n\n${sections.body.join('\n\n')}\n\n${sections.closing}`,
        sections,
        jobDetails: { company, position, jobDescription },
      }));

      setActiveTab('preview');
      dispatch(setPreviewMode('cover-letter'));
    } catch (error: any) {
      dispatch(setGenerationError(error.message));
    } finally {
      dispatch(setIsGenerating(false));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Resume Builder</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form and AI Generation */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'form', label: 'Resume Form', icon: FileText },
                    { id: 'ai-generation', label: 'AI Generation', icon: Wand2 },
                    { id: 'preview', label: 'Preview', icon: Eye },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Form Tab */}
                {activeTab === 'form' && (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <button
                        onClick={() => toggleSection('personal')}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                        <Plus 
                          size={16} 
                          className={`transform transition-transform ${expandedSections.includes('personal') ? 'rotate-45' : ''}`}
                        />
                      </button>
                      {expandedSections.includes('personal') && (
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={resumeData.personalInfo.name}
                              onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={resumeData.personalInfo.email}
                              onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, email: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                              type="tel"
                              placeholder="Phone"
                              value={resumeData.personalInfo.phone}
                              onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, phone: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Location"
                              value={resumeData.personalInfo.location}
                              onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, location: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Professional Title"
                            value={resumeData.personalInfo.title}
                            onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                          <textarea
                            placeholder="Professional Summary (will be enhanced by AI)"
                            value={resumeData.personalInfo.summary}
                            onChange={(e) => dispatch(setPersonalInfo({ ...resumeData.personalInfo, summary: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* Experience Section */}
                    <div>
                      <button
                        onClick={() => toggleSection('experience')}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white">Experience</h3>
                        <Plus 
                          size={16} 
                          className={`transform transition-transform ${expandedSections.includes('experience') ? 'rotate-45' : ''}`}
                        />
                      </button>
                      {expandedSections.includes('experience') && (
                        <div className="mt-4 space-y-4">
                          {resumeData.experience.map((exp) => (
                            <div key={exp.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-gray-900 dark:text-white">Experience Entry</h4>
                                <button
                                  onClick={() => dispatch(removeExperience(exp.id))}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <input
                                  type="text"
                                  placeholder="Company"
                                  value={exp.company}
                                  onChange={(e) => dispatch(updateExperience({ id: exp.id, data: { company: e.target.value } }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Position"
                                  value={exp.position}
                                  onChange={(e) => dispatch(updateExperience({ id: exp.id, data: { position: e.target.value } }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Duration (e.g., Jan 2020 - Present)"
                                value={exp.duration}
                                onChange={(e) => dispatch(updateExperience({ id: exp.id, data: { duration: e.target.value } }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-3"
                              />
                              <textarea
                                placeholder="Job description (will be enhanced by AI)"
                                value={exp.description}
                                onChange={(e) => dispatch(updateExperience({ id: exp.id, data: { description: e.target.value } }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => dispatch(addExperience({
                              id: generateUniqueId(),
                              company: '',
                              position: '',
                              duration: '',
                              description: '',
                              achievements: [],
                            }))}
                            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                          >
                            + Add Experience
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Skills Section */}
                    <div>
                      <button
                        onClick={() => toggleSection('skills')}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white">Skills</h3>
                        <Plus 
                          size={16} 
                          className={`transform transition-transform ${expandedSections.includes('skills') ? 'rotate-45' : ''}`}
                        />
                      </button>
                      {expandedSections.includes('skills') && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Technical Skills
                            </label>
                            <input
                              type="text"
                              placeholder="React, Python, JavaScript (comma separated)"
                              value={resumeData.skills.technical.join(', ')}
                              onChange={(e) => dispatch(setSkills({
                                ...resumeData.skills,
                                technical: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Soft Skills
                            </label>
                            <input
                              type="text"
                              placeholder="Leadership, Communication, Problem Solving (comma separated)"
                              value={resumeData.skills.soft.join(', ')}
                              onChange={(e) => dispatch(setSkills({
                                ...resumeData.skills,
                                soft: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Tools & Technologies
                            </label>
                            <input
                              type="text"
                              placeholder="Git, Docker, AWS, Figma (comma separated)"
                              value={resumeData.skills.tools.join(', ')}
                              onChange={(e) => dispatch(setSkills({
                                ...resumeData.skills,
                                tools: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Generation Tab */}
                {activeTab === 'ai-generation' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        AI-Powered Content Generation
                      </h3>
                      
                      {generationError && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
                          {generationError}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Job Description (Optional - for targeted optimization)
                          </label>
                          <textarea
                            placeholder="Paste the job description here to get targeted resume and cover letter content..."
                            value={jobDescription}
                            onChange={(e) => dispatch(setJobDescription(e.target.value))}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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

                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={handleGenerateResume}
                            disabled={isGenerating}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
                          >
                            {isGenerating ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Wand2 size={16} />
                                Generate Resume
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleGenerateCoverLetter}
                            disabled={isGenerating || !jobDescription.trim()}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
                          >
                            {isGenerating ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Mail size={16} />
                                Generate Cover Letter
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Fill out the resume form first, then use AI to enhance your content and generate a targeted cover letter.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview Tab */}
                {activeTab === 'preview' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => dispatch(setPreviewMode('resume'))}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            previewMode === 'resume'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          Resume
                        </button>
                        <button
                          onClick={() => dispatch(setPreviewMode('cover-letter'))}
                          disabled={!coverLetterData}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            previewMode === 'cover-letter'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          Cover Letter
                        </button>
                      </div>
                    </div>
                    
                    {!coverLetterData && previewMode === 'cover-letter' && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Generate a cover letter first to preview it here.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {previewMode === 'resume' ? 'Resume Preview' : 'Cover Letter Preview'}
              </h3>
            </div>
            <div className="h-[800px] overflow-auto">
              <div ref={printRef} className="min-h-full">
                {previewMode === 'resume' ? (
                  <ResumeTemplate data={resumeData} template={selectedTemplate} />
                ) : coverLetterData ? (
                  <CoverLetterTemplate 
                    data={coverLetterData} 
                    personalInfo={resumeData.personalInfo}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Generate a cover letter to see the preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
  tools: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  projects: Project[];
  certifications: string[];
}

export interface CoverLetterData {
  content: string;
  sections: {
    opening: string;
    body: string[];
    closing: string;
  };
  jobDetails: {
    company: string;
    position: string;
    jobDescription: string;
  };
}

interface ResumeBuilderState {
  resumeData: ResumeData;
  coverLetterData: CoverLetterData | null;
  selectedTemplate: string;
  isGenerating: boolean;
  generationError: string | null;
  previewMode: 'resume' | 'cover-letter';
  jobDescription: string;
  resumeType: 'professional' | 'creative' | 'technical';
  coverLetterTone: 'professional' | 'enthusiastic' | 'creative';
}

const initialState: ResumeBuilderState = {
  resumeData: {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      title: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      tools: [],
    },
    projects: [],
    certifications: [],
  },
  coverLetterData: null,
  selectedTemplate: 'modern',
  isGenerating: false,
  generationError: null,
  previewMode: 'resume',
  jobDescription: '',
  resumeType: 'professional',
  coverLetterTone: 'professional',
};

const resumeBuilderSlice = createSlice({
  name: 'resumeBuilder',
  initialState,
  reducers: {
    setPersonalInfo(state, action: PayloadAction<PersonalInfo>) {
      state.resumeData.personalInfo = action.payload;
    },
    addExperience(state, action: PayloadAction<Experience>) {
      state.resumeData.experience.push(action.payload);
    },
    updateExperience(state, action: PayloadAction<{ id: string; data: Partial<Experience> }>) {
      const index = state.resumeData.experience.findIndex(exp => exp.id === action.payload.id);
      if (index !== -1) {
        state.resumeData.experience[index] = { ...state.resumeData.experience[index], ...action.payload.data };
      }
    },
    removeExperience(state, action: PayloadAction<string>) {
      state.resumeData.experience = state.resumeData.experience.filter(exp => exp.id !== action.payload);
    },
    addEducation(state, action: PayloadAction<Education>) {
      state.resumeData.education.push(action.payload);
    },
    updateEducation(state, action: PayloadAction<{ id: string; data: Partial<Education> }>) {
      const index = state.resumeData.education.findIndex(edu => edu.id === action.payload.id);
      if (index !== -1) {
        state.resumeData.education[index] = { ...state.resumeData.education[index], ...action.payload.data };
      }
    },
    removeEducation(state, action: PayloadAction<string>) {
      state.resumeData.education = state.resumeData.education.filter(edu => edu.id !== action.payload);
    },
    setSkills(state, action: PayloadAction<Skills>) {
      state.resumeData.skills = action.payload;
    },
    addProject(state, action: PayloadAction<Project>) {
      state.resumeData.projects.push(action.payload);
    },
    updateProject(state, action: PayloadAction<{ id: string; data: Partial<Project> }>) {
      const index = state.resumeData.projects.findIndex(proj => proj.id === action.payload.id);
      if (index !== -1) {
        state.resumeData.projects[index] = { ...state.resumeData.projects[index], ...action.payload.data };
      }
    },
    removeProject(state, action: PayloadAction<string>) {
      state.resumeData.projects = state.resumeData.projects.filter(proj => proj.id !== action.payload);
    },
    setCertifications(state, action: PayloadAction<string[]>) {
      state.resumeData.certifications = action.payload;
    },
    setSelectedTemplate(state, action: PayloadAction<string>) {
      state.selectedTemplate = action.payload;
    },
    setJobDescription(state, action: PayloadAction<string>) {
      state.jobDescription = action.payload;
    },
    setResumeType(state, action: PayloadAction<'professional' | 'creative' | 'technical'>) {
      state.resumeType = action.payload;
    },
    setCoverLetterTone(state, action: PayloadAction<'professional' | 'enthusiastic' | 'creative'>) {
      state.coverLetterTone = action.payload;
    },
    setPreviewMode(state, action: PayloadAction<'resume' | 'cover-letter'>) {
      state.previewMode = action.payload;
    },
    setIsGenerating(state, action: PayloadAction<boolean>) {
      state.isGenerating = action.payload;
    },
    setGenerationError(state, action: PayloadAction<string | null>) {
      state.generationError = action.payload;
    },
    setGeneratedResumeData(state, action: PayloadAction<Partial<ResumeData>>) {
      state.resumeData = { ...state.resumeData, ...action.payload };
    },
    setCoverLetterData(state, action: PayloadAction<CoverLetterData>) {
      state.coverLetterData = action.payload;
    },
    resetResumeBuilder() {
      return initialState;
    },
  },
});

export const {
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
  resetResumeBuilder,
} = resumeBuilderSlice.actions;

export default resumeBuilderSlice.reducer;
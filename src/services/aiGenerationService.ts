import { ResumeData, CoverLetterData } from '../store/resumeBuilderSlice';

interface GenerateResumeRequest {
  resumeText: string;
  jobDescription: string;
  resumeType: 'professional' | 'creative' | 'technical';
  personalInfo: any;
}

interface GenerateCoverLetterRequest {
  personalInfo: any;
  jobDescription: string;
  experience: any[];
  skills: any;
  tone: 'professional' | 'enthusiastic' | 'creative';
}

// Extract text from PDF resume
export const extractResumeText = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/extract-resume-text', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error extracting resume text:', error);
    throw new Error('Failed to extract text from resume');
  }
};

// Generate enhanced resume content using AI
export const generateResumeContent = async (request: GenerateResumeRequest): Promise<Partial<ResumeData>> => {
  try {
    const response = await fetch('/api/ai/generate-resume-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate resume content');
    }

    // Transform AI response to match our ResumeData structure
    const aiData = data.data;
    
    return {
      personalInfo: {
        ...request.personalInfo,
        summary: aiData.summary || request.personalInfo.summary,
      },
      experience: aiData.experience?.map((exp: any, index: number) => ({
        id: `exp-${index}`,
        company: exp.company,
        position: exp.position,
        duration: exp.duration,
        description: exp.description,
        achievements: exp.achievements || [],
      })) || [],
      skills: {
        technical: aiData.skills?.technical || [],
        soft: aiData.skills?.soft || [],
        tools: aiData.skills?.tools || [],
      },
      projects: aiData.additionalSections?.projects?.map((proj: any, index: number) => ({
        id: `proj-${index}`,
        name: proj.name,
        description: proj.description,
        technologies: proj.technologies || [],
        url: proj.url || '',
      })) || [],
      certifications: aiData.additionalSections?.certifications || [],
    };
  } catch (error) {
    console.error('Error generating resume content:', error);
    throw error;
  }
};

// Generate cover letter using AI
export const generateCoverLetter = async (request: GenerateCoverLetterRequest): Promise<CoverLetterData> => {
  try {
    const response = await fetch('/api/ai/generate-cover-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate cover letter');
    }

    return {
      content: data.data.content,
      sections: data.data.sections,
      jobDetails: {
        company: extractCompanyFromJobDescription(request.jobDescription),
        position: extractPositionFromJobDescription(request.jobDescription),
        jobDescription: request.jobDescription,
      },
    };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
};

// Helper functions to extract company and position from job description
const extractCompanyFromJobDescription = (jobDescription: string): string => {
  // Simple extraction logic - can be enhanced with AI
  const lines = jobDescription.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('company:') || line.toLowerCase().includes('organization:')) {
      return line.split(':')[1]?.trim() || 'Company Name';
    }
  }
  return 'Company Name';
};

const extractPositionFromJobDescription = (jobDescription: string): string => {
  // Simple extraction logic - can be enhanced with AI
  const lines = jobDescription.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('position:') || line.toLowerCase().includes('role:') || line.toLowerCase().includes('title:')) {
      return line.split(':')[1]?.trim() || 'Position Title';
    }
  }
  return 'Position Title';
};
import { ResumeData, CoverLetterData } from '../store/resumeBuilderSlice';

interface ResumeGenerationRequest {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    title: string;
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  skills: string[];
  jobDescription?: string;
  resumeType: 'professional' | 'creative' | 'technical';
}

interface CoverLetterRequest {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  jobDetails: {
    company: string;
    position: string;
    jobDescription: string;
  };
  experience: string;
  skills: string[];
  tone: 'professional' | 'enthusiastic' | 'creative';
}

class AIGenerationService {
  private getApiUrl(endpoint: string): string {
    // In development, use the proxy
    if (import.meta.env.DEV) {
      return `/api/ai/${endpoint}`;
    }
    // In production, use Supabase Edge Functions
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/${endpoint}`;
  }

  async generateResumeContent(data: ResumeGenerationRequest): Promise<any> {
    try {
      const response = await fetch(this.getApiUrl('generate-resume-content'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate resume content');
      }

      return result.data;
    } catch (error) {
      console.error('Error generating resume content:', error);
      throw error;
    }
  }

  async generateCoverLetter(data: CoverLetterRequest): Promise<CoverLetterData> {
    try {
      const response = await fetch(this.getApiUrl('generate-cover-letter'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate cover letter');
      }

      return {
        ...result.data,
        jobDetails: data.jobDetails,
      };
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw error;
    }
  }
}

export const aiGenerationService = new AIGenerationService();
interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    summary: string;
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  certifications: string[];
}

interface CoverLetterData {
  content: string;
  sections: {
    opening: string;
    body: string[];
    closing: string;
  };
}

interface GenerationRequest {
  resumeText: string;
  jobDescription: string;
  apiKey?: string; // Optional, will use env var if not provided
}

interface GenerationResponse {
  resume: ResumeData;
  coverLetter: CoverLetterData;
}

class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    // Use provided API key or fall back to environment variable
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required. Please set VITE_OPENAI_API_KEY in your environment variables or provide it directly.');
    }
  }

  private async makeRequest(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async generateResumeAndCoverLetter({ resumeText, jobDescription, apiKey }: GenerationRequest): Promise<GenerationResponse> {
    // Update API key if provided
    if (apiKey) {
      this.apiKey = apiKey;
    }

    try {
      console.log('Generating resume and cover letter with OpenAI...');
      
      // Generate resume
      const resumeResponse = await this.makeRequest('/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional resume writer. Analyze the provided resume text and job description to create an optimized, ATS-friendly resume. Return ONLY a valid JSON object with the specified structure. Do not include any markdown formatting or additional text.

The JSON structure should be:
{
  "personalInfo": {
    "name": "string",
    "email": "string", 
    "phone": "string",
    "location": "string",
    "title": "string",
    "summary": "string"
  },
  "experience": [
    {
      "company": "string",
      "position": "string", 
      "duration": "string",
      "description": "string",
      "achievements": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string",
      "gpa": "string (optional)"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"], 
    "tools": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string (optional)"
    }
  ],
  "certifications": ["string"]
}`
          },
          {
            role: 'user',
            content: `Resume Text: ${resumeText}\n\nJob Description: ${jobDescription}\n\nPlease optimize this resume for the job description, highlighting relevant skills and experience. Ensure all information is accurate and based on the original resume content.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Generate cover letter
      const coverLetterResponse = await this.makeRequest('/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional cover letter writer. Create a compelling cover letter based on the resume and job description. Return ONLY a valid JSON object with this structure:

{
  "content": "Full cover letter content as a single string with proper paragraph breaks using \\n\\n",
  "sections": {
    "opening": "Opening paragraph",
    "body": ["Body paragraph 1", "Body paragraph 2", "Body paragraph 3"],
    "closing": "Closing paragraph"
  }
}

The cover letter should be professional, engaging, and specifically tailored to the job description. Include specific examples from the resume that demonstrate relevant skills and experience.`
          },
          {
            role: 'user',
            content: `Resume Text: ${resumeText}\n\nJob Description: ${jobDescription}\n\nPlease create a compelling cover letter that highlights how the candidate's experience aligns with the job requirements.`
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      });

      // Parse responses
      const resumeContent = resumeResponse.choices[0].message.content;
      const coverLetterContent = coverLetterResponse.choices[0].message.content;

      let resume: ResumeData;
      let coverLetter: CoverLetterData;

      try {
        resume = JSON.parse(resumeContent);
      } catch (error) {
        console.error('Failed to parse resume JSON:', resumeContent);
        throw new Error('Failed to parse generated resume data');
      }

      try {
        coverLetter = JSON.parse(coverLetterContent);
      } catch (error) {
        console.error('Failed to parse cover letter JSON:', coverLetterContent);
        throw new Error('Failed to parse generated cover letter data');
      }

      console.log('Successfully generated resume and cover letter');
      return { resume, coverLetter };

    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  }

  // Test API key validity
  async testApiKey(): Promise<boolean> {
    try {
      await this.makeRequest('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }
}

export default OpenAIService;

// Export a singleton instance
export const openaiService = new OpenAIService();

// Export the class for custom instances
export { OpenAIService };
// Export the generateResumeAndCoverLetter function for direct use
export const generateResumeAndCoverLetter = async (request: GenerationRequest): Promise<GenerationResponse> => {
  return openaiService.generateResumeAndCoverLetter(request);
};
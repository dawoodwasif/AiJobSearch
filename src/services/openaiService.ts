import OpenAI from 'openai';

// Get API key from environment variables with proper browser compatibility
const getApiKey = (): string => {
  // For client-side, we need to use NEXT_PUBLIC_ prefix
  if (typeof window !== 'undefined') {
    // Browser environment
    return import.meta.env?.VITE_OPENAI_API_KEY ||
      (window as any).__OPENAI_API_KEY__ ||
      '';
  } else {
    // Server environment (if using SSR)
    return process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  }
};

const openai = new OpenAI({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true // Only for client-side usage
});

export interface ResumeOptimizationRequest {
  resumeText: string;
  jobDescription: string;
  applicantData?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
}

export interface AIOptimizationResults {
  matchScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  keywordAnalysis: {
    coverageScore: number;
    coveredKeywords: string[];
    missingKeywords: string[];
  };
  experienceOptimization: {
    company: string;
    position: string;
    relevanceScore: number;
    included: boolean;
    reasoning: string;
  }[];
  skillsOptimization: {
    technicalSkills: string[];
    softSkills: string[];
    missingSkills: string[];
  };
  aiEnhancements: {
    enhancedSummary: string;
    enhancedExperienceBullets: string[];
    coverLetterOutline: {
      opening: string;
      body: string;
      closing: string;
    };
    sectionRecommendations: {
      skills: string;
      experience: string;
      education: string;
    };
  };
  optimizedResumeText: string;
}

export class OpenAIResumeOptimizer {
  private static createSystemPrompt(): string {
    return `You are an expert resume optimization AI assistant specializing in ATS optimization and job matching. Your task is to analyze a resume against a job description and provide comprehensive optimization recommendations.

You must respond with a valid JSON object containing the following structure:
{
  "matchScore": number (0-100),
  "summary": "string - overall assessment",
  "strengths": ["array of strengths"],
  "gaps": ["array of gaps/weaknesses"],
  "suggestions": ["array of specific improvement suggestions"],
  "keywordAnalysis": {
    "coverageScore": number (0-100),
    "coveredKeywords": ["keywords found in resume"],
    "missingKeywords": ["important keywords missing from resume"]
  },
  "experienceOptimization": [
    {
      "company": "string",
      "position": "string", 
      "relevanceScore": number (0-100),
      "included": boolean,
      "reasoning": "string"
    }
  ],
  "skillsOptimization": {
    "technicalSkills": ["prioritized technical skills"],
    "softSkills": ["prioritized soft skills"],
    "missingSkills": ["skills to add"]
  },
  "aiEnhancements": {
    "enhancedSummary": "AI-improved professional summary",
    "enhancedExperienceBullets": ["improved bullet points"],
    "coverLetterOutline": {
      "opening": "cover letter opening paragraph",
      "body": "cover letter body content",
      "closing": "cover letter closing paragraph"
    },
    "sectionRecommendations": {
      "skills": "recommendations for skills section",
      "experience": "recommendations for experience section", 
      "education": "recommendations for education section"
    }
  },
  "optimizedResumeText": "complete optimized resume text"
}

Focus on:
1. ATS optimization and keyword matching
2. Quantifiable achievements and metrics
3. Industry-specific terminology
4. Proper formatting and structure
5. Tailoring content to specific job requirements`;
  }

  private static createUserPrompt(resumeText: string, jobDescription: string): string {
    return `Please analyze and optimize this resume for the given job description.

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${resumeText}

Provide a comprehensive analysis and optimization following the JSON structure specified in the system prompt. Make sure all recommendations are specific, actionable, and tailored to this exact job posting.`;
  }

  static async optimizeResume(request: ResumeOptimizationRequest): Promise<AIOptimizationResults> {
    try {
      // Check if API key is available
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('OpenAI API key is not configured. Please add your API key to the environment variables.');
      }

      console.log('Starting OpenAI resume optimization...');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.createSystemPrompt()
          },
          {
            role: 'user',
            content: this.createUserPrompt(request.resumeText, request.jobDescription)
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      console.log('OpenAI response received, parsing...');
      const aiResults = JSON.parse(responseText) as AIOptimizationResults;

      // Validate required fields
      if (typeof aiResults.matchScore !== 'number' || !aiResults.summary) {
        throw new Error('Invalid response structure from OpenAI');
      }

      console.log('OpenAI optimization completed successfully');
      return aiResults;

    } catch (error) {
      console.error('OpenAI optimization failed:', error);

      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('401')) {
          throw new Error('OpenAI API key is missing or invalid. Please check your configuration.');
        } else if (error.message.includes('quota') || error.message.includes('429')) {
          throw new Error('OpenAI API quota exceeded. Please check your usage limits.');
        } else if (error.message.includes('JSON')) {
          throw new Error('Failed to parse AI response. Please try again.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
      }

      throw new Error(`AI optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateCoverLetter(
    resumeText: string,
    jobDescription: string,
    applicantData: ResumeOptimizationRequest['applicantData']
  ): Promise<string> {
    try {
      // Check if API key is available
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('OpenAI API key is not configured. Please add your API key to the environment variables.');
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert cover letter writer. Create a professional, compelling cover letter that highlights the candidate's relevant experience and aligns with the job requirements. The cover letter should be engaging, specific, and demonstrate clear value proposition.`
          },
          {
            role: 'user',
            content: `Create a professional cover letter for this job application.

APPLICANT INFO:
Name: ${applicantData?.name || 'Applicant'}
Email: ${applicantData?.email || ''}
Phone: ${applicantData?.phone || ''}
Location: ${applicantData?.location || ''}

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT:
${resumeText}

Generate a compelling cover letter that:
1. Demonstrates clear alignment with job requirements
2. Highlights relevant achievements with metrics
3. Shows enthusiasm for the role and company
4. Maintains professional tone
5. Is concise yet comprehensive (3-4 paragraphs)`
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      });

      return completion.choices[0]?.message?.content || 'Failed to generate cover letter';
    } catch (error) {
      console.error('Cover letter generation failed:', error);
      throw new Error('Failed to generate cover letter using AI');
    }
  }
}
import { ResumeData, CoverLetterData } from '../store/resumeBuilderSlice';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

interface GenerateResumeRequest {
  personalInfo: ResumeData['personalInfo'];
  experience: ResumeData['experience'];
  education: ResumeData['education'];
  skills: ResumeData['skills'];
  jobDescription?: string;
  resumeType: 'professional' | 'creative' | 'technical';
}

interface GenerateCoverLetterRequest {
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

export class AIGenerationService {
  private static async callOpenAI(messages: any[], maxTokens: number = 2000) {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  static async generateResumeContent(request: GenerateResumeRequest): Promise<any> {
    const prompt = `
Generate professional resume content based on the following information:

Personal Information:
- Name: ${request.personalInfo.name}
- Email: ${request.personalInfo.email}
- Phone: ${request.personalInfo.phone}
- Location: ${request.personalInfo.location}
- Title: ${request.personalInfo.title}

Experience:
${request.experience.map(exp => `
- ${exp.position} at ${exp.company} (${exp.duration})
  ${exp.description}
`).join('')}

Education:
${request.education.map(edu => `
- ${edu.degree} from ${edu.institution} (${edu.year})
`).join('')}

Skills: 
- Technical: ${request.skills.technical.join(', ')}
- Soft: ${request.skills.soft.join(', ')}
- Tools: ${request.skills.tools.join(', ')}

${request.jobDescription ? `Target Job Description: ${request.jobDescription}` : ''}

Resume Type: ${request.resumeType}

Please generate:
1. A compelling professional summary (2-3 sentences)
2. Enhanced experience descriptions that are ATS-friendly and highlight achievements
3. A refined skills section organized by category
4. Any additional sections that would strengthen this resume

Return the response as a JSON object with the following structure:
{
  "summary": "Professional summary text",
  "experience": [
    {
      "company": "Company Name",
      "position": "Position Title",
      "duration": "Duration",
      "description": "Enhanced description with achievements and metrics",
      "achievements": ["achievement 1", "achievement 2"]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"]
  },
  "additionalSections": {
    "certifications": ["cert1", "cert2"],
    "projects": [
      {
        "name": "Project Name",
        "description": "Project description",
        "technologies": ["tech1", "tech2"]
      }
    ]
  }
}
`;

    const messages = [
      {
        role: 'system',
        content: 'You are a professional resume writer with expertise in ATS optimization and modern hiring practices. Always respond with valid JSON only, no additional text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.callOpenAI(messages, 2000);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  static async generateCoverLetter(request: GenerateCoverLetterRequest): Promise<CoverLetterData['sections']> {
    const prompt = `
Generate a compelling cover letter based on the following information:

Personal Information:
- Name: ${request.personalInfo.name}
- Email: ${request.personalInfo.email}
- Phone: ${request.personalInfo.phone}
- Location: ${request.personalInfo.location}

Job Details:
- Company: ${request.jobDetails.company}
- Position: ${request.jobDetails.position}
- Job Description: ${request.jobDetails.jobDescription}

Experience Summary: ${request.experience}
Key Skills: ${request.skills.join(', ')}
Tone: ${request.tone}

Please generate a professional cover letter that:
1. Has a compelling opening that shows enthusiasm for the specific role
2. Highlights relevant experience and achievements that match the job requirements
3. Demonstrates knowledge of the company and role
4. Includes specific examples and metrics where possible
5. Has a strong closing with a call to action
6. Maintains a ${request.tone} tone throughout

Return the response as a JSON object with the following structure:
{
  "opening": "Opening paragraph",
  "body": ["Body paragraph 1", "Body paragraph 2"],
  "closing": "Closing paragraph"
}
`;

    const messages = [
      {
        role: 'system',
        content: 'You are a professional cover letter writer with expertise in crafting compelling, personalized cover letters that get results. Always respond with valid JSON only, no additional text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.callOpenAI(messages, 1500);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}
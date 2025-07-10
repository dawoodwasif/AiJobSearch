interface GeneratedContent {
  resume: {
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
  };
  coverLetter: {
    content: string;
    sections: {
      opening: string;
      body: string[];
      closing: string;
    };
  };
}

export async function generateResumeAndCoverLetter(
  resumeText: string,
  jobDescription: string,
  openaiApiKey: string
): Promise<GeneratedContent> {
  const prompt = `
Based on the following resume text and job description, generate a tailored resume and cover letter:

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please generate:
1. An optimized resume that highlights relevant experience and skills for this specific job
2. A compelling cover letter tailored to this position

Return the response as a JSON object with the following structure:
{
  "resume": {
    "personalInfo": {
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "Phone Number",
      "location": "City, State",
      "title": "Professional Title",
      "summary": "Professional summary tailored to the job"
    },
    "experience": [
      {
        "company": "Company Name",
        "position": "Position Title",
        "duration": "Start Date - End Date",
        "description": "Enhanced description highlighting relevant achievements",
        "achievements": ["Achievement 1", "Achievement 2"]
      }
    ],
    "education": [
      {
        "institution": "University Name",
        "degree": "Degree Title",
        "year": "Graduation Year",
        "gpa": "GPA (if applicable)"
      }
    ],
    "skills": {
      "technical": ["Skill 1", "Skill 2"],
      "soft": ["Skill 1", "Skill 2"],
      "tools": ["Tool 1", "Tool 2"]
    },
    "projects": [
      {
        "name": "Project Name",
        "description": "Project description",
        "technologies": ["Tech 1", "Tech 2"],
        "url": "Project URL (if applicable)"
      }
    ],
    "certifications": ["Certification 1", "Certification 2"]
  },
  "coverLetter": {
    "content": "Full cover letter content",
    "sections": {
      "opening": "Opening paragraph",
      "body": ["Body paragraph 1", "Body paragraph 2"],
      "closing": "Closing paragraph"
    }
  }
}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume writer and career coach. Generate tailored resumes and cover letters that highlight the most relevant qualifications for specific job opportunities. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    try {
      return JSON.parse(generatedContent);
    } catch (parseError) {
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
    throw error;
  }
}
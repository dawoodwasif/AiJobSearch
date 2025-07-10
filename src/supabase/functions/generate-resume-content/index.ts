import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }

    const requestData: ResumeGenerationRequest = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }

    // Create the prompt for OpenAI
    const prompt = `
Generate a professional resume content based on the following information:

Personal Information:
- Name: ${requestData.personalInfo.name}
- Email: ${requestData.personalInfo.email}
- Phone: ${requestData.personalInfo.phone}
- Location: ${requestData.personalInfo.location}
- Title: ${requestData.personalInfo.title}

Experience:
${requestData.experience.map(exp => `
- ${exp.position} at ${exp.company} (${exp.duration})
  ${exp.description}
`).join('')}

Education:
${requestData.education.map(edu => `
- ${edu.degree} from ${edu.institution} (${edu.year})
`).join('')}

Skills: ${requestData.skills.join(', ')}

${requestData.jobDescription ? `Target Job Description: ${requestData.jobDescription}` : ''}

Resume Type: ${requestData.resumeType}

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
      "description": "Enhanced description with achievements and metrics"
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
        "description": "Project description"
      }
    ]
  }
}
`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a professional resume writer with expertise in ATS optimization and modern hiring practices. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = openaiData.choices[0].message.content;

    // Parse the JSON response from OpenAI
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      // If JSON parsing fails, return a structured error
      return new Response(JSON.stringify({ 
        error: 'Failed to parse AI response',
        rawContent: generatedContent 
      }), {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: parsedContent
    }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in generate-resume-content function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
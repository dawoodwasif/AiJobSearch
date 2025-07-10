import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

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

    const requestData: CoverLetterRequest = await req.json();
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

    const prompt = `
Generate a compelling cover letter based on the following information:

Personal Information:
- Name: ${requestData.personalInfo.name}
- Email: ${requestData.personalInfo.email}
- Phone: ${requestData.personalInfo.phone}
- Location: ${requestData.personalInfo.location}

Job Details:
- Company: ${requestData.jobDetails.company}
- Position: ${requestData.jobDetails.position}
- Job Description: ${requestData.jobDetails.jobDescription}

Experience Summary: ${requestData.experience}
Key Skills: ${requestData.skills.join(', ')}
Tone: ${requestData.tone}

Please generate a professional cover letter that:
1. Has a compelling opening that shows enthusiasm for the specific role
2. Highlights relevant experience and achievements that match the job requirements
3. Demonstrates knowledge of the company and role
4. Includes specific examples and metrics where possible
5. Has a strong closing with a call to action
6. Maintains a ${requestData.tone} tone throughout

Return the response as a JSON object with the following structure:
{
  "content": "Full cover letter content with proper formatting",
  "sections": {
    "opening": "Opening paragraph",
    "body": ["Body paragraph 1", "Body paragraph 2"],
    "closing": "Closing paragraph"
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
            content: 'You are a professional cover letter writer with expertise in crafting compelling, personalized cover letters that get results. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
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
    console.error('Error in generate-cover-letter function:', error);
    
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
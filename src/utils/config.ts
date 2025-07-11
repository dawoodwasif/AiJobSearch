export const config = {
    openai: {
        apiKey: (() => {
            // For Vite-based projects
            if (typeof import.meta !== 'undefined' && import.meta.env) {
                return import.meta.env.VITE_OPENAI_API_KEY;
            }

            // For browser environment with injected variables
            if (typeof window !== 'undefined') {
                return (window as any).__OPENAI_API_KEY__;
            }

            // Fallback for development
            return '';
        })()
    }
};

export const getOpenAIKey = (): string => {
    return config.openai.apiKey || '';
};

export const validateConfig = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.openai.apiKey) {
        errors.push('OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

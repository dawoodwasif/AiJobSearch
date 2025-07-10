/**
 * Environment variables validation utility
 * Ensures all required environment variables are properly configured
 */

// Validate Supabase configuration
export const validateSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const errors: string[] = [];
  
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is missing from environment variables');
  } else {
    try {
      const url = new URL(supabaseUrl);
      if (!url.hostname.includes('supabase.co')) {
        errors.push('VITE_SUPABASE_URL does not appear to be a valid Supabase URL');
      }
    } catch {
      errors.push('VITE_SUPABASE_URL is not a valid URL format');
    }
  }
  
  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing from environment variables');
  } else if (supabaseAnonKey.length < 100) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  jsearch: {
    apiKey: string;
    apiHost: string;
  };
  tavus: {
    apiKey: string;
  };
}

export class EnvironmentValidator {
  private static requiredVariables = {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    jsearch: {
      apiKey: import.meta.env.VITE_JSEARCH_API_KEY,
      apiHost: import.meta.env.VITE_JSEARCH_API_HOST,
    },
    tavus: {
      apiKey: import.meta.env.VITE_TAVUS_API_KEY,
    }
  };

  static validateEnvironment(): boolean {
    const config = {
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      jsearch: {
        apiKey: import.meta.env.VITE_JSEARCH_API_KEY,
        apiHost: import.meta.env.VITE_JSEARCH_API_HOST,
      },
      tavus: {
        apiKey: import.meta.env.VITE_TAVUS_API_KEY,
      }
    };

    // Check Supabase configuration
    const missingSupabaseVars = Object.entries(config.supabase)
      .filter(([, value]) => !value)
      .map(([key]) => `VITE_SUPABASE_${key.toUpperCase()}`);

    // Check JSearch configuration
    const missingJSearchVars = Object.entries(config.jsearch)
      .filter(([, value]) => !value)
      .map(([key]) => `VITE_JSEARCH_${key.toUpperCase()}`);

    // Check Tavus configuration (optional)
    const missingTavusVars = Object.entries(config.tavus)
      .filter(([, value]) => !value)
      .map(([key]) => `VITE_TAVUS_${key.toUpperCase()}`);

    const missingVars = [...missingSupabaseVars, ...missingJSearchVars];

    if (missingVars.length > 0) {
      return false;
    }

    return true;
  }

  static getConfig() {
    return this.requiredVariables;
  }
}
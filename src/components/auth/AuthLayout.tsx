import React from 'react';
import { Link } from 'react-router-dom';
import { validateSupabaseConfig } from '../../utils/environmentValidator';
import { testSupabaseConnection } from '../../lib/supabase';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  linkText: string;
  linkHref: string;
}

const ConfigurationError = ({ errors }: { errors: string[] }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration Error</h3>
        <div className="text-sm text-gray-600 space-y-2">
          {errors.map((error, index) => (
            <p key={index} className="text-left bg-red-50 p-2 rounded border-l-4 border-red-400">
              {error}
            </p>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <p>Please check your .env file and ensure all Supabase configuration values are correct.</p>
          <p className="mt-2">You can find these values in your Supabase project dashboard under Settings → API.</p>
        </div>
      </div>
    </div>
  </div>
);

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = React.useState<'testing' | 'success' | 'failed'>('testing');
  
  React.useEffect(() => {
    const testConnection = async () => {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? 'success' : 'failed');
    };
    
    testConnection();
  }, []);
  
  if (connectionStatus === 'testing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Testing Supabase connection...</p>
        </div>
      </div>
    );
  }
  
  if (connectionStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Failed</h3>
            <p className="text-sm text-gray-600 mb-4">
              Unable to connect to Supabase. Please check:
            </p>
            <ul className="text-sm text-gray-600 text-left space-y-1 mb-4">
              <li>• Your internet connection</li>
              <li>• Supabase project is active</li>
              <li>• CORS settings allow localhost:5173</li>
              <li>• API keys are correct</li>
            </ul>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, linkText, linkHref }) => {
  // Validate configuration before rendering
  const configValidation = validateSupabaseConfig();
  
  if (!configValidation.isValid) {
    return <ConfigurationError errors={configValidation.errors} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ConnectionTest />
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center drop-shadow-lg">
            <Link to="/\" className="inline-block">
              <img src="/AGENT_Logo.png" alt="Agile Partners\" className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto" />
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>
          {children}
          <div className="text-center">
            <Link to={linkHref} className="text-blue-600 dark:text-blue-400 hover:underline">
              {linkText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
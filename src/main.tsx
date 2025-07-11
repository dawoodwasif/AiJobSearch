import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, persistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';

// Suppress console warnings in development - MUST BE FIRST
import './utils/suppressWarnings';

import App from './App.tsx';
import './index.css';

// Validate environment configuration
import { EnvironmentValidator } from './utils/environmentValidator';
import { supabase } from './lib/supabase';

// Import PDF worker setup early
import './utils/pdfWorkerSetup';

// Expose supabase to window for debugging in development
if (import.meta.env.DEV) {
  (window as any).supabase = supabase;
  console.log('🔧 Supabase client exposed to window.supabase for debugging');
}

// For development, you can inject the API key directly (not recommended for production)
if (import.meta.env.DEV && import.meta.env.VITE_OPENAI_API_KEY) {
  (window as any).__OPENAI_API_KEY__ = import.meta.env.VITE_OPENAI_API_KEY;
}

// Validate and log environment status
try {
  EnvironmentValidator.validateEnvironment();
} catch (error) {
  console.error('❌ Application startup failed due to environment configuration:', error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);

import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

const OAuthCallbackHandler = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('🔄 OAuth callback detected, processing...');
        
        // Check if we have OAuth response in URL fragment
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('code'))) {
          console.log('🔑 OAuth response detected in URL fragment');
          
          // Let Supabase handle the OAuth response
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Error processing OAuth callback:', error);
            setError(error.message);
            setStatus('error');
            return;
          }
          
          if (data.session) {
            console.log('✅ OAuth session established successfully');
            console.log('👤 User:', data.session.user.email);
            
            // Clear the URL fragment to clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirect to chat page
            const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin;
            window.location.href = `${redirectUrl}/chat`;
            return;
          } else {
            console.log('⚠️ No session found after OAuth callback');
            setError('Authentication failed. Please try again.');
            setStatus('error');
          }
        } else {
          console.log('⚠️ No OAuth response detected in URL');
          setError('Invalid OAuth callback. Please try logging in again.');
          setStatus('error');
        }
      } catch (err) {
        console.error('❌ Unexpected error in OAuth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setStatus('error');
      }
    };

    handleOAuthCallback();
  }, []);

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
        <div className="max-w-md mx-auto w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Processing Login...</h2>
          <p className="text-gray-600">Please wait while we complete your authentication.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
        <div className="max-w-md mx-auto w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallbackHandler;

import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';

const VerifyEmailPage = () => {
  const [checking, setChecking] = useState(true);
  const [emailForResend, setEmailForResend] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resendError, setResendError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        // First, try to get email from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const emailFromUrl = urlParams.get('email');
        if (emailFromUrl) {
          setUserEmail(emailFromUrl);
          setEmailForResend(emailFromUrl); // Also set it in the resend form
        }

        // Attempt to pick up a session from the URL hash if present
        // The AuthProvider listener should also capture this, but we add a direct call for safety
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('code'))) {
          try {
            await supabase.auth.getSession();
          } catch {}
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // If email is verified, go to chat
          const { user } = session;
          if (user.email_confirmed_at) {
            window.location.replace('/chat');
            return;
          }
          // Store the user's email for display (override URL param if session has email)
          if (user.email) {
            setUserEmail(user.email);
            setEmailForResend(user.email);
          }
        }
      } catch (e) {
        console.error('Error in VerifyEmailPage useEffect:', e);
      } finally {
        setChecking(false);
      }
    };

    run();

    // Listen for verification/auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email_confirmed_at) {
        window.location.replace('/chat');
      }
      // Update user email if session changes
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setEmailForResend(session.user.email);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendMsg('');
    setResendError('');
    const email = emailForResend.trim();
    if (!email) {
      setResendError('Please enter your email to resend.');
      return;
    }
    try {
      const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/verify_email`;
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: redirectUrl }
      });
      if (error) {
        setResendError(error.message);
      } else {
        setResendMsg('Verification email sent. Please check your inbox.');
      }
    } catch (err) {
      setResendError('Failed to resend. Please try again later.');
    }
  };

  const openGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  // Debug logging
  console.log('VerifyEmailPage - userEmail:', userEmail);
  console.log('VerifyEmailPage - checking:', checking);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div className="max-w-md mx-auto w-full text-center">
        <h2 className="text-3xl font-bold mb-3 text-text">Verify your email</h2>
        <p className="text-mutedText mb-8">
          We've sent a verification link to <strong>{userEmail || 'your email'}</strong>. Please click it to activate your account.
        </p>
        
        {userEmail && (
          <div className="mb-6">
            <button
              onClick={openGmail}
              className="w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-50 flex items-center justify-center mb-4"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Open Gmail
            </button>
          </div>
        )}

        {checking && (
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Checking verification status...
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-left">
          <h3 className="font-semibold mb-3 text-text">Didn't receive the email?</h3>
          <form onSubmit={handleResend} className="space-y-3">
            <input
              type="email"
              value={emailForResend}
              onChange={(e) => setEmailForResend(e.target.value)}
              className="input-field w-full"
              placeholder="Enter your email to resend"
            />
            {resendError && <p className="text-sm text-red-600">{resendError}</p>}
            {resendMsg && <p className="text-sm text-green-600">{resendMsg}</p>}
            <button type="submit" className="w-full btn btn-primary">Resend verification email</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

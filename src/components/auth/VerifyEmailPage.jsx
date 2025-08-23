import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';

const VerifyEmailPage = () => {
  const [checking, setChecking] = useState(true);
  const [emailForResend, setEmailForResend] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
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
        }
      } catch (e) {
        // ignore
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
      const redirectUrl = (import.meta?.env?.VITE_AUTH_REDIRECT_URL) || `${window.location.origin}/verify_email`;
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div className="max-w-md mx-auto w-full text-center">
        <h2 className="text-3xl font-bold mb-3 text-text">Verify your email</h2>
        <p className="text-mutedText mb-8">We've sent a verification link to your email. Please click it to activate your account.</p>
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

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import ForceLightTheme from '../../components/ForceLightTheme';

export default function LoginPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || '/bookings';
  const errorParam = searchParams.get('error');

  // Handle auth errors from Google OAuth
  useEffect(() => {
    if (errorParam) {
      if (errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback') {
        setErrorMsg('Failed to establish connection with Google OAuth.');
      } else if (errorParam === 'OAuthCreateAccount' || errorParam === 'Callback') {
        setErrorMsg('Failed to synchronize your user profile with database.');
      } else {
        setErrorMsg('An unexpected authentication error occurred.');
      }
    }
  }, [errorParam]);

  // If already authenticated, redirect to callbackUrl
  useEffect(() => {
    if (isAuthenticated) {
      navigate(callbackUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, callbackUrl]);

  const handleGoogleLogin = () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '787812320639-763hopcgpmnmm6f0uavsae8pqtntj73q.apps.googleusercontent.com';
      const redirectUri = window.location.origin + '/auth/callback';
      
      // Save callbackUrl in sessionStorage to restore after Google redirect callback
      sessionStorage.setItem('auth_callback_url', callbackUrl);
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
        access_type: 'offline',
        prompt: 'consent'
      }).toString();
      
      window.location.href = googleAuthUrl;
    } catch (err) {
      console.error('SignIn trigger failed:', err);
      setErrorMsg('Failed to trigger Google authentication provider.');
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || authLoading || isAuthenticated;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans animate-none">
      <ForceLightTheme />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* Brand Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white shadow-sm mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Simplify your scheduling
        </h2>
        <p className="mt-2 text-center text-xs text-gray-500 max-w-sm leading-relaxed">
          Create bookable links, coordinate recurring availability, and schedule meetings in one click.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-150 sm:rounded-2xl shadow-sm sm:px-10 flex flex-col gap-6">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-gray-900">Welcome to CalClone</h3>
            <p className="text-[11px] text-gray-500">Sign in to manage your appointments and calendars.</p>
          </div>

          {/* Error Message banner */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-150 text-xs text-rose-800 animate-none">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* OAuth button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isButtonDisabled}
            className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100/80 rounded-xl border border-gray-200 shadow-sm transition-all duration-150 ${
              isButtonDisabled
                ? 'opacity-65 cursor-not-allowed'
                : 'hover:border-gray-300 active:scale-[0.985]'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center py-2 animate-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-150"></div>
            </div>
            <span className="relative px-3 bg-white text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Secure authentication
            </span>
          </div>

          <p className="text-[10px] text-center text-gray-400 leading-relaxed max-w-[280px] mx-auto">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

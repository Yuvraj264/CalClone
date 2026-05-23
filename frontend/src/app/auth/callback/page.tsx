import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      setErrorMsg('Access denied or Google OAuth sign in cancelled.');
      setTimeout(() => navigate('/login?error=OAuthSignin'), 3000);
      return;
    }

    if (!code) {
      setErrorMsg('Authorization code missing from Google redirect.');
      setTimeout(() => navigate('/login?error=OAuthSignin'), 3000);
      return;
    }

    const exchangeCode = async () => {
      try {
        const redirectUri = window.location.origin + '/auth/callback';
        
        // Forward Google Authorization Code to Express MERN secure backend
        const response = await axios.post(`${API_BASE}/auth/google-callback`, {
          code,
          redirectUri,
        });

        if (response.data.success && response.data.data) {
          const { token, user } = response.data.data;
          
          // Log user in client-side context
          login(token, {
            id: user.id || user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName || user.name,
            avatarUrl: user.avatarUrl,
            timezone: user.timezone,
          });

          // Retrieve callbackUrl if stored
          const callbackUrl = sessionStorage.getItem('auth_callback_url') || '/bookings';
          sessionStorage.removeItem('auth_callback_url');
          
          navigate(callbackUrl, { replace: true });
        } else {
          throw new Error('Sync response did not return authorization credentials.');
        }
      } catch (err: any) {
        console.error('[Google OAuth Callback Exchange Failure]:', err);
        setErrorMsg(err.response?.data?.message || 'Failed to exchange authorization credentials.');
        setTimeout(() => navigate('/login?error=OAuthCallback'), 4000);
      }
    };

    exchangeCode();
  }, [code, error, login, navigate]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm p-8 text-center flex flex-col items-center gap-4 w-full max-w-sm">
        {errorMsg ? (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Authentication Failed</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {errorMsg}
            </p>
            <p className="text-[10px] text-gray-400">Redirecting to authorization panel...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Connecting Account</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Exchanging Google credentials and synchronizing your calendar environment...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

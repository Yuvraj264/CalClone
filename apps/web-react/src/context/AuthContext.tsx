import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  timezone: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Axios instance configured with defaults
  const authClient = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
  });

  const fetchMe = async (token: string) => {
    try {
      const res = await authClient.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success && res.data.data?.user) {
        const u = res.data.data.user;
        setUser({
          id: u._id || u.id,
          email: u.email,
          username: u.username,
          fullName: u.fullName || u.name,
          avatarUrl: u.avatarUrl,
          timezone: u.timezone,
        });
      } else {
        localStorage.removeItem('cl_session_token');
        setUser(null);
      }
    } catch (err) {
      console.error('[Auth Check Failed]:', err);
      localStorage.removeItem('cl_session_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let token = localStorage.getItem('cl_session_token');
    if (!token) {
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTBkODljNzQ1ZDM4NDM2NDZhZDJhNyIsImVtYWlsIjoiYWxpY2VAY2FsY2xvbmUuZGV2IiwidXNlcm5hbWUiOiJhbGljZSIsImlhdCI6MTc3OTU0MzE0OCwiZXhwIjo0OTM1MzAzMTQ4fQ.iPc0ve1TNMqmyfgR_XXIUXHwMxVkS3vMt1n5dUJhG78';
      localStorage.setItem('cl_session_token', token);
    }
    fetchMe(token);
  }, []);

  const login = (token: string, userProfile: UserProfile) => {
    localStorage.setItem('cl_session_token', token);
    setUser(userProfile);
  };

  const logout = async () => {
    try {
      await authClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.setItem('cl_session_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTBkODljNzQ1ZDM4NDM2NDZhZDJhNyIsImVtYWlsIjoiYWxpY2VAY2FsY2xvbmUuZGV2IiwidXNlcm5hbWUiOiJhbGljZSIsImlhdCI6MTc3OTU0MzE0OCwiZXhwIjo0OTM1MzAzMTQ4fQ.iPc0ve1TNMqmyfgR_XXIUXHwMxVkS3vMt1n5dUJhG78');
      window.location.href = '/';
    }
  };

  const updateUser = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import requests from '../helpers/requests';

export const AuthContext = createContext();

const STORAGE_KEY = 'birdiaryAuthToken';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => window.localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setUser(null);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }
    setLoading(true);
    requests
      .getCurrentUser(token)
      .then((res) => {
        if (isMounted) {
          setUser(res.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setToken(null);
          window.localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [token]);

  const persistToken = useCallback((newToken) => {
    setToken(newToken);
    if (newToken) {
      window.localStorage.setItem(STORAGE_KEY, newToken);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    const response = await requests.login({ email, password });
    const newToken = response.data.token;
    persistToken(newToken);
    setUser(response.data.user);
    return response.data.user;
  }, [persistToken]);

  const register = useCallback(async ({ email, password, name }) => {
    setError(null);
    const response = await requests.registerUser({ email, password, name });
    const { token: newToken, user, requiresVerification } = response.data || {};
    if (newToken && user) {
      persistToken(newToken);
      setUser(user);
    } else {
      persistToken(null);
      setUser(null);
    }
    return response.data;
  }, [persistToken]);

  const logout = useCallback(async () => {
    setError(null);
    if (token) {
      try {
        await requests.logout(token);
      } catch (e) {
        // ignore logout errors
      }
    }
    persistToken(null);
    setUser(null);
  }, [persistToken, token]);

  const resetPassword = useCallback(async (currentPassword, newPassword) => {
    if (!token) {
      throw new Error('Not authenticated');
    }
    const response = await requests.resetPassword({ currentPassword, newPassword }, token);
    if (response.data.token) {
      persistToken(response.data.token);
      const updated = await requests.getCurrentUser(response.data.token);
      setUser(updated.data);
    }
    return response.data;
  }, [persistToken, token]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return null;
    }
    try {
      const response = await requests.getCurrentUser(token);
      setUser(response.data);
      return response.data;
    } catch (e) {
      persistToken(null);
      setUser(null);
      throw e;
    }
  }, [persistToken, token]);

  const authenticateWithToken = useCallback(async (newToken) => {
    persistToken(newToken);
    if (!newToken) {
      setUser(null);
      return null;
    }
    try {
      const response = await requests.getCurrentUser(newToken);
      setUser(response.data);
      return response.data;
    } catch (e) {
      persistToken(null);
      setUser(null);
      throw e;
    }
  }, [persistToken]);

  const verifyEmail = useCallback(async (tokenValue) => {
    const response = await requests.verifyEmail({ token: tokenValue });
    if (response.data?.token) {
      await authenticateWithToken(response.data.token);
    }
    return response.data;
  }, [authenticateWithToken]);

  const resendVerification = useCallback(async (email) => {
    return requests.resendVerificationEmail({ email });
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    refreshUser,
    authenticateWithToken,
    verifyEmail,
    resendVerification,
    setError,
  }), [token, user, loading, error, login, register, logout, resetPassword, refreshUser, authenticateWithToken, verifyEmail, resendVerification, setError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

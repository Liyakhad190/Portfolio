import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabaseSignIn, supabaseSignOut, isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const AdminContext = createContext(null);

const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour default session
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds lockout

const STORAGE_KEYS = {
  AUTH_TOKEN: 'portfolio_admin_auth',
  AUTH_TIMESTAMP: 'portfolio_admin_auth_time',
  CUSTOM_CREDS: 'portfolio_admin_credentials',
  FAILED_ATTEMPTS: 'portfolio_admin_failed_attempts',
  LOCKOUT_UNTIL: 'portfolio_admin_lockout_until',
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);

  // Helper to get stored credentials or fallback to defaults
  const getAdminCredentials = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_CREDS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading stored admin credentials', e);
    }
    return {
      username: import.meta.env.VITE_ADMIN_USER || 'admin',
      password: import.meta.env.VITE_ADMIN_PASS || 'admin123',
    };
  }, []);

  // Initialize and check existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check Supabase Session if configured
      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setIsAuthenticated(true);
          setAdminUser({ username: session.user.email || 'admin', role: 'Super Admin', id: session.user.id });
          setSessionExpiresAt(Date.now() + SESSION_DURATION_MS);
          return;
        }
      }

      // Check session or local storage
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const authTime = localStorage.getItem(STORAGE_KEYS.AUTH_TIMESTAMP) || sessionStorage.getItem(STORAGE_KEYS.AUTH_TIMESTAMP);

      if (token && authTime) {
        const timeElapsed = Date.now() - parseInt(authTime, 10);
        if (timeElapsed < SESSION_DURATION_MS) {
          setIsAuthenticated(true);
          setAdminUser({ username: token, role: 'Administrator' });
          setSessionExpiresAt(parseInt(authTime, 10) + SESSION_DURATION_MS);
          return;
        }
      }
      // Expired or missing
      logout();
    };

    // Check lockout state
    const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL) || '0', 10);
    if (lockoutUntil > Date.now()) {
      setLockoutRemaining(Math.ceil((lockoutUntil - Date.now()) / 1000));
    }

    checkAuth();
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
          localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Session time remaining helper (in ms)
  const getSessionTimeRemaining = useCallback(() => {
    if (!isAuthenticated || !sessionExpiresAt) return 0;
    const remaining = sessionExpiresAt - Date.now();
    return Math.max(0, remaining);
  }, [isAuthenticated, sessionExpiresAt]);

  // Extend session duration
  const extendSession = useCallback(() => {
    if (!isAuthenticated) return;
    const now = Date.now();
    const newExpiresAt = now + SESSION_DURATION_MS;
    setSessionExpiresAt(newExpiresAt);

    if (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TIMESTAMP, now.toString());
    }
    if (sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TIMESTAMP, now.toString());
    }
  }, [isAuthenticated]);

  // Login handler
  const login = async (username, password, rememberMe = true) => {
    // Check if locked out
    const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL) || '0', 10);
    if (lockoutUntil > Date.now()) {
      const remainingSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setLockoutRemaining(remainingSec);
      return { success: false, error: `Too many failed attempts. Please wait ${remainingSec}s.` };
    }

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // 1. Attempt Supabase Authentication if configured
    if (isSupabaseConfigured()) {
      const supaRes = await supabaseSignIn(cleanUser, cleanPass);
      if (supaRes.success && supaRes.user) {
        localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
        localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
        setLockoutRemaining(0);

        const now = Date.now();
        setIsAuthenticated(true);
        setAdminUser({ username: supaRes.user.email || cleanUser, role: 'Super Admin', id: supaRes.user.id });
        setSessionExpiresAt(now + SESSION_DURATION_MS);
        return { success: true };
      }
    }

    // 2. Local credentials fallback
    const creds = getAdminCredentials();
    if (cleanUser === creds.username && cleanPass === creds.password) {
      // Clear failed attempts
      localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
      setLockoutRemaining(0);

      const now = Date.now();
      const storage = rememberMe ? localStorage : sessionStorage;

      // Clear both first
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TIMESTAMP);
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TIMESTAMP);

      storage.setItem(STORAGE_KEYS.AUTH_TOKEN, cleanUser);
      storage.setItem(STORAGE_KEYS.AUTH_TIMESTAMP, now.toString());

      setIsAuthenticated(true);
      setAdminUser({ username: cleanUser, role: 'Administrator' });
      setSessionExpiresAt(now + SESSION_DURATION_MS);

      return { success: true };
    } else {
      // Handle failed attempt
      let attempts = parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || '0', 10) + 1;
      localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, attempts.toString());

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, until.toString());
        setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        return {
          success: false,
          error: `Maximum failed attempts reached. Locked out for ${Math.ceil(LOCKOUT_DURATION_MS / 1000)} seconds.`,
        };
      }

      return {
        success: false,
        error: `Invalid credentials. (${MAX_FAILED_ATTEMPTS - attempts} attempts remaining)`,
      };
    }
  };

  // Logout handler
  const logout = useCallback(async () => {
    await supabaseSignOut();
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TIMESTAMP);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TIMESTAMP);

    setIsAuthenticated(false);
    setAdminUser(null);
    setSessionExpiresAt(null);
  }, []);

  // Update admin password
  const changePassword = (currentPassword, newPassword) => {
    const creds = getAdminCredentials();
    if (currentPassword !== creds.password) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters.' };
    }

    const updatedCreds = {
      username: creds.username,
      password: newPassword,
    };
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CREDS, JSON.stringify(updatedCreds));
    return { success: true, message: 'Password updated successfully!' };
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        lockoutRemaining,
        sessionExpiresAt,
        login,
        logout,
        extendSession,
        getSessionTimeRemaining,
        changePassword,
        getAdminCredentials,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;

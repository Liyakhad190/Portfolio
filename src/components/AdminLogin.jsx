import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLock, 
  FaUser, 
  FaEye, 
  FaEyeSlash, 
  FaShieldAlt, 
  FaArrowLeft, 
  FaKey, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaFingerprint
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useTheme } from '../contexts/ThemeContext';

const AdminLogin = () => {
  const { login, lockoutRemaining } = useAdmin();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      triggerShake();
      return;
    }

    if (lockoutRemaining > 0) {
      setError(`Account temporarily locked. Please wait ${lockoutRemaining} seconds.`);
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(username, password, rememberMe);
      if (!result.success) {
        setError(result.error || 'Authentication failed.');
        triggerShake();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 z-20">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-blue-600/20 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          x: shake ? [-10, 10, -8, 8, -4, 4, 0] : 0 
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        {/* Glassmorphism Card */}
        <div className="relative backdrop-blur-2xl bg-white/80 dark:bg-[#121214]/80 border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
          
          {/* Top Decorative Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

          {/* Card Header */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 mb-4"
            >
              <FaShieldAlt className="text-2xl" />
            </motion.div>
            
            <h1 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight font-moderniz">
              Admin Portal
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Secure access to portfolio management dashboard
            </p>
          </div>

          {/* Error Alert Box */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
              >
                <FaExclamationTriangle className="flex-shrink-0 text-base" />
                <span className="flex-1">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lockout Warning */}
          {lockoutRemaining > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-3 text-sm">
              <FaLock className="flex-shrink-0 animate-pulse text-base" />
              <span>Too many failed attempts. Try again in <strong>{lockoutRemaining}s</strong></span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <FaUser className="text-sm" />
                </div>
                <input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  disabled={loading || lockoutRemaining > 0}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <FaLock className="text-sm" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading || lockoutRemaining > 0}
                  className="w-full pl-10 pr-11 py-3 bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:bg-black/40 dark:border-white/20"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">Keep me logged in</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading || lockoutRemaining > 0}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 hover:from-cyan-600 to-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <FaKey className="text-sm" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials Quick-Fill Pill */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-white/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Default Credentials (Click to Autofill):
            </p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-mono border border-cyan-500/20 transition-all"
            >
              <FaFingerprint className="text-xs" />
              <span>admin / admin123</span>
            </button>
          </div>

          {/* Back to Home Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <FaArrowLeft className="text-[10px]" />
              <span>Return to Portfolio</span>
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

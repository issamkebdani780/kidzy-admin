import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle, Loader, BookOpen } from 'lucide-react';
import { login } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Simple card container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col items-center mb-8 text-center">
            {/* Logo */}
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kidzy Admin Panel</h1>
            <p className="text-slate-500 mt-1.5 text-xs font-medium">Manage orders and support messages</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
              >
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span className="font-semibold">{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-slate-700 text-xs font-semibold pl-0.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-slate-250 text-slate-900 placeholder-slate-400 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium shadow-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 text-xs font-semibold pl-0.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-250 text-slate-900 placeholder-slate-400 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium shadow-none"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                'Login'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

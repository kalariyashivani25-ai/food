import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, Mail, Key, User, Sparkles } from 'lucide-react';

export default function Signup({ onToggleAuth }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signup(name, email, password);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 relative overflow-hidden">
      {/* Background glowing blurred decorative nodes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow-radial rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-glow-blue-radial rounded-full pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl brand-glow relative z-10 animate-slide-up">
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 border border-emerald-500/20">
            <Sparkles className="w-8 h-8 animate-pulse-slow" />
          </div>
          <h2 className="text-3xl font-bold font-display text-slate-800 dark:text-white">
            Get Started with <span className="gradient-text">NutriAI</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 text-center">
            Create your account to start tracking calories, meal analysis and fitness advice
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-500 text-xs animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 focus:outline-none focus:border-emerald-500 text-sm transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 focus:outline-none focus:border-emerald-500 text-sm transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 focus:outline-none focus:border-emerald-500 text-sm transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 group mt-2"
          >
            {loading ? 'Registering...' : 'Create Account'}
            <UserPlus className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <button
            onClick={onToggleAuth}
            className="text-emerald-500 font-semibold hover:underline bg-transparent border-none outline-none"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

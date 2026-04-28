import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const SignupPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await signup(email, password, name);
    if (success) navigate('/dashboard');
    setLoading(false);
  }, [email, password, name, signup, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200)',
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <motion.div
        className="relative z-10 w-full max-w-[420px] mx-4 p-10 rounded-[28px]"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #F5A623, #FF8C00)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Zap size={28} className="text-white" />
          </motion.div>
          <h1 className="text-[28px] font-bold text-white">Create Account</h1>
          <p className="text-sm mt-1" style={{ color: '#F5A623' }}>Join SolarSense</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-amber-400/50 transition-colors"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full text-white font-semibold text-lg"
            style={{
              background: 'linear-gradient(135deg, #F5A623, #FF8C00)',
              boxShadow: '0 4px 16px rgba(245,166,35,0.3)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <button onClick={() => navigate('/login')} className="text-white/70 text-sm">
            Already have an account? <span style={{ color: '#F5A623' }}>Sign In</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
});

SignupPage.displayName = 'SignupPage';

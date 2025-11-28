import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

import SEO from './SEO';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error("Database connection failed. Please check environment variables.");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-garage-950 flex items-center justify-center px-4">
      <SEO title="Admin Login" description="Login to Helix Motorcycles admin panel." />
      <div className="max-w-md w-full bg-garage-900 border border-garage-800 p-8 rounded-sm shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-helix italic text-white uppercase tracking-wider">Admin Access</h2>
          <p className="text-garage-400 text-sm mt-2 font-mono">Restricted Area</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-garage-500 uppercase mb-1 font-bold tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none transition-colors"
              placeholder="admin@helixmotorcycles.com"
            />
          </div>

          <div>
            <label className="block text-xs text-garage-500 uppercase mb-1 font-bold tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-bronze-600 hover:bg-bronze-500 text-white font-bold py-3 px-4 rounded-sm uppercase tracking-widest transition-all duration-300"
          >
            Enter Dashboard
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-garage-500 text-xs hover:text-white transition-colors">
            ← Return to Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

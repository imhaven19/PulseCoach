
import React, { useState } from 'react';
import { login } from '../services/auth';
import { User } from '../types';
import { ArrowRight, AlertCircle, Eye, EyeOff, Lock, Mail, ExternalLink } from 'lucide-react';
import Logo from '../components/Logo';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateToVerify: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToSignup, onNavigateToForgotPassword, onNavigateToVerify }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsConfirmation(false);
    setIsLoading(true);
    
    try {
        const user = await login(email, password);
        onLoginSuccess(user);
    } catch (err: any) {
        if (err.message === "CONFIRMATION_REQUIRED") {
            setNeedsConfirmation(true);
            setError("Your email hasn't been verified yet.");
        } else {
            setError(err.message || 'Invalid email or password');
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 p-6 overflow-y-auto transition-colors duration-300">
      <div className="flex-1 flex flex-col justify-center min-h-[500px]">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-6">
             <Logo size={80} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">PulseCoach</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">The Performance OS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Account</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-12 pr-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all font-medium"
                  placeholder="alex@company.com"
                />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-12 pr-12 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
                <button 
                    type="button"
                    onClick={onNavigateToForgotPassword}
                    className="text-[10px] text-primary font-black uppercase tracking-widest hover:text-primary-dark transition-colors"
                >
                    Lost Access?
                </button>
            </div>
          </div>

          {error && (
            <div className="space-y-3">
                <div className="flex items-center gap-3 text-red-600 text-xs bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border-2 border-red-100 dark:border-red-900/30 font-bold uppercase animate-in shake duration-300">
                    <AlertCircle size={18} className="shrink-0" />
                    {error}
                </div>
                {needsConfirmation && (
                    <button 
                        type="button"
                        onClick={() => onNavigateToVerify(email)}
                        className="w-full bg-primary/10 text-primary border border-primary/20 p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                    >
                        <ExternalLink size={14} /> Go to Verification Screen
                    </button>
                )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] mt-6 shadow-2xl shadow-primary/20 uppercase tracking-[0.25em] text-xs disabled:opacity-50"
          >
            {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Log In"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>

      <div className="text-center py-10 mt-auto">
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
          New to the OS?{' '}
          <button onClick={onNavigateToSignup} className="text-primary hover:underline underline-offset-4">
            Join the Cohort
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

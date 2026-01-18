import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
        setIsLoading(false);
        setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-y-auto">
      <div className="mb-8 shrink-0">
        <button 
            onClick={onNavigateToLogin} 
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 mb-4 inline-block transition-colors"
        >
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h1>
        <p className="text-slate-500">Enter your email address and we'll send you instructions to reset your password.</p>
      </div>

      {isSubmitted ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[300px]">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Check your email</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                We have sent password recovery instructions to <strong className="text-slate-700">{email}</strong>.
            </p>
            <button
                onClick={onNavigateToLogin}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 rounded-xl transition-colors"
            >
                Back to Login
            </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail size={20} className="text-slate-400" />
                    </div>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        placeholder="alex@example.com"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center shrink-0 mt-4"
            >
                {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    "Send Reset Link"
                )}
            </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
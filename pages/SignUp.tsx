
import React, { useState, useEffect } from 'react';
import { signup, resendConfirmationEmail } from '../services/auth';
import { User } from '../types';
import { ArrowLeft, Check, Eye, EyeOff, Edit3, Gift, Lock, User as UserIcon, Plus, LogIn, Mail, RefreshCw } from 'lucide-react';

interface SignUpProps {
  onSignUpSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
  initialEmail?: string | null;
}

export default function SignUp({ onSignUpSuccess, onNavigateToLogin, initialEmail }: SignUpProps) {
  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: initialEmail || '',
    password: '',
    confirmPassword: '',
    goal: 'Increase energy',
    equipment: 'None',
    fitnessLevel: 3
  });
  
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [isCustomEquipment, setIsCustomEquipment] = useState(false);
  const predefinedGoals = ['Lose weight', 'Maintain', 'Build muscle', 'Increase energy', 'Reduce back pain'];
  const predefinedEquipment = ['None', 'Bands', 'Dumbbells', 'Full Gym'];

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
      if (initialEmail) {
          setShowConfirmation(true);
      }
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) setReferralCode(ref);
  }, [initialEmail]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("All fields are mandatory");
            return;
        }
        if (formData.password.length < 6) {
             setError("Password must be 6+ characters");
             return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
    }
    if (step === 2) {
        if (!formData.goal.trim()) {
            setError("Please define your goal");
            return;
        }
    }
    if (step === 3) {
        if (!formData.equipment.trim()) {
            setError("Please define your equipment");
            return;
        }
    }
    
    if (step < 3) setStep(prev => prev + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    const { confirmPassword, ...submitData } = formData;
    try {
        const user = await signup(submitData as any);
        if (user) {
            // Success: Either a new signup (auto-confirmed) or an auto-login for an existing user
            onSignUpSuccess(user);
        } else {
            // Confirmation required for a new account
            setShowConfirmation(true);
        }
    } catch (e: any) {
        // If auto-login fails because the existing account is unconfirmed
        if (e.message === "CONFIRMATION_REQUIRED") {
            setShowConfirmation(true);
        } else {
            // General signup errors (including "already registered but wrong password")
            setError(e.message || 'Setup failed. Please try again.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleResend = async () => {
      setResending(true);
      setResendSuccess(false);
      const success = await resendConfirmationEmail(formData.email);
      if (success) {
          setResendSuccess(true);
          setTimeout(() => setResendSuccess(false), 3000);
      } else {
          setError("Could not resend email. Try again later.");
      }
      setResending(false);
  };

  if (showConfirmation) {
      return (
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 p-8 text-center animate-in fade-in duration-500">
              <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                      <Mail size={48} className="text-primary" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter leading-none">Confirm Identity</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed max-w-[280px]">
                      We've sent a verification link to <strong className="text-slate-900 dark:text-white">{formData.email}</strong>. 
                      Click it to activate your PulseCoach OS.
                  </p>

                  <div className="w-full space-y-4 max-w-xs">
                      <button 
                        onClick={handleResend}
                        disabled={resending}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px] shadow-xl"
                      >
                        {resending ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        {resendSuccess ? "Link Sent!" : "Resend Verification"}
                      </button>
                      
                      <button 
                        onClick={onNavigateToLogin}
                        className="w-full bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px]"
                      >
                        <LogIn size={16} /> Back to Login
                      </button>
                  </div>
              </div>
              
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-auto pb-4">
                  Check your spam folder if the email doesn't arrive.
              </p>
          </div>
      );
  }

  const renderStep1 = () => (
    <div className="space-y-4 animate-in slide-in-from-right duration-300">
      {referralCode && (
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-800 p-4 rounded-2xl flex items-center gap-4 mb-6">
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded-xl text-green-600 dark:text-green-300">
                  <Gift size={20} />
              </div>
              <div>
                  <p className="text-xs font-black uppercase tracking-widest text-green-800 dark:text-green-200">Referral Active</p>
                  <p className="text-[10px] text-green-700 dark:text-green-300 font-bold">BONUS: 7-DAY FREE TRIAL UNLOCKED</p>
              </div>
          </div>
      )}

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Professional Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
          placeholder="Alex Johnson"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
          placeholder="alex@example.com"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
            placeholder="Min. 6 characters"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Confirm Access</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            required
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
            placeholder="Re-enter password"
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div>
        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Main Objective</label>
        <div className="grid grid-cols-1 gap-3">
          {predefinedGoals.map(goal => (
            <button
              key={goal}
              onClick={() => { setIsCustomGoal(false); handleChange('goal', goal); }}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                !isCustomGoal && formData.goal === goal 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-black text-xs uppercase tracking-widest">{goal}</span>
                {!isCustomGoal && formData.goal === goal && <Check size={18} strokeWidth={3} />}
              </div>
            </button>
          ))}
          
          <div className={`rounded-2xl border-2 transition-all overflow-hidden ${isCustomGoal ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}>
              <button onClick={() => { setIsCustomGoal(true); handleChange('goal', ''); }} className="w-full p-5 text-left">
                  <div className="flex justify-between items-center">
                    <span className={`font-black text-xs uppercase tracking-widest ${isCustomGoal ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>Custom Goal</span>
                    {isCustomGoal ? <Edit3 size={18} className="text-primary" strokeWidth={3} /> : null}
                  </div>
              </button>
              {isCustomGoal && (
                  <div className="px-5 pb-5 animate-in slide-in-from-top-2">
                      <input 
                        type="text" autoFocus value={formData.goal}
                        onChange={(e) => handleChange('goal', e.target.value)}
                        placeholder="Define your mission..."
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                      />
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-300">
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Equipment Tier</label>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {predefinedEquipment.map(eq => (
            <button
              key={eq} onClick={() => { setIsCustomEquipment(false); handleChange('equipment', eq); }}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                !isCustomEquipment && formData.equipment === eq ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500'
              }`}
            >
              <span className="font-black text-[10px] uppercase tracking-widest">{eq}</span>
            </button>
          ))}
          <button 
            onClick={() => { setIsCustomEquipment(true); handleChange('equipment', ''); }}
            className={`p-4 rounded-2xl border-2 text-center transition-all flex items-center justify-center gap-2 ${
                isCustomEquipment ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500'
            }`}
          >
              <Plus size={14} strokeWidth={3} />
              <span className="font-black text-[10px] uppercase tracking-widest">Custom</span>
          </button>
        </div>

        {isCustomEquipment && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                 <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Describe your gear</label>
                 <input 
                    type="text" 
                    autoFocus 
                    value={formData.equipment}
                    onChange={(e) => handleChange('equipment', e.target.value)}
                    placeholder="e.g. Kettlebells, Yoga Mat, Pull up bar"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
                 />
                 <p className="text-[10px] text-slate-400 font-medium italic px-1">PulseCoach AI will adapt sessions to these specific tools.</p>
            </div>
        )}
      </div>
      
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Fitness Experience</label>
        <div className="flex justify-between gap-3">
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level} onClick={() => handleChange('fitnessLevel', level)}
              className={`flex-1 h-14 rounded-2xl border-2 flex items-center justify-center font-black transition-all ${
                formData.fitnessLevel === level ? 'border-primary bg-primary text-white' : 'border-slate-100 dark:border-slate-800 text-slate-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-3 px-1 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span>Executive</span>
            <span>Athlete</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8 shrink-0">
        {step > 1 ? (
           <button onClick={() => { setError(''); setStep(prev => prev - 1); }} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
             <ArrowLeft size={20} />
           </button>
        ) : <div className="w-10" />}
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-4 bg-slate-100 dark:bg-slate-800'}`} />
          ))}
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter leading-none">
          {step === 1 ? "Initialize" : step === 2 ? "The Mission" : "Calibration"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10">
          {step === 1 ? "Begin your high-performance path" : step === 2 ? "Set your primary target" : "Configure for your environment"}
        </p>

        <div className="flex-1 overflow-y-auto pb-6 scrollbar-hide">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {error && (
            <div className="animate-in shake duration-500 mb-6">
                <div className="text-red-600 text-[10px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-center border-2 border-red-100 dark:border-red-900/30">
                  {error}
                </div>
                {error.includes('password') && (
                    <button 
                        onClick={onNavigateToLogin}
                        className="w-full mt-3 flex items-center justify-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest bg-primary/5 p-3 rounded-xl border border-primary/20 hover:bg-primary/10 transition-colors"
                    >
                        <LogIn size={14} /> Correct Your Password
                    </button>
                )}
            </div>
        )}

        <button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-primary text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] mt-auto uppercase tracking-[0.2em] text-xs disabled:opacity-50"
        >
          {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (step === 3 ? "Sign Up" : "Next")}
          {!isLoading && step === 3 ? <Lock size={18} /> : !isLoading && <ArrowLeft className="rotate-180" size={18} />}
        </button>
      </div>
      
      {step === 1 && (
        <div className="text-center py-6 shrink-0">
          <button onClick={onNavigateToLogin} className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">
            Already registered? <span className="text-primary underline">Log In</span>
          </button>
        </div>
      )}
    </div>
  );
}

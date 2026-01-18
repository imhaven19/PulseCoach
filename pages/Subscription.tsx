
import React, { useState, useEffect } from 'react';
import { Check, Star, Crown, ArrowLeft, Loader2, CreditCard, Lock, Bitcoin, X, ShieldCheck, Zap, Info, ArrowRight, Shield, Sparkles, AlertCircle, Camera, Brain, CalendarClock } from 'lucide-react';
import { User } from '../types';
import { startSubscription, setPendingTransaction, clearPendingTransaction } from '../services/auth';
import { processStripeSubscription, isStripeConfigured } from '../services/stripe';
import { createInvoice } from '../services/nowpayments';
import Logo from '../components/Logo';

interface SubscriptionProps {
  user: User;
  onBack: () => void;
  onUpgradeSuccess: (user: User) => void;
}

type PlanType = 'free' | 'starter' | 'premium';

const Subscription: React.FC<SubscriptionProps> = ({ user, onBack, onUpgradeSuccess }) => {
  const [view, setView] = useState<'plans' | 'review'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('starter');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');
  const [isLoading, setIsLoading] = useState(false);
  const [preCheckoutStep, setPreCheckoutStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Default to 3 days, or 7 if referred as a bonus
  const trialDays = user.referredBy ? 7 : 3;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('success') === 'true';
    const planFromUrl = params.get('plan') as PlanType;
    
    if (isSuccess) {
        setIsLoading(true);
        const completeActivation = async () => {
            try {
                const planToActivate: 'starter' | 'premium' = (planFromUrl === 'starter' || planFromUrl === 'premium') 
                    ? planFromUrl 
                    : 'premium';
                
                // Set isTrial to true so the DB reflects the 3-day window
                const updatedUser = await startSubscription(user.id, true, planToActivate);
                if (updatedUser) {
                    clearPendingTransaction();
                    window.history.replaceState({}, '', window.location.pathname);
                    onUpgradeSuccess(updatedUser);
                }
            } catch (err) {
                console.error("Subscription activation failed", err);
            } finally {
                setIsLoading(false);
            }
        };
        setTimeout(completeActivation, 1500);
    }
  }, [user.id, onUpgradeSuccess]);

  const handleCheckout = async () => {
    setIsLoading(true);
    setPreCheckoutStep("Verifying eligibility...");
    setError(null);

    const steps = [
        "Applying 3-day trial access...", 
        "Securing payment gateway...", 
        "Preparing your professional OS..."
    ];
    
    for (const step of steps) {
        await new Promise(r => setTimeout(r, 600));
        setPreCheckoutStep(step);
    }

    try {
        if (paymentMethod === 'stripe') {
            const orderId = `st_${Date.now()}`;
            setPendingTransaction(orderId, 'stripe');
            
            // If Stripe isn't configured with real keys, we use a simulation bypass
            if (!isStripeConfigured()) {
                window.location.href = `${window.location.origin}?success=true&method=stripe&plan=${selectedPlan}`;
                return;
            }

            if (selectedPlan === 'free') return;
            await processStripeSubscription(user.email, trialDays, selectedPlan);
        } else {
            // Crypto typically doesn't support trials, so we warn the user
            if (selectedPlan === 'starter') {
                throw new Error("Starter plan only available via Card/Apple Pay.");
            }
            const amount = 29.99;
            const orderId = `pc_${Date.now()}`;
            setPendingTransaction(orderId, 'crypto');
            const inv = await createInvoice(amount, orderId, "PulseCoach Pro (Direct Access)");
            if (inv?.invoice_url) {
                window.location.href = inv.invoice_url;
            } else {
                throw new Error("Crypto gateway connection timed out.");
            }
        }
    } catch (err: any) {
        setError(err.message || "Checkout failed. Please try another method.");
        clearPendingTransaction();
        setIsLoading(false);
        setPreCheckoutStep(null);
    }
  };

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Basic',
      price: '0',
      features: ['3 AI Workouts / Day', 'Text Chat Coach', 'Basic Tracking'],
      limit: 'No Voice or Advanced AI',
      color: 'bg-white',
      textColor: 'text-slate-900',
      button: 'Current'
    },
    {
      id: 'starter' as PlanType,
      name: 'Starter',
      price: '9.99',
      features: ['Unlimited AI Workouts', '20m Daily Voice Sessions', 'Meeting Recovery Sync', 'Calendar Optimization'],
      limit: 'Voice sessions capped',
      color: 'bg-white dark:bg-slate-900',
      textColor: 'text-slate-900 dark:text-white',
      button: 'Start 3-Day Free Trial',
      badge: 'Popular Choice'
    },
    {
      id: 'premium' as PlanType,
      name: 'Pro',
      price: '29.99',
      features: ['Snap & Fuel: AI Vision Nutrition', 'Bio-Hacker Performance Reports', 'Unlimited Gemini Live Coach', 'Full Schedule AI Gap Analysis'],
      limit: 'The Elite OS',
      color: 'bg-slate-900 dark:bg-black',
      textColor: 'text-white',
      button: 'Start 3-Day Free Trial',
      badge: 'Executive Elite'
    }
  ];

  const currentPlanDetails = plans.find(p => p.id === selectedPlan);

  if (isLoading && preCheckoutStep) {
      return (
          <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
              <div className="relative mb-8">
                  <div className="w-24 h-24 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck size={32} className="text-primary" />
                  </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Safe & Secure</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">{preCheckoutStep}</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />

      <div className="p-6 shrink-0 flex items-center justify-between sticky top-0 bg-transparent z-20">
        <button onClick={view === 'review' ? () => setView('plans') : onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">Professional Tiers</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 relative z-10 scrollbar-hide">
        {view === 'plans' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mt-4">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter leading-none">Limitless Fitness</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Try any professional plan free for 3 days</p>
                </div>

                <div className="space-y-4">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id}
                            className={`${plan.color} ${plan.textColor} border-2 ${plan.id === user.subscriptionStatus ? 'border-primary' : 'border-slate-100 dark:border-slate-800'} rounded-[32px] p-7 relative overflow-hidden transition-all shadow-xl`}
                        >
                            {plan.badge && (
                                <div className="absolute top-0 right-0 px-5 py-1.5 bg-primary text-white text-[9px] font-black uppercase rounded-bl-2xl tracking-[0.2em]">
                                    {plan.badge}
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-1">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black tracking-tighter">${plan.price}</span>
                                        {plan.price !== '0' && <span className="text-sm font-bold opacity-60">/mo</span>}
                                    </div>
                                    {plan.price !== '0' && (
                                        <p className="text-[10px] font-black uppercase text-primary mt-1 flex items-center gap-1">
                                            <CalendarClock size={10} /> includes 3-day trial
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    {plan.id === 'premium' ? <Crown className="text-primary" fill="currentColor" size={24} /> : plan.id === 'starter' ? <Sparkles className="text-primary" size={24} /> : <Star className="text-slate-300" size={24} />}
                                </div>
                            </div>
                            
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold opacity-90">
                                        <div className="p-1 rounded-full bg-primary/15 text-primary">
                                            <Check size={12} strokeWidth={4} /> 
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {plan.id !== user.subscriptionStatus ? (
                                <button 
                                    onClick={() => { setSelectedPlan(plan.id); setView('review'); setPaymentMethod('stripe'); }}
                                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                                        plan.id === 'premium' ? 'bg-primary text-white shadow-2xl shadow-primary/40' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                    }`}
                                >
                                    {plan.button} <ArrowRight size={18} strokeWidth={3} />
                                </button>
                            ) : (
                                <div className="w-full py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Check size={18} strokeWidth={4} /> Current Status
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-sm mx-auto h-full flex flex-col">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-slate-900 dark:bg-white rounded-[24px] flex items-center justify-center mx-auto mb-5 shadow-2xl">
                        {selectedPlan === 'premium' ? <Crown className="text-primary" size={32} fill="currentColor" /> : <Sparkles className="text-primary" size={32} />}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Confirm Trial</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Unlock all {selectedPlan} benefits</p>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-2xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 bg-primary/10 rounded-bl-3xl">
                        <Star className="text-primary" size={20} fill="currentColor" />
                    </div>
                    
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-6">Trial Timeline</h3>
                    
                    <div className="space-y-6 mb-8">
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                                    <Check size={12} strokeWidth={4} />
                                </div>
                                <div className="w-0.5 h-10 bg-primary/20 my-1" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">Today: Unlock Access</p>
                                <p className="text-xs text-slate-500 font-bold">Instantly start workouts and coaching. $0.00 due today.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-primary">
                                    <Zap size={12} strokeWidth={4} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">Day 3: Auto-Renewal</p>
                                <p className="text-xs text-slate-500 font-bold">Your card will be charged ${currentPlanDetails?.price} to continue access.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t-2 border-slate-50 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Monthly After Trial</span>
                        <div className="flex items-baseline gap-1">
                             <span className="text-3xl font-black text-slate-900 dark:text-white">${currentPlanDetails?.price}</span>
                             <span className="text-xs font-bold text-slate-400">/mo</span>
                        </div>
                    </div>
                </div>

                {selectedPlan === 'premium' && (
                    <div className="space-y-3 mb-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Payment Option</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setPaymentMethod('stripe')}
                                className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
                                    paymentMethod === 'stripe' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 dark:border-slate-800 opacity-60'
                                }`}
                            >
                                <CreditCard size={24} className={paymentMethod === 'stripe' ? 'text-primary' : 'text-slate-400'} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Card</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('crypto')}
                                className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
                                    paymentMethod === 'crypto' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 dark:border-slate-800 opacity-60'
                                }`}
                            >
                                <Bitcoin size={24} className={paymentMethod === 'crypto' ? 'text-[#F7931A]' : 'text-slate-400'} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Crypto</span>
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 text-xs mb-6 border-2 border-red-100 dark:border-red-900/30 animate-in shake duration-500 font-bold uppercase">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="mt-auto space-y-6">
                    <button 
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="w-full bg-primary text-white font-black py-6 rounded-[24px] flex items-center justify-center gap-4 shadow-2xl shadow-primary/40 active:scale-[0.98] transition-all disabled:opacity-50 text-base uppercase tracking-[0.15em]"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} strokeWidth={3} />}
                        {isLoading ? "Validating..." : `Start 3-Day Free Trial`}
                    </button>
                    
                    <div className="flex flex-col items-center gap-2 opacity-30 pb-4">
                        <div className="flex items-center gap-2">
                            <Shield size={12} />
                            <span className="text-[8px] font-black uppercase tracking-[0.25em]">Encrypted Verification • Cancel Anytime</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;

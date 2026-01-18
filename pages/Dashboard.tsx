import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Briefcase, Sparkles, BrainCircuit, RefreshCw, Loader2, Lock, Crown, Camera, Target, Activity, CalendarDays } from 'lucide-react';
import { User, WorkoutSession, CalendarEvent, AppRoute } from '../types';
import { generateWorkout, analyzeSchedule } from '../services/gemini';
import { getPendingTransaction, clearPendingTransaction, startSubscription, toggleCalendarConnection } from '../services/auth';
import { checkPaymentStatus as checkNowPaymentsStatus } from '../services/nowpayments';
import { NotificationService } from '../services/notifications';

interface DashboardProps {
  user: User;
  onStartSession: (session: WorkoutSession) => void;
  onNavigateToSettings: () => void;
  onNavigateToSubscription: () => void;
  onUserUpdate: (user: User) => void;
  onNavigateToPage: (route: AppRoute) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartSession, onNavigateToSettings, onNavigateToSubscription, onUserUpdate, onNavigateToPage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [scheduleInsight, setScheduleInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isPro = user.subscriptionStatus === 'premium';
  const isStarter = user.subscriptionStatus === 'starter';
  const hasCalendarAccess = isPro || isStarter;

  const runScheduleAnalysis = useCallback(async () => {
    if (hasCalendarAccess && user.is_calendar_connected && user.calendarEvents) {
        setIsAnalyzing(true);
        try {
            const insight = await analyzeSchedule(user.calendarEvents, user.goal);
            setScheduleInsight(insight);

            if (user.notifications_enabled && (insight.toLowerCase().includes("gap") || insight.toLowerCase().includes("between"))) {
                NotificationService.sendLocalNotification(
                    "Performance Gap Found", 
                    insight,
                    '/coach'
                );
            }
        } finally {
            setIsAnalyzing(false);
        }
    }
  }, [hasCalendarAccess, user.is_calendar_connected, user.calendarEvents, user.goal, user.notifications_enabled]);

  useEffect(() => {
    runScheduleAnalysis();
  }, [runScheduleAnalysis]);

  useEffect(() => {
    const checkRecovery = async () => {
        const pending = getPendingTransaction();
        if (pending && user.subscriptionStatus === 'free') {
            setIsVerifyingPayment(true);
            try {
                if (pending.method === 'crypto') {
                    const isPaid = await checkNowPaymentsStatus(pending.orderId);
                    if (isPaid) {
                        const updatedUser = await startSubscription(user.id, false, 'premium');
                        if (updatedUser) onUserUpdate(updatedUser);
                    }
                }
                if (Date.now() - pending.timestamp > 3600000) {
                    clearPendingTransaction();
                }
            } catch (e) {
                console.error("Recovery check failed", e);
            } finally {
                setIsVerifyingPayment(false);
            }
        }
    };
    checkRecovery();
  }, [user.id, user.subscriptionStatus, onUserUpdate]);

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleGenerate = async (duration?: number, focus?: string) => {
    setIsLoading(true);
    const session = await generateWorkout(user, duration, focus);
    if (session) {
      onStartSession(session);
    } else {
        alert("Daily limit reached or API error.");
    }
    setIsLoading(false);
  };

  const handleSyncCalendar = async () => {
      if (!hasCalendarAccess) {
          onNavigateToSubscription();
          return;
      }
      const updatedUser = await toggleCalendarConnection(user.id);
      if (updatedUser) onUserUpdate(updatedUser);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <header className="px-6 py-6 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shrink-0 sticky top-0 z-20">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">PulseCoach</h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-primary font-black uppercase tracking-widest">{dayName}</span>
            <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fullDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
             <button 
                onClick={() => isPro ? onNavigateToPage(AppRoute.MEAL_SCAN) : onNavigateToSubscription()}
                className="group relative w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:border-primary/50"
             >
                <Camera size={20} className="text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors" />
                {!isPro && <div className="absolute -top-1 -right-1 bg-amber-500 p-0.5 rounded-md border-2 border-white dark:border-slate-900"><Lock size={8} className="text-white" /></div>}
             </button>
             <button 
                onClick={onNavigateToSettings} 
                className="w-11 h-11 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs shadow-xl active:scale-95 transition-all overflow-hidden border-2 border-slate-100 dark:border-slate-800"
             >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
             </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 scrollbar-hide pb-24">
        
        {/* Bio-Performance Card */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <BrainCircuit size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20 backdrop-blur-md">
                            System: {user.subscriptionStatus}
                        </div>
                        {isPro && <Crown size={14} className="text-amber-400" fill="currentColor" />}
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Snap Your Fuel</h2>
                    <p className="text-slate-400 text-xs mb-8 max-w-[220px] font-bold uppercase tracking-widest leading-relaxed">Let AI Vision analyze your nutrition impact instantly.</p>
                    <button 
                        onClick={() => isPro ? onNavigateToPage(AppRoute.MEAL_SCAN) : onNavigateToSubscription()}
                        className="bg-white text-slate-950 font-black py-4 px-10 rounded-[24px] flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                    >
                        <Camera size={18} strokeWidth={3} />
                        {isPro ? "Scan Meal" : "Unlock Vision"}
                    </button>
                </div>
            </div>
        </section>

        {/* Schedule Insights Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <CalendarDays size={14} /> Schedule Analysis
                </h2>
                {hasCalendarAccess && (
                    <button onClick={handleSyncCalendar} className="text-[10px] font-black text-primary uppercase flex items-center gap-1.5 active:scale-90 transition-all">
                        <RefreshCw size={12} className={isAnalyzing ? 'animate-spin' : ''} /> 
                        {isAnalyzing ? 'Analyzing...' : 'Refresh'}
                    </button>
                )}
            </div>
            
            <div className={`bg-white dark:bg-slate-900 rounded-[40px] p-7 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all ${!hasCalendarAccess ? 'group' : ''}`}>
                {!hasCalendarAccess && (
                    <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                        <div className="w-14 h-14 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                            <Lock size={24} className="text-white dark:text-slate-900" />
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest leading-relaxed">Sync Meetings for AI-Optimized Recovery</p>
                        <button 
                            onClick={onNavigateToSubscription}
                            className="bg-primary text-white text-[10px] font-black uppercase px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                        >
                            Unlock Planner
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                     {isAnalyzing ? (
                        <div className="flex flex-col items-center py-6 gap-3 animate-pulse">
                            <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Scanning Calendar Blocks...</p>
                        </div>
                     ) : user.is_calendar_connected && scheduleInsight ? (
                        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 p-5 rounded-3xl mb-2 animate-in fade-in zoom-in-95 duration-500">
                             <div className="flex items-center gap-2 text-primary mb-3">
                                <Sparkles size={16} fill="currentColor" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Coach Insight</span>
                             </div>
                             <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                                "{scheduleInsight}"
                             </p>
                        </div>
                     ) : null}

                     {user.calendarEvents && user.calendarEvents.length > 0 ? (
                         <div className="space-y-3">
                            {user.calendarEvents.slice(0, 3).map((event, idx) => (
                                <div key={event.id} className="flex items-center gap-5 group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="flex flex-col items-end w-14 shrink-0">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-tighter">{event.startTime}</span>
                                        <div className="w-1 h-3 bg-slate-100 dark:bg-slate-800 my-1 rounded-full group-last:hidden" />
                                    </div>
                                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/30">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{event.title}</p>
                                            <Briefcase size={12} className="text-slate-400 shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                         </div>
                     ) : !isAnalyzing && (
                         <div className="text-center py-6">
                             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto mb-5 border border-slate-100 dark:border-slate-800">
                                <CalendarDays size={32} className="text-slate-300 dark:text-slate-600" />
                             </div>
                             <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black mb-6 uppercase tracking-widest">Connect Calendar to Sync Gaps</p>
                             <button onClick={handleSyncCalendar} disabled={!hasCalendarAccess} className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                                 Authorize Access
                             </button>
                         </div>
                     )}
                </div>
            </div>
        </section>

        {/* Quick Launch Workout */}
        <section className="relative group animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-blue-600/40 rounded-[40px] transform translate-y-4 scale-95 opacity-50 blur-2xl group-hover:opacity-80 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 p-10 text-center overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Target size={32} className="text-primary" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-3">Instant Training</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-10 uppercase tracking-[0.2em]">High Impact • Zero Friction</p>
              <button 
                onClick={() => handleGenerate()} 
                disabled={isLoading} 
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-6 rounded-[28px] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-[0.98] uppercase tracking-[0.25em] text-xs"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} fill="currentColor" />}
                {isLoading ? "Analyzing History..." : "Generate Session"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
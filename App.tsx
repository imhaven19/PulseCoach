import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Coach from './pages/Coach';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import WorkoutSessionPlayer from './pages/WorkoutSession';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Subscription from './pages/Subscription';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LoadingScreen from './components/LoadingScreen';
import MealScan from './pages/MealScan';
import { AppRoute, User, WorkoutSession } from './types';
import { getCurrentUser, logout, addWorkoutLog } from './services/auth';
import { supabase } from './services/supabase';
import { WifiOff } from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [authStep, setAuthStep] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    // Monitor connectivity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Supabase Auth State Listener
    const fetchUser = async () => {
      setIsLoading(true);
      const authUser = await getCurrentUser();
      setUser(authUser);
      setIsLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const authUser = await getCurrentUser();
        setUser(authUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
        subscription.unsubscribe();
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('pulsecoach_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pulsecoach_theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('pulsecoach_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAuthStep('login');
    setCurrentRoute(AppRoute.DASHBOARD);
  };

  const handleSessionComplete = async (session: WorkoutSession) => {
    if (user) {
        const updatedUser = await addWorkoutLog(user.id, {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            duration: session.totalDuration,
            focus: session.focus,
            title: session.title,
            difficulty: session.difficulty
        });
        if (updatedUser) setUser(updatedUser);
    }
    setActiveSession(null);
    setCurrentRoute(AppRoute.PROGRESS);
  };

  const navigateToVerify = (email: string) => {
    setPendingEmail(email);
    setAuthStep('signup');
  };

  if (isLoading) {
      return <div className="h-screen w-full flex justify-center"><LoadingScreen /></div>;
  }

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex justify-center transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full relative flex flex-col shadow-2xl transition-colors duration-300">
            
            {/* Offline Banner */}
            {!isOnline && (
                <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300 z-[100]">
                    <WifiOff size={14} /> Offline Mode - AI Features Restricted
                </div>
            )}

            {!user ? (
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {authStep === 'login' && (
                        <Login 
                            onLoginSuccess={setUser} 
                            onNavigateToSignup={() => { setPendingEmail(null); setAuthStep('signup'); }} 
                            onNavigateToForgotPassword={() => setAuthStep('forgot-password')} 
                            onNavigateToVerify={navigateToVerify}
                        />
                    )}
                    {authStep === 'signup' && (
                        <SignUp 
                            onSignUpSuccess={setUser} 
                            onNavigateToLogin={() => setAuthStep('login')} 
                            initialEmail={pendingEmail}
                        />
                    )}
                    {authStep === 'forgot-password' && <ForgotPassword onNavigateToLogin={() => setAuthStep('login')} />}
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-hidden relative flex flex-col">
                        {(() => {
                            switch (currentRoute) {
                                case AppRoute.ADMIN:
                                    return <AdminPanel user={user} onBack={() => setCurrentRoute(AppRoute.PROFILE)} />;
                                case AppRoute.DASHBOARD:
                                    return <Dashboard user={user} onStartSession={setActiveSession} onNavigateToSettings={() => setCurrentRoute(AppRoute.PROFILE)} onNavigateToSubscription={() => setCurrentRoute(AppRoute.SUBSCRIPTION)} onUserUpdate={setUser} onNavigateToPage={setCurrentRoute} />;
                                case AppRoute.COACH:
                                    return <Coach user={user} onNavigateToSubscription={() => setCurrentRoute(AppRoute.SUBSCRIPTION)} />;
                                case AppRoute.PROGRESS:
                                    return <Progress user={user} />;
                                case AppRoute.PROFILE:
                                    return <Profile user={user} onNavigateToSubscription={() => setCurrentRoute(AppRoute.SUBSCRIPTION)} onNavigateToAdmin={() => setCurrentRoute(AppRoute.ADMIN)} onNavigateToLegal={setCurrentRoute} onUserUpdate={setUser} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />;
                                case AppRoute.SUBSCRIPTION:
                                    return <Subscription user={user} onBack={() => setCurrentRoute(AppRoute.PROFILE)} onUpgradeSuccess={setUser} />;
                                case AppRoute.TERMS:
                                    return <TermsOfService onBack={() => setCurrentRoute(AppRoute.PROFILE)} />;
                                case AppRoute.PRIVACY:
                                    return <PrivacyPolicy onBack={() => setCurrentRoute(AppRoute.PROFILE)} />;
                                case AppRoute.MEAL_SCAN:
                                    return <MealScan user={user} onBack={() => setCurrentRoute(AppRoute.DASHBOARD)} onUserUpdate={setUser} />;
                                default:
                                    return <Dashboard user={user} onStartSession={setActiveSession} onNavigateToSettings={() => setCurrentRoute(AppRoute.PROFILE)} onNavigateToSubscription={() => setCurrentRoute(AppRoute.SUBSCRIPTION)} onUserUpdate={setUser} onNavigateToPage={setCurrentRoute} />;
                            }
                        })()}
                    </div>
                    {!isKeyboardVisible && !activeSession && 
                     currentRoute !== AppRoute.SUBSCRIPTION && 
                     currentRoute !== AppRoute.ADMIN && 
                     currentRoute !== AppRoute.TERMS && 
                     currentRoute !== AppRoute.PRIVACY && 
                     currentRoute !== AppRoute.MEAL_SCAN &&
                     <Navigation currentRoute={currentRoute} onNavigate={setCurrentRoute} />}
                    {activeSession && <WorkoutSessionPlayer session={activeSession} onClose={() => setActiveSession(null)} onComplete={() => handleSessionComplete(activeSession)} />}
                </>
            )}
        </div>
    </div>
  );
};
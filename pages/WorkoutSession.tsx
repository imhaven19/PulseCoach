
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Pause, Play, CheckCircle, Dumbbell, Heart, Activity, Coffee, Zap, Wind } from 'lucide-react';
import { WorkoutSession, Exercise } from '../types';

interface WorkoutSessionProps {
  session: WorkoutSession;
  onComplete: () => void;
  onClose: () => void;
}

// --- Enhanced Immersive Visualizers ---

const StrengthVisualizer = ({ isActive }: { isActive: boolean }) => (
  <div className="relative w-32 h-32 flex items-center justify-center">
    <style>{`
      @keyframes strength-lift {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-25px) scale(1.1); }
      }
      @keyframes power-glow {
        0%, 100% { filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.3)); opacity: 0.6; }
        50% { filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.8)); opacity: 1; }
      }
      @keyframes orbit {
        from { transform: rotate(0deg) translateX(50px) rotate(0deg); }
        to { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
      }
      .animate-strength-lift { animation: strength-lift 1.8s ease-in-out infinite; }
      .animate-power-glow { animation: power-glow 1.8s ease-in-out infinite; }
      .animate-orbit { animation: orbit 3s linear infinite; }
    `}</style>
    
    {/* Aura Rings */}
    <div className={`absolute inset-0 border-4 border-violet-500/10 rounded-full ${isActive ? 'animate-pulse' : ''}`} />
    <div className={`absolute inset-4 border-2 border-violet-500/5 rounded-full ${isActive ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
    
    <div className={`relative p-8 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-500 z-10 ${isActive ? 'animate-strength-lift animate-power-glow shadow-2xl shadow-violet-500/20' : ''}`}>
      <Dumbbell size={56} />
    </div>

    {isActive && (
      <>
        <div className="absolute w-2 h-2 bg-violet-400 rounded-full animate-orbit opacity-60" style={{ animationDelay: '0s' }} />
        <div className="absolute w-2 h-2 bg-violet-400 rounded-full animate-orbit opacity-40" style={{ animationDelay: '-1.5s' }} />
        <div className="absolute inset-0 border-t-2 border-violet-500/30 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
      </>
    )}
  </div>
);

const CardioVisualizer = ({ isActive }: { isActive: boolean }) => (
  <div className="relative w-32 h-32 flex items-center justify-center">
    <style>{`
      @keyframes cardio-pulse {
        0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.2)); }
        15% { transform: scale(1.2); filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.6)); }
        30% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.2)); }
        45% { transform: scale(1.15); filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.5)); }
        60% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.2)); }
        100% { transform: scale(1); }
      }
      @keyframes sonar {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      .animate-cardio-pulse { animation: cardio-pulse 1.2s ease-in-out infinite; }
      .animate-sonar { animation: sonar 1.5s ease-out infinite; }
    `}</style>
    
    {isActive && (
      <>
        <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-sonar" />
        <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-sonar" style={{ animationDelay: '0.5s' }} />
      </>
    )}

    <div className={`relative p-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 z-10 ${isActive ? 'animate-cardio-pulse shadow-xl shadow-red-500/10' : ''}`}>
      <Heart size={56} className={isActive ? 'fill-red-500' : ''} />
    </div>

    {isActive && (
      <div className="absolute bottom-0 w-full flex justify-center gap-1 opacity-40">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    )}
  </div>
);

const MobilityVisualizer = ({ isActive }: { isActive: boolean }) => (
  <div className="relative w-32 h-32 flex items-center justify-center">
    <style>{`
      @keyframes mobility-flow {
        0% { transform: rotate(0deg) scale(1); border-radius: 50%; }
        33% { transform: rotate(120deg) scale(1.1); border-radius: 40% 60% 50% 50%; }
        66% { transform: rotate(240deg) scale(0.95); border-radius: 50% 50% 40% 60%; }
        100% { transform: rotate(360deg) scale(1); border-radius: 50%; }
      }
      @keyframes zen-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-mobility-flow { animation: mobility-flow 6s ease-in-out infinite; }
      .animate-zen-spin { animation: zen-spin 10s linear infinite; }
    `}</style>
    
    <div className={`absolute inset-0 border-2 border-emerald-400/20 border-dashed rounded-full ${isActive ? 'animate-zen-spin' : ''}`} />
    
    <div className={`relative p-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 z-10 flex items-center justify-center ${isActive ? 'animate-mobility-flow shadow-xl shadow-emerald-500/10' : ''}`}>
      <Activity size={56} />
    </div>

    {isActive && (
      <div className="absolute inset-0">
        <Wind size={24} className="absolute top-0 left-1/2 -translate-x-1/2 text-emerald-300 opacity-40 animate-pulse" />
        <Wind size={24} className="absolute bottom-0 left-1/2 -translate-x-1/2 text-emerald-300 opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    )}
  </div>
);

const RestVisualizer = ({ isActive }: { isActive: boolean }) => (
  <div className="relative w-32 h-32 flex items-center justify-center">
    <style>{`
      @keyframes steam-rise {
        0% { transform: translateY(0) scale(1); opacity: 0; }
        20% { opacity: 0.7; }
        100% { transform: translateY(-30px) scale(1.5); opacity: 0; }
      }
      @keyframes calm-pulse {
        0%, 100% { transform: scale(1); opacity: 0.1; }
        50% { transform: scale(1.3); opacity: 0.3; }
      }
      .animate-steam { animation: steam-rise 2.5s ease-out infinite; }
      .animate-calm { animation: calm-pulse 4s ease-in-out infinite; }
    `}</style>
    
    <div className={`absolute inset-0 bg-blue-400 rounded-full animate-calm ${isActive ? '' : 'hidden'}`} />
    
    <div className={`relative p-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 z-10 ${isActive ? 'shadow-xl shadow-blue-500/10 transition-transform duration-1000' : ''}`}>
      <Coffee size={56} />
      
      {isActive && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full flex justify-center gap-3">
          <div className="w-1.5 h-4 bg-blue-200 rounded-full animate-steam" style={{ animationDelay: '0s' }} />
          <div className="w-1.5 h-4 bg-blue-200 rounded-full animate-steam" style={{ animationDelay: '0.8s' }} />
          <div className="w-1.5 h-4 bg-blue-200 rounded-full animate-steam" style={{ animationDelay: '1.6s' }} />
        </div>
      )}
    </div>
  </div>
);

const ExerciseVisualizer = ({ type, isActive }: { type: string; isActive: boolean }) => {
  switch (type) {
    case 'strength':
      return <StrengthVisualizer isActive={isActive} />;
    case 'cardio':
      return <CardioVisualizer isActive={isActive} />;
    case 'mobility':
      return <MobilityVisualizer isActive={isActive} />;
    case 'rest':
      return <RestVisualizer isActive={isActive} />;
    default:
      return (
        <div className={`p-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 ${isActive ? 'animate-pulse' : ''}`}>
          <Activity size={56} />
        </div>
      );
  }
};

const WorkoutSessionPlayer: React.FC<WorkoutSessionProps> = ({ session, onComplete, onClose }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(session.exercises[0].duration);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentExercise = session.exercises[currentExerciseIndex];
  const totalExercises = session.exercises.length;
  const progress = ((currentExerciseIndex) / totalExercises) * 100;

  useEffect(() => {
    setTimeLeft(currentExercise.duration);
    setIsPlaying(true);
  }, [currentExerciseIndex, currentExercise]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNext();
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const handleNext = () => {
    if (currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    setIsFinished(true);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getThemeColor = (type: string) => {
    switch(type) {
      case 'strength': return '#8b5cf6'; // violet-500
      case 'cardio': return '#ef4444';   // red-500
      case 'mobility': return '#10b981'; // emerald-500
      case 'rest': return '#3b82f6';     // blue-500
      default: return '#00B8A9';         // primary
    }
  };

  const themeColor = getThemeColor(currentExercise.type);

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-primary z-[100] flex flex-col items-center justify-center text-white p-6 animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Session Complete!</h1>
        <p className="text-white/80 mb-8 text-center">You crushed that {session.totalDuration} min session.</p>
        <button 
          onClick={onComplete}
          className="w-full max-w-xs bg-white text-primary font-bold py-4 rounded-xl shadow-lg hover:bg-slate-50 transition-colors"
        >
          Save Progress
        </button>
      </div>
    )
  }

  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const timerProgress = timeLeft / currentExercise.duration;
  const dashOffset = circumference * (1 - timerProgress);

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[100] flex flex-col overflow-hidden transition-colors duration-300">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 transition-colors duration-1000" style={{ background: `radial-gradient(circle at center, ${themeColor} 0%, transparent 70%)` }} />

      {/* Top Bar */}
      <div className="px-6 py-6 flex items-center justify-between shrink-0 relative z-10">
        <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 hover:text-slate-600 transition-colors border border-slate-100 dark:border-slate-800">
          <X size={20} />
        </button>
        <div className="flex-1 mx-6">
          <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, backgroundColor: themeColor }}
            />
          </div>
        </div>
        <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-full text-xs font-black text-slate-500 border border-slate-100 dark:border-slate-800">
          {currentExerciseIndex + 1}/{totalExercises}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-0 overflow-y-auto relative z-10">
        
        {/* Enhanced Timer Visualizer */}
        <div className="mb-12 relative flex items-center justify-center shrink-0">
          <svg width="320" height="320" className="transform -rotate-90">
            {/* Soft Shadow Ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-50 dark:text-slate-900/50"
            />
            {/* Background Ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-100 dark:text-slate-900"
            />
            {/* Progress Ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke={themeColor}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
              style={{ filter: `drop-shadow(0 0 8px ${themeColor}40)` }}
            />
          </svg>
           
          {/* Inner Content - Larger Visualizer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="mb-4">
              <ExerciseVisualizer type={currentExercise.type} isActive={isPlaying} />
            </div>
            <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1 bg-slate-50 dark:bg-slate-900 px-3 py-0.5 rounded-full border border-slate-100 dark:border-slate-800">
                {currentExercise.type}
                </span>
            </div>
          </div>
        </div>

        <div className="max-w-md w-full animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{currentExercise.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-8 px-4">{currentExercise.description}</p>
            
          {currentExercise.reps && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-200 shadow-xl shadow-slate-200/20 dark:shadow-none">
              <Zap size={16} className="text-yellow-500" fill="currentColor" />
              Target: {currentExercise.reps}
            </div>
          )}
        </div>
      </div>

      {/* Modern Controls */}
      <div className="px-8 py-10 pb-12 bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-slate-900 shrink-0 relative z-10">
        <div className="flex items-center justify-between gap-6 max-w-md mx-auto">
          <button 
            className="w-20 h-20 flex items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all active:scale-90 shadow-lg"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>

          <button 
            className="flex-1 h-20 text-white font-black text-lg rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xl hover:brightness-110"
            style={{ backgroundColor: themeColor, boxShadow: `0 20px 40px -10px ${themeColor}40` }}
            onClick={handleNext}
          >
            {currentExerciseIndex === totalExercises - 1 ? 'Finish Session' : 'Next Move'}
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSessionPlayer;

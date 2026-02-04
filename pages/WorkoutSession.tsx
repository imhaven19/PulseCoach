import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Pause, Play, CheckCircle, Dumbbell, Heart, Activity, Coffee, Zap, Wind, SkipForward } from 'lucide-react';
import { WorkoutSession, Exercise } from '../types';

interface WorkoutSessionProps {
  session: WorkoutSession;
  onComplete: () => void;
  onClose: () => void;
}

// --- Countdown Screen Component ---
const CountdownScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center">
      <style>{`
        @keyframes countdown-pulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ring-expand {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .countdown-number { animation: countdown-pulse 0.5s ease-out; }
        .countdown-ring { animation: ring-expand 1s ease-out infinite; }
      `}</style>
      
      <div className="relative">
        {/* Expanding rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 border-4 border-primary/30 rounded-full countdown-ring" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 border-4 border-primary/20 rounded-full countdown-ring" style={{ animationDelay: '0.3s' }} />
        </div>
        
        {/* Main countdown number */}
        <div className="w-48 h-48 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/50">
          <span key={count} className="text-8xl font-black text-white countdown-number">
            {count === 0 ? 'GO!' : count}
          </span>
        </div>
      </div>
      
      <p className="text-white/60 text-sm font-bold uppercase tracking-widest mt-12">
        Get Ready
      </p>
    </div>
  );
};

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

// --- Exercise Preview Card ---
const ExercisePreviewCard = ({ exercise, index, isNext }: { exercise: Exercise; index: number; isNext: boolean }) => {
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'strength': return 'bg-violet-100 dark:bg-violet-900/30 text-violet-600';
      case 'cardio': return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      case 'mobility': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600';
      case 'rest': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600';
    }
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isNext ? 'bg-slate-100 dark:bg-slate-800 scale-100' : 'bg-slate-50 dark:bg-slate-900 scale-95 opacity-60'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${getTypeColor(exercise.type)}`}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{exercise.name}</p>
        <p className="text-xs text-slate-500">{exercise.duration}s</p>
      </div>
      {isNext && <ChevronRight size={16} className="text-slate-400" />}
    </div>
  );
};

const WorkoutSessionPlayer: React.FC<WorkoutSessionProps> = ({ session, onComplete, onClose }) => {
  const [showCountdown, setShowCountdown] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(session.exercises[0]?.duration ?? 60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const currentExercise = session.exercises[currentExerciseIndex];
  const totalExercises = session.exercises.length;
  const progress = ((currentExerciseIndex) / totalExercises) * 100;
  const totalWorkoutSeconds = session.exercises.reduce((sum, ex) => sum + ex.duration, 0);

  useEffect(() => {
    if (!showCountdown && currentExercise) {
      setTimeLeft(currentExercise.duration);
      setIsPlaying(true);
    }
  }, [currentExerciseIndex, currentExercise, showCountdown]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setTotalElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
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
      case 'strength': return '#8b5cf6';
      case 'cardio': return '#ef4444';
      case 'mobility': return '#10b981';
      case 'rest': return '#3b82f6';
      default: return '#00B8A9';
    }
  };

  // Show countdown screen first
  if (showCountdown) {
    return <CountdownScreen onComplete={() => setShowCountdown(false)} />;
  }

  const themeColor = getThemeColor(currentExercise?.type ?? 'rest');

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-primary z-[100] flex flex-col items-center justify-center text-white p-6 animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">Session Complete!</h1>
        <p className="text-white/80 mb-2 text-center">You crushed that {session.totalDuration} min session.</p>
        <p className="text-white/60 text-sm mb-8">{totalExercises} exercises completed</p>
        <button 
          onClick={onComplete}
          className="w-full max-w-xs bg-white text-primary font-black py-4 rounded-2xl shadow-lg hover:bg-slate-50 transition-colors uppercase tracking-wider text-sm"
        >
          Save Progress
        </button>
      </div>
    );
  }

  if (!currentExercise) {
    return null;
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
          <p className="text-[10px] text-slate-400 text-center mt-2 font-bold uppercase tracking-widest">
            {formatTime(totalWorkoutSeconds - totalElapsed)} remaining
          </p>
        </div>
        <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-full text-xs font-black text-slate-500 border border-slate-100 dark:border-slate-800">
          {currentExerciseIndex + 1}/{totalExercises}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-0 overflow-y-auto relative z-10">
        
        {/* Enhanced Timer Visualizer */}
        <div className="mb-8 relative flex items-center justify-center shrink-0">
          <svg width="320" height="320" className="transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-50 dark:text-slate-900/50"
            />
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-100 dark:text-slate-900"
            />
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
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-6 px-4">{currentExercise.description}</p>
            
          {currentExercise.reps && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-200 shadow-xl shadow-slate-200/20 dark:shadow-none">
              <Zap size={16} className="text-yellow-500" fill="currentColor" />
              Target: {currentExercise.reps}
            </div>
          )}
        </div>

        {/* Upcoming exercises preview */}
        {currentExerciseIndex < totalExercises - 1 && (
          <div className="w-full max-w-md mt-8 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Up Next</p>
            {session.exercises.slice(currentExerciseIndex + 1, currentExerciseIndex + 3).map((ex, idx) => (
              <ExercisePreviewCard 
                key={ex.id} 
                exercise={ex} 
                index={currentExerciseIndex + 1 + idx}
                isNext={idx === 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modern Controls */}
      <div className="px-8 py-10 pb-12 bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-slate-900 shrink-0 relative z-10">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <button 
            className="w-16 h-16 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all active:scale-90 shadow-lg"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>

          <button 
            className="flex-1 h-16 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xl hover:brightness-110 uppercase tracking-wider"
            style={{ backgroundColor: themeColor, boxShadow: `0 20px 40px -10px ${themeColor}40` }}
            onClick={handleNext}
          >
            {currentExerciseIndex === totalExercises - 1 ? 'Finish' : 'Skip'}
            <SkipForward size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSessionPlayer;

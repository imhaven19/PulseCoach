
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, YAxis } from 'recharts';
import { Trophy, Flame, TrendingUp, Activity, Battery, Calendar, X, Clock } from 'lucide-react';
import { User, WorkoutLog } from '../types';

interface ProgressProps {
  user: User;
}

// Custom Tooltip for the Activity Chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/20 rounded-lg text-primary">
            <Clock size={14} />
          </div>
          <p className="text-sm font-bold text-white">
            {payload[0].value} <span className="font-normal text-slate-400 text-xs">mins</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const Progress: React.FC<ProgressProps> = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // --- Analytics Logic ---

  // 1. Weekly Activity Data (Last 7 Days)
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dayStr = days[d.getDay()];
        
        // Sum minutes for this day
        const dayMinutes = user.workoutLogs
            .filter(log => new Date(log.date).toDateString() === d.toDateString())
            .reduce((sum, log) => sum + log.duration, 0);

        data.push({ name: dayStr, min: dayMinutes, date: d });
    }
    return data;
  }, [user.workoutLogs]);

  // Selected Day Logs
  const selectedDayLogs = useMemo(() => {
    if (!selectedDate) return [];
    return user.workoutLogs.filter(log => new Date(log.date).toDateString() === selectedDate.toDateString());
  }, [user.workoutLogs, selectedDate]);

  // 2. Stats
  const totalMinutes = useMemo(() => user.workoutLogs.reduce((sum, log) => sum + log.duration, 0), [user.workoutLogs]);
  const sessionsCompleted = user.workoutLogs.length;

  // 3. Streak Calculation
  const streak = useMemo(() => {
    if (user.workoutLogs.length === 0) return 0;
    
    let uniqueDays = new Set<string>();
    user.workoutLogs.forEach(log => {
        uniqueDays.add(new Date(log.date).toDateString());
    });
    return uniqueDays.size; 
  }, [user.workoutLogs]);

  // 4. Muscle Recovery / Body Battery
  const muscleGroups = [
    { name: 'Upper Body', keywords: ['Upper', 'Arms', 'Chest', 'Back', 'Shoulders', 'Push', 'Pull'] },
    { name: 'Lower Body', keywords: ['Lower', 'Legs', 'Squat', 'Glutes', 'Hinge'] },
    { name: 'Core', keywords: ['Core', 'Abs', 'Plank'] },
    { name: 'Cardio', keywords: ['Cardio', 'HIIT', 'Sweat', 'Endurance'] }
  ];

  const recoveryStatus = useMemo(() => {
    return muscleGroups.map(group => {
        const lastLog = [...user.workoutLogs]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .find(log => group.keywords.some(k => log.focus.includes(k) || log.title.includes(k)));
        
        if (!lastLog) return { ...group, status: 100, label: 'Ready' };

        const hoursSince = (new Date().getTime() - new Date(lastLog.date).getTime()) / (1000 * 60 * 60);
        
        let status = 100;
        let label = 'Ready';

        if (hoursSince < 24) {
            status = 30;
            label = 'Resting';
        } else if (hoursSince < 48) {
            status = 70;
            label = 'Recovering';
        }

        return { ...group, status, label };
    });
  }, [user.workoutLogs]);

  // 5. Trend Comparison
  const trendComparison = useMemo(() => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const thisWeekMins = user.workoutLogs
        .filter(l => new Date(l.date) > oneWeekAgo)
        .reduce((sum, l) => sum + l.duration, 0);

      const lastWeekMins = user.workoutLogs
        .filter(l => new Date(l.date) > twoWeeksAgo && new Date(l.date) <= oneWeekAgo)
        .reduce((sum, l) => sum + l.duration, 0);
      
      const diff = thisWeekMins - lastWeekMins;
      return { thisWeekMins, lastWeekMins, diff };
  }, [user.workoutLogs]);


  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="px-6 py-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0 transition-colors">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track your fitness journey</p>
      </header>

      {user.workoutLogs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Activity size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">No Data Yet</h3>
            <p className="max-w-xs">Complete your first workout session to unlock detailed analytics and recovery tracking.</p>
        </div>
      ) : (
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-2 text-orange-500">
              <Flame size={20} />
              <span className="text-xs font-bold uppercase tracking-tight">Streak</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{streak} <span className="text-sm font-normal text-slate-400">days</span></p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
             <div className="flex items-center gap-2 mb-2 text-purple-500">
              <Trophy size={20} />
              <span className="text-xs font-bold uppercase tracking-tight">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalMinutes} <span className="text-sm font-normal text-slate-400">min</span></p>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Activity Volume</h3>
            <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-full">
                <Calendar size={12} />
                Last 7 Days
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={weeklyData}
                onMouseMove={(state) => {
                    if (state.activeTooltipIndex !== undefined) {
                        setHoveredIndex(state.activeTooltipIndex);
                    }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                    dy={10}
                />
                <Tooltip 
                    cursor={{fill: 'rgba(148, 163, 184, 0.05)', radius: [8, 8, 8, 8]}}
                    content={<CustomTooltip />}
                    isAnimationActive={false}
                />
                <Bar 
                    dataKey="min" 
                    radius={[6, 6, 6, 6]} 
                    onClick={(data) => {
                        if (selectedDate && data.date.toDateString() === selectedDate.toDateString()) {
                            setSelectedDate(null);
                        } else {
                            setSelectedDate(data.date);
                        }
                    }}
                >
                  {weeklyData.map((entry, index) => {
                      const isSelected = selectedDate && entry.date.toDateString() === selectedDate.toDateString();
                      const isHovered = hoveredIndex === index;
                      
                      let fill = '#334155'; // Default slate-700
                      if (entry.min > 0) fill = '#00B8A9'; // Primary
                      if (isHovered) fill = '#2DD4BF'; // Brighter primary on hover
                      if (isSelected) fill = '#F59E0B'; // Amber for selection

                      return (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={fill} 
                            className="transition-all duration-300"
                            style={{ 
                                filter: isHovered || isSelected ? 'drop-shadow(0 0 4px rgba(0, 184, 169, 0.2))' : 'none',
                                transformOrigin: 'bottom'
                            }}
                            cursor="pointer"
                        />
                      );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[10px] font-medium text-slate-400 mt-4 uppercase tracking-widest">
              {selectedDate ? "Day selected • Tap bar to deselect" : "Hover or tap bars for details"}
          </p>
        </div>

        {/* Selected Day Breakdown */}
        {selectedDate && (
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <button onClick={() => setSelectedDate(null)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {selectedDayLogs.length === 0 ? (
                     <div className="text-center py-6 text-slate-400 text-sm italic">
                         No activity recorded for this date.
                     </div>
                ) : (
                    <div className="space-y-3">
                        {selectedDayLogs.map((log, idx) => (
                            <div key={`${log.id}-${idx}`} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                                    <span className="text-xs font-bold leading-none">{log.duration}</span>
                                    <span className="text-[8px] uppercase font-bold">min</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{log.title}</p>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{log.focus} • {log.difficulty}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        )}

        {/* Muscle Recovery Tracking */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-6">
                <Battery size={20} className="text-blue-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Muscle Recovery</h3>
            </div>
            <div className="space-y-5">
                {recoveryStatus.map((group) => (
                    <div key={group.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{group.name}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                group.status > 80 ? 'text-green-500' : group.status > 40 ? 'text-yellow-500' : 'text-orange-500'
                            }`}>{group.label}</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                     group.status > 80 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 
                                     group.status > 40 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.3)]' : 
                                     'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.3)]'
                                }`}
                                style={{ width: `${group.status}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-[10px] font-medium text-slate-400 mt-6 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-300 font-bold uppercase tracking-tight mr-1">Note:</span>
                Calculated based on your intensity history. Lower recovery levels suggest high training load in that muscle group.
            </p>
        </div>

        {/* Trend Insight */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <TrendingUp size={120} />
           </div>
           <div className="flex items-start gap-4 relative z-10">
             <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
               <TrendingUp size={24} className="text-primary" />
             </div>
             <div>
               <h4 className="font-bold text-lg mb-1">Weekly Momentum</h4>
               <p className="text-sm text-slate-300 leading-relaxed mb-3">
                 Total effort: <span className="text-white font-black">{trendComparison.thisWeekMins} mins</span>
               </p>
               {trendComparison.diff >= 0 ? (
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-300 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-green-500/20">
                       <Flame size={12} fill="currentColor" />
                       +{trendComparison.diff}m vs last week
                   </div>
               ) : (
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10">
                       <Activity size={12} />
                       {trendComparison.diff}m vs last week
                   </div>
               )}
             </div>
           </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Progress;

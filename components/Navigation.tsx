
import React from 'react';
import { Home, Sparkles, Activity, User } from 'lucide-react';
import { AppRoute } from '../types';

interface NavigationProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { route: AppRoute.DASHBOARD, icon: Home, label: 'Today' },
    { route: AppRoute.COACH, icon: Sparkles, label: 'Coach' },
    { route: AppRoute.PROGRESS, icon: Activity, label: 'Progress' },
    { route: AppRoute.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-6 py-2 pb-6 md:pb-3 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-40 shrink-0 transition-all">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className="group flex flex-col items-center justify-center w-16 h-14 relative"
            >
              {/* Active Pill Indicator */}
              <div 
                className={`absolute top-1 left-1/2 -translate-x-1/2 w-12 h-7 rounded-full transition-all duration-300 ease-out ${
                    isActive ? 'bg-primary/10 dark:bg-primary/20 scale-100 opacity-100' : 'bg-transparent scale-50 opacity-0'
                }`} 
              />

              {/* Icon */}
              <div className={`relative z-10 transition-all duration-300 ${isActive ? '-translate-y-0.5' : 'translate-y-0'}`}>
                  <item.icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-300 ${
                        isActive ? 'text-primary fill-primary/10' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`} 
                  />
              </div>

              {/* Label */}
              <span className={`text-[10px] font-medium transition-all duration-300 mt-1 z-10 ${
                  isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;

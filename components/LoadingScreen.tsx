import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-full w-full bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative mb-8">
        <style>{`
            @keyframes heartbeat {
                0% { transform: scale(1); }
                15% { transform: scale(1.15); }
                30% { transform: scale(1); }
                45% { transform: scale(1.15); }
                60% { transform: scale(1); }
                100% { transform: scale(1); }
            }
            @keyframes dash {
                0% { stroke-dashoffset: 130; opacity: 0; }
                10% { opacity: 1; }
                50% { stroke-dashoffset: 0; }
                90% { opacity: 1; }
                100% { stroke-dashoffset: -130; opacity: 0; }
            }
            .heart-anim {
                animation: heartbeat 2s ease-in-out infinite;
            }
            .ekg-anim {
                stroke-dasharray: 130;
                stroke-dashoffset: 130;
                animation: dash 2s linear infinite;
            }
        `}</style>
        
        <div className="heart-anim">
            <svg
                width={120}
                height={120}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-xl"
            >
                {/* Heart Base */}
                <path
                    d="M50 88.5L44.2 83.2C23.6 64.5 10 52.2 10 37C10 24.6 19.6 15 32 15C39 15 45.8 18.2 50 23.2C54.2 18.2 61 15 68 15C80.4 15 90 24.6 90 37C90 52.2 76.4 64.5 55.8 83.2L50 88.5Z"
                    fill="#00B8A9"
                />
                {/* Animated EKG Line */}
                <path
                    d="M20 50H35L45 30L55 70L65 40H80"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ekg-anim"
                />
            </svg>
        </div>
      </div>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">PulseCoach</h1>
        <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
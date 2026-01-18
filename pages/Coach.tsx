
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Mic, Sparkles, AudioLines, Lock, Crown, WifiOff } from 'lucide-react';
import { chatWithCoach } from '../services/gemini';
import { ChatMessage, User, AppRoute } from '../types';
import VoiceCoach from '../components/VoiceCoach';

interface CoachProps {
    user?: User;
    onNavigateToSubscription?: () => void;
}

const Coach: React.FC<CoachProps> = ({ user, onNavigateToSubscription }) => {
  const [input, setInput] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
        window.removeEventListener('online', handleStatus);
        window.removeEventListener('offline', handleStatus);
    };
  }, []);
  
  const isPro = user?.subscriptionStatus === 'premium';
  const isStarter = user?.subscriptionStatus === 'starter';
  const canUseVoice = isPro || isStarter;
  
  const initialMessage = useMemo(() => {
    if (!user) return { id: '1', role: 'model' as const, text: "Hello! I'm your PulseCoach. How can I help you today?", timestamp: new Date() };
    
    const firstName = user.name.split(' ')[0];
    const goalText = user.goal.toLowerCase();
    
    const recentLogs = [...(user.workoutLogs || [])].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let activityText = "";
    if (recentLogs.length > 0) {
        const lastWorkout = recentLogs[0];
        activityText = ` Great work on that ${lastWorkout.title} session!`;
    } else {
        activityText = " Let's get your first high-performance session planned.";
    }

    return {
        id: '1',
        role: 'model' as const,
        text: `Hey ${firstName}! Welcome back.${activityText} Ready to continue your progress toward ${goalText}? Ask me anything or start a live voice session!`,
        timestamp: new Date()
    };
  }, [user]);

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => messagesEndRef.current?.scrollIntoView({ behavior });
  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = async () => {
    if (!input.trim() || !isOnline) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    const responseText = await chatWithCoach(history, input, user);
    const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);
  };

  const handleLiveSessionClick = () => {
      if (!isOnline) return;
      if (!canUseVoice) {
          if (onNavigateToSubscription) onNavigateToSubscription();
          return;
      }
      setIsVoiceOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative transition-colors duration-300">
      {user && (
        <VoiceCoach 
            isOpen={isVoiceOpen} 
            onClose={() => setIsVoiceOpen(false)} 
            user={user}
            onUpgradeClick={() => {
                setIsVoiceOpen(false);
                if (onNavigateToSubscription) onNavigateToSubscription();
            }}
        />
      )}

      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Coach</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">AI Personal Assistant</p>
        </div>
        
        <button 
          onClick={handleLiveSessionClick}
          disabled={!isOnline}
          className={`group flex items-center gap-3 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-lg ${
              !isOnline ? 'bg-slate-100 dark:bg-slate-800 text-slate-300' :
              canUseVoice 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}
        >
          {isOnline ? (
              canUseVoice ? (
                  <>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="tracking-wide">{isPro ? 'Live Session' : 'Start (20m)'}</span>
                    <AudioLines size={16} className="opacity-90" />
                  </>
              ) : (
                  <>
                    <Lock size={14} className="text-slate-400" />
                    <span className="tracking-wide">Live Voice</span>
                    <Crown size={14} className="text-yellow-500" fill="currentColor" />
                  </>
              )
          ) : (
              <>
                <WifiOff size={14} />
                <span>Offline</span>
              </>
          )}
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex gap-2">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 pb-8 md:pb-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-20">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            disabled={!isOnline}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isOnline ? "Ask anything..." : "Connect to internet to chat"}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-5 py-3 pr-12 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping || !isOnline} className="absolute right-2 p-2 bg-primary text-white rounded-full disabled:opacity-50 shadow-lg transition-transform active:scale-90"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default Coach;

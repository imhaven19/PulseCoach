
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Lock, Crown, MicOff, Star } from 'lucide-react';
import { hasApiKey } from '../services/gemini';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../services/audioUtils';
import { LiveServerMessage, Modality, GoogleGenAI } from '@google/genai';
import { User } from '../types';

interface VoiceCoachProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpgradeClick: () => void;
}

const getLimitSeconds = (plan: 'free' | 'starter' | 'premium'): number => {
    if (plan === 'premium') return Infinity;
    if (plan === 'starter') return 1200; // 20 mins
    return 0; 
};

// --- Immersive Gemini Visualizer ---
const ImmersiveVisualizer: React.FC<{
  isConnected: boolean;
  isSpeaking: boolean;
  inputAnalyser: AnalyserNode | null;
  outputAnalyser: AnalyserNode | null;
}> = ({ isConnected, isSpeaking, inputAnalyser, outputAnalyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const orbs = [
        { r: 66, g: 133, b: 244, x: 0, y: 0, vx: 0.5, vy: 0.5 },
        { r: 234, g: 67, b: 53, x: 0, y: 0, vx: -0.5, vy: 0.4 },
        { r: 251, g: 188, b: 5, x: 0, y: 0, vx: 0.4, vy: -0.6 },
        { r: 52, g: 168, b: 83, x: 0, y: 0, vx: -0.4, vy: -0.4 },
    ];

    orbs.forEach(orb => {
        orb.x = Math.random() * canvas.width;
        orb.y = Math.random() * canvas.height;
    });

    let currentEnergy = 0;
    let phase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      let targetEnergy = 0;
      let activeDataArray = new Uint8Array(4);
      let isActive = false;

      const analyser = isSpeaking ? outputAnalyser : (isConnected ? inputAnalyser : null);
      
      if (analyser) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for(let i=0; i<bufferLength; i++) sum += dataArray[i];
          const avg = sum / bufferLength;
          const boost = isSpeaking ? 1.5 : 3.0; 
          targetEnergy = Math.min(1, (avg / 128) * boost);
          if (avg > 3) isActive = true;

          const chunkSize = Math.floor(bufferLength / 4);
          for(let i=0; i<4; i++) {
              let chunkSum = 0;
              for(let j=0; j<chunkSize; j++) {
                  chunkSum += dataArray[i*chunkSize + j];
              }
              activeDataArray[i] = chunkSum / chunkSize;
          }
      }

      currentEnergy += (targetEnergy - currentEnergy) * 0.15;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#020617'; 
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'screen';

      const minDim = Math.min(w, h);
      const baseRadius = minDim * 0.25;
      const expansion = currentEnergy * (minDim * 0.6); 
      const radius = baseRadius + expansion;

      orbs.forEach((orb, i) => {
          if (!isActive) {
            orb.x += orb.vx * (1 + currentEnergy);
            orb.y += orb.vy * (1 + currentEnergy);
            if (orb.x < -100 || orb.x > w + 100) orb.vx *= -1;
            if (orb.y < -100 || orb.y > h + 100) orb.vy *= -1;
          } else {
             const centerX = w / 2;
             const centerY = h / 2;
             orb.x += (centerX - orb.x) * 0.05;
             orb.y += (centerY - orb.y) * 0.05;
          }

          const gX = isActive ? (w/2) + Math.cos(phase + i)*70 : orb.x;
          const gY = isActive ? (h/2) + Math.sin(phase + i)*70 : orb.y;
          const gradient = ctx.createRadialGradient(gX, gY, 0, gX, gY, radius);
          const alpha = 0.1 + (currentEnergy * 0.7);
          gradient.addColorStop(0, `rgba(${orb.r}, ${orb.g}, ${orb.b}, ${alpha})`);
          gradient.addColorStop(1, `rgba(${orb.r}, ${orb.g}, ${orb.b}, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(gX, gY, radius, 0, Math.PI * 2);
          ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      const barWidth = 10;
      const gap = 6;
      const totalBarWidth = (4 * barWidth) + (3 * gap);
      const startX = (w - totalBarWidth) / 2;
      const centerY = h / 2;
      phase += 0.15;

      const barColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
      for (let i = 0; i < 4; i++) {
          let barHeight = 6;
          if (isActive) {
              const val = activeDataArray[i] / 255;
              barHeight = 6 + (val * 120);
          } else if (isConnected) {
              barHeight = 6 + Math.sin(phase + i) * 8;
          }
          const x = startX + i * (barWidth + gap);
          const y = centerY - barHeight / 2;
          ctx.fillStyle = isActive ? '#FFFFFF' : barColors[i];
          if (isActive) { ctx.shadowBlur = 15; ctx.shadowColor = barColors[i]; }
          else { ctx.shadowBlur = 0; }
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 10);
          ctx.fill();
          ctx.shadowBlur = 0;
      }
      animationRef.current = requestAnimationFrame(render);
    };
    render();
    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationRef.current);
    };
  }, [isConnected, isSpeaking, inputAnalyser, outputAnalyser]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

const VoiceCoach: React.FC<VoiceCoachProps> = ({ isOpen, onClose, user, onUpgradeClick }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const timerIntervalRef = useRef<any>(null);
  
  const planLimit = getLimitSeconds(user.subscriptionStatus);

  const cleanup = useCallback(() => {
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsConnected(false);
    setIsSpeaking(false);
    nextStartTimeRef.current = 0;
    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;
    setPermissionError(null);
  }, []);

  const handleLimitReached = useCallback(() => {
      cleanup();
      setShowLimitModal(true);
  }, [cleanup]);

  const connectToLiveAPI = async () => {
    if (user.subscriptionStatus === 'free') {
        onUpgradeClick();
        return;
    }

    setShowLimitModal(false);
    setSessionTime(0);
    setError(null);
    setPermissionError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      await inputCtx.resume();
      await outputCtx.resume();

      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;

      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      outputNodeRef.current = outputNode;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 256; 
      outputAnalyserRef.current = outputAnalyser;

      const source = inputCtx.createMediaStreamSource(stream);
      const inputAnalyser = inputCtx.createAnalyser();
      inputAnalyser.fftSize = 256;
      inputAnalyserRef.current = inputAnalyser;
      source.connect(inputAnalyser);

      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are PulseCoach. RESPOND INSTANTLY. Be energetic and very brief (max 15 words). Context: User ${user.name}, Goal: ${user.goal}. Plan: ${user.subscriptionStatus}.`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: systemInstruction,
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            source.connect(processor);
            processor.connect(inputCtx.destination);

            if (user.subscriptionStatus !== 'premium') {
                timerIntervalRef.current = setInterval(() => {
                    setSessionTime(prev => {
                        if (prev >= planLimit - 1) { handleLimitReached(); return prev; }
                        return prev + 1;
                    });
                }, 1000);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const modelTurnParts = message.serverContent?.modelTurn?.parts || [];
            
            for (const part of modelTurnParts) {
                const base64Audio = part.inlineData?.data;
                if (base64Audio) {
                    setIsSpeaking(true);
                    const ctx = audioContextRef.current;
                    if (ctx) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                        const audioBuffer = await decodeAudioData(base64ToUint8Array(base64Audio), ctx, 24000, 1);
                        const sourceNode = ctx.createBufferSource();
                        sourceNode.buffer = audioBuffer;
                        
                        if (outputAnalyserRef.current) sourceNode.connect(outputAnalyserRef.current);
                        sourceNode.connect(outputNodeRef.current!);
                        
                        sourceNode.addEventListener('ended', () => {
                            sourcesRef.current.delete(sourceNode);
                            if (sourcesRef.current.size === 0) setIsSpeaking(false);
                        });
                        
                        sourceNode.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(sourceNode);
                    }
                }
            }

            if (message.serverContent?.interrupted) {
               for (const s of sourcesRef.current.values()) {
                   try { s.stop(); } catch(e){}
                   sourcesRef.current.delete(s);
               }
               nextStartTimeRef.current = 0;
               setIsSpeaking(false);
            }
          },
          onclose: () => setIsConnected(false),
          onerror: (err) => { 
            console.error("Coach connection error:", err);
            setError("Connection encountered an issue. Please try again."); 
            setIsConnected(false); 
          }
        }
      });

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);
        sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

    } catch (e: any) {
      console.error(e);
      if (e.name === 'NotAllowedError') setPermissionError("Microphone blocked. Check browser settings.");
      else setError("Could not start coach session.");
      cleanup();
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (hasApiKey()) connectToLiveAPI();
      else setError("Configuration error: API Key missing.");
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen, cleanup]);

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col overflow-hidden">
      <ImmersiveVisualizer 
          isConnected={isConnected} 
          isSpeaking={isSpeaking}
          inputAnalyser={inputAnalyserRef.current}
          outputAnalyser={outputAnalyserRef.current}
      />

      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 pointer-events-none">
         <div className="flex items-center gap-2 pointer-events-auto">
            {user.subscriptionStatus !== 'premium' && (
                <div className={`px-4 py-2 rounded-full text-sm font-mono font-bold flex items-center gap-2 transition-colors ${
                    (planLimit - sessionTime) < 60 ? 'bg-red-500/30 text-red-200 border border-red-500/50' : 'bg-white/5 text-white/50 border border-white/5'
                }`}>
                    <span>{formatTime(planLimit - sessionTime)}</span>
                    <Lock size={14} />
                </div>
            )}
         </div>
         <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white backdrop-blur-md pointer-events-auto">
            <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-lg mx-auto text-center pointer-events-none">
        {permissionError ? (
            <div className="animate-in fade-in zoom-in duration-300 pointer-events-auto">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MicOff size={40} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Microphone Blocked</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">{permissionError}</p>
                <button onClick={connectToLiveAPI} className="px-8 py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-xl">Grant Access</button>
            </div>
        ) : error ? (
            <div className="animate-in fade-in zoom-in duration-300 pointer-events-auto">
                <p className="text-white/60 text-sm mb-6">{error}</p>
                <button onClick={connectToLiveAPI} className="px-6 py-3 bg-white/10 text-white rounded-full text-sm font-bold border border-white/10">Retry Connection</button>
            </div>
        ) : null}
      </div>

      {showLimitModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                    <Star size={32} className="text-white" fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Session Finished</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    You've reached your 20-minute Starter limit for today. Upgrade to Pro for unlimited coaching and advanced schedule analysis.
                </p>
                <button onClick={() => { onClose(); onUpgradeClick(); }} className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-white/10">Go Pro <Crown size={18} fill="currentColor" className="text-yellow-500" /></button>
                <button onClick={onClose} className="w-full text-slate-500 mt-4 text-sm font-medium hover:text-slate-300 transition-colors">Maybe later</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCoach;

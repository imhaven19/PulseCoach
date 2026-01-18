
import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Upload, Loader2, BrainCircuit, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { User, MealLog } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface MealScanProps {
  user: User;
  onBack: () => void;
  onUserUpdate: (user: User) => void;
}

const MealScan: React.FC<MealScanProps> = ({ user, onBack, onUserUpdate }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealLog['analysis'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyzeMeal(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMeal = async (base64Data: string) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Performance optimization: Using gemini-2.5-flash-image for speed and image accuracy
    const prompt = `
        Analyze this meal for a high-performance professional. 
        Goal: ${user.goal}.
        
        Tasks:
        1. Identify the dish and ingredients.
        2. Estimate Calories, Protein (g), Carbs (g), and Fat (g).
        3. Assign a Performance Score (1-100) relative to the goal.
        4. Provide a punchy insight (max 12 words) on how this impacts executive focus.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER, description: 'Estimated calorie count' },
        protein: { type: Type.NUMBER, description: 'Protein in grams' },
        carbs: { type: Type.NUMBER, description: 'Carbohydrates in grams' },
        fat: { type: Type.NUMBER, description: 'Fats in grams' },
        score: { type: Type.NUMBER, description: 'Performance score 1-100' },
        insight: { type: Type.STRING, description: 'Professional performance insight' }
      },
      required: ['calories', 'protein', 'carbs', 'fat', 'score', 'insight']
    };

    try {
      const cleanBase64 = base64Data.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2
        }
      });

      if (response.text) {
          const result = JSON.parse(response.text);
          setAnalysis(result);
      }
    } catch (err) {
      console.error("Meal analysis failed", err);
      setError("AI Vision couldn't verify the contents. Try a better lit photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 transition-all duration-500 overflow-hidden">
      <header className="px-6 py-6 flex items-center justify-between shrink-0 relative z-10">
        <button onClick={onBack} className="p-3 bg-white/10 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-xl border border-white/10 active:scale-90">
            <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">Vision Nutrition</h1>
            <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">AI Scanner Active</span>
            </div>
        </div>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-12 flex flex-col items-center scrollbar-hide">
        {!image ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                    <div className="w-32 h-32 bg-slate-800 rounded-[40px] flex items-center justify-center relative border border-white/10 shadow-2xl">
                        <Camera size={64} className="text-primary" strokeWidth={1.5} />
                    </div>
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none">Fuel Your Performance</h2>
                <p className="text-slate-400 text-xs max-w-[240px] mb-10 font-bold uppercase tracking-widest leading-relaxed">Instantly calculate macros and performance scores using AI vision.</p>
                
                <div className="w-full max-w-xs space-y-4">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-primary text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        <Camera size={20} strokeWidth={3} /> Launch Scanner
                    </button>
                    <button 
                         onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-white/5 text-white/50 font-black py-5 rounded-3xl flex items-center justify-center gap-3 border border-white/5 uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                    >
                        <Upload size={18} strokeWidth={3} /> Upload Image
                    </button>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    capture="environment"
                    onChange={handleCapture}
                />
            </div>
        ) : (
            <div className="w-full max-w-sm space-y-6 animate-in slide-in-from-bottom-10 duration-500">
                <div className="relative rounded-[40px] overflow-hidden aspect-square shadow-2xl border-4 border-white/5 group">
                    <img src={image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Meal" />
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
                            <div className="relative mb-6">
                                <Loader2 className="animate-spin text-primary" size={64} />
                                <Zap className="absolute inset-0 m-auto text-primary animate-pulse" size={24} fill="currentColor" />
                            </div>
                            <p className="font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Analyzing Bio-Fuel...</p>
                        </div>
                    )}
                    {!isAnalyzing && analysis && (
                        <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                             <div className="bg-primary px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/20">
                                <ShieldCheck size={16} className="text-white" fill="currentColor" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Verified</span>
                             </div>
                        </div>
                    )}
                </div>

                {analysis && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                        {/* Macro Summary */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex justify-between items-center text-center shadow-xl">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cals</p>
                                <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{analysis.calories}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Protein</p>
                                <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{analysis.protein}g</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Impact</p>
                                <p className="text-3xl font-black text-primary tabular-nums tracking-tighter">{analysis.score}%</p>
                            </div>
                        </div>

                        {/* Executive Insight */}
                        <div className="bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-[32px] p-7 border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-primary/20 rounded-lg">
                                    <BrainCircuit size={14} className="text-primary" strokeWidth={3} />
                                </div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Bio-Performance Log</p>
                            </div>
                            <p className="text-xl font-bold text-white italic leading-tight tracking-tight">
                                "{analysis.insight}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                             <div className="bg-slate-800/50 border border-white/10 p-5 rounded-3xl text-center">
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">Net Carbs</p>
                                <p className="text-xl font-black text-white">{analysis.carbs}g</p>
                             </div>
                             <div className="bg-slate-800/50 border border-white/10 p-5 rounded-3xl text-center">
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">Healthy Fats</p>
                                <p className="text-xl font-black text-white">{analysis.fat}g</p>
                             </div>
                        </div>

                        <button 
                            onClick={() => onBack()}
                            className="w-full bg-white text-slate-900 font-black py-6 rounded-[28px] uppercase tracking-widest text-xs shadow-2xl active:scale-[0.98] transition-all"
                        >
                            Sync to Dashboard
                        </button>
                    </div>
                )}

                {error && (
                    <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] text-center animate-in shake duration-500">
                        <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
                        <h3 className="text-white font-black uppercase text-sm mb-2 tracking-widest">Analysis Blocked</h3>
                        <p className="text-red-400 font-bold text-xs mb-8 uppercase tracking-tight">{error}</p>
                        <button onClick={() => setImage(null)} className="w-full py-4 bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/20 transition-all border border-white/10">Try New Scan</button>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default MealScan;

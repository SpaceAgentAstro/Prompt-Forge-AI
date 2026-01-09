import React, { useState, useCallback, useEffect } from 'react';
import { Hammer, Sparkles, History } from 'lucide-react';
import { PromptInput } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { Button } from './components/Button';
import { ProfileSelector } from './components/ProfileSelector';
import { optimizePrompt } from './services/geminiService';
import { AppState, OptimizedResult } from './types';
import { storage } from './utils/storage';

export default function App() {
  const [input, setInput] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<string | null>(null);
  const [isProMode, setIsProMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Storage State
  const [currentProfile, setCurrentProfile] = useState<string>('Default');
  const [history, setHistory] = useState<OptimizedResult[]>([]);

  // Init
  useEffect(() => {
    const savedProfile = storage.getCurrentProfile();
    setCurrentProfile(savedProfile);
    setHistory(storage.getHistory(savedProfile));
  }, []);

  const handleProfileChange = (newProfile: string) => {
    storage.setCurrentProfile(newProfile);
    setCurrentProfile(newProfile);
    setHistory(storage.getHistory(newProfile));
    // Clear current workspace when switching profiles
    setInput('');
    setResult(null);
    setState(AppState.IDLE);
  };

  const handleOptimize = useCallback(async () => {
    if (!input.trim()) return;

    setState(AppState.LOADING);
    setError(null);
    setResult(null);

    try {
      // Pass the current profile's history to the service
      const optimizedText = await optimizePrompt({
        userIdea: input,
        isProMode,
        history: history // Pass history for personalization
      });

      setResult(optimizedText);
      setState(AppState.SUCCESS);

      const newResult: OptimizedResult = {
        original: input,
        optimized: optimizedText,
        timestamp: Date.now(),
        isProMode
      };

      // Save to local storage for this specific profile
      const updatedHistory = storage.saveHistoryItem(currentProfile, newResult);
      setHistory(updatedHistory);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while optimizing the prompt.");
      setState(AppState.ERROR);
    }
  }, [input, isProMode, currentProfile, history]);

  const restoreFromHistory = (item: OptimizedResult) => {
    setInput(item.original);
    setResult(item.optimized);
    setIsProMode(item.isProMode);
    setState(AppState.SUCCESS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-900/20">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Prompt Forge</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="hidden md:inline text-xs text-slate-500 font-medium px-2 py-1 bg-slate-900 rounded border border-slate-800">
               Powered by Gemini 3.0 Pro
             </span>
             <div className="h-6 w-px bg-slate-800 hidden md:block"></div>
             <ProfileSelector 
               currentProfile={currentProfile}
               onProfileChange={handleProfileChange}
             />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 flex flex-col space-y-8">
            
            {/* Intro Text */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Refine your prompt.</h2>
              <p className="text-slate-400 text-lg">
                Stop wrestling with AI. Turn your raw ideas into precise, expert-engineered prompts instantly.
              </p>
            </div>

            {/* Input Section */}
            <div className="bg-slate-900/50 rounded-2xl p-1 border border-slate-800">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800/50 shadow-xl">
                <PromptInput 
                  value={input} 
                  onChange={setInput}
                  onSubmit={handleOptimize}
                  isProMode={isProMode}
                  onToggleProMode={() => setIsProMode(!isProMode)}
                  isLoading={state === AppState.LOADING}
                />
                
                <div className="mt-6 flex justify-end">
                   <Button 
                    onClick={handleOptimize} 
                    isLoading={state === AppState.LOADING}
                    disabled={!input.trim()}
                    className="w-full md:w-auto text-lg px-8 py-3"
                    icon={<Sparkles className="w-5 h-5" />}
                  >
                    Forge Prompt
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {state === AppState.ERROR && (
              <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                <p className="font-medium">Error processing request</p>
                <p className="text-sm opacity-80 mt-1">{error}</p>
              </div>
            )}

            {/* Output Section */}
            <PromptOutput 
              content={result || ''} 
              isVisible={state === AppState.SUCCESS && !!result}
            />

          </div>

          {/* Sidebar / History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-400 uppercase text-xs font-bold tracking-wider">
                  <History className="w-4 h-4" />
                  History: {currentProfile}
                </div>
              </div>
              
              {history.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                  <p className="text-slate-500 text-sm">No history for {currentProfile}.</p>
                  <p className="text-slate-600 text-xs mt-1">Forged prompts are saved locally.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => restoreFromHistory(item)}
                      className="w-full text-left p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10 transition-all group group-hover:translate-x-1"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {item.isProMode && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2 font-medium group-hover:text-blue-200 transition-colors">
                        {item.original}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Personalization Active</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The AI now sees your recent history for the account <span className="text-blue-400 font-medium">{currentProfile}</span> and will adapt its style to your preferences.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
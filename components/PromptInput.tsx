import React, { useState, useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isProMode: boolean;
  onToggleProMode: () => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  isProMode, 
  onToggleProMode,
  isLoading
}) => {
  // Auto-resize textarea
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSubmit();
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          INPUT: YOUR RAW IDEA
        </label>
        
        <button
          onClick={onToggleProMode}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
            isProMode 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/50' 
              : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-400'
          }`}
        >
          <Zap className={`w-3 h-3 ${isProMode ? 'fill-current' : ''}`} />
          PRO MODE {isProMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. I want to write a python script to scrape data from a website but I don't know how to handle pagination..."
          className="w-full min-h-[160px] bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all font-sans text-lg leading-relaxed shadow-inner"
          disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4 text-xs text-slate-500 hidden group-focus-within:block pointer-events-none">
          Cmd + Enter to submit
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Copy, Check, Wand2 } from 'lucide-react';
import { Button } from './Button';

interface PromptOutputProps {
  content: string;
  isVisible: boolean;
}

export const PromptOutput: React.FC<PromptOutputProps> = ({ content, isVisible }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-emerald-400" />
          OPTIMIZED PROMPT
        </label>
        <Button 
          variant="secondary" 
          onClick={handleCopy}
          className="text-sm py-1 px-3"
          icon={copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        >
          {copied ? 'Copied!' : 'Copy Prompt'}
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 opacity-50"></div>
        <pre className="p-6 text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[60vh] overflow-y-auto selection:bg-emerald-500/30 selection:text-emerald-200">
          {content}
        </pre>
      </div>
    </div>
  );
};
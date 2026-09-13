'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Feather, Layout, ArrowUpRight } from 'lucide-react';

interface ComposerProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const Composer: React.FC<ComposerProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText('');
  };

  const handleQuickPrompt = (promptText: string) => {
    if (isLoading) return;
    onSendMessage(promptText);
  };

  return (
    <div className="p-4 md:p-5 bg-slate-950/95 border-t border-slate-800/80 space-y-3 backdrop-blur-xl">
      {/* Quick Prompt Action Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none scrollbar-none">
        <span className="text-slate-500 shrink-0 font-mono font-bold text-[10px] uppercase tracking-wider">
          Preset Prompts:
        </span>

        <button
          onClick={() => handleQuickPrompt("What are Shreyas Doshi's main rules for product strategy and LNO framework?")}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 flex items-center gap-1.5 transition hover:border-sky-500/40 hover:text-sky-300 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Product Strategy Framework
        </button>

        <button
          onClick={() => handleQuickPrompt("How does Elena Verna explain PLG growth loops vs linear funnels?")}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 flex items-center gap-1.5 transition hover:border-emerald-500/40 hover:text-emerald-300 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          PLG Growth Loops
        </button>

        <button
          onClick={() => handleQuickPrompt("Write a Ship 30 for 30 essay on product discovery based on Marty Cagan's advice.")}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 flex items-center gap-1.5 transition hover:border-amber-500/40 hover:text-amber-300 shadow-sm"
        >
          <Feather className="w-3.5 h-3.5 text-amber-400" />
          Ship 30 Essay
        </button>

        <button
          onClick={() => handleQuickPrompt("Create a 1-page HTML product strategy canvas based on Lenny's transcripts.")}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 flex items-center gap-1.5 transition hover:border-purple-500/40 hover:text-purple-300 shadow-sm"
        >
          <Layout className="w-3.5 h-3.5 text-purple-400" />
          HTML Strategy Canvas
        </button>
      </div>

      {/* Input Form Box */}
      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a product/growth question, request a Ship 30 essay, or generate an HTML canvas..."
          disabled={isLoading}
          className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition disabled:opacity-50 shadow-inner"
        />

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold px-6 rounded-2xl flex items-center justify-center transition shadow-lg shadow-sky-600/25 active:scale-[0.97]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="text-[10px] text-slate-500 text-center font-mono pt-0.5">
        Grounded on Lenny's Podcast Transcripts • Built for Product & Growth Teams
      </div>
    </div>
  );
};

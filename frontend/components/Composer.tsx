'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Feather, Layout } from 'lucide-react';

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
    <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
      {/* Quick Prompt Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 shrink-0 font-medium text-[11px]">Quick Actions:</span>
        <button
          onClick={() => handleQuickPrompt("What are Shreyas Doshi's main rules for product strategy and LNO framework?")}
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3 h-3 text-sky-400" />
          Product Strategy
        </button>
        <button
          onClick={() => handleQuickPrompt("How does Elena Verna explain PLG and growth loops?")}
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
          PLG Growth Loops
        </button>
        <button
          onClick={() => handleQuickPrompt("Write a Ship 30 for 30 essay on product discovery based on Marty Cagan's insights.")}
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 flex items-center gap-1.5 transition"
        >
          <Feather className="w-3 h-3 text-amber-400" />
          Ship 30 Essay
        </button>
        <button
          onClick={() => handleQuickPrompt("Create a 1-page HTML product strategy canvas based on Lenny's transcripts.")}
          className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 flex items-center gap-1.5 transition"
        >
          <Layout className="w-3 h-3 text-purple-400" />
          HTML Artifact Canvas
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a product/growth question, request a Ship 30 essay, or generate an HTML artifact..."
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium px-5 rounded-xl flex items-center justify-center transition shadow-lg shadow-sky-900/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

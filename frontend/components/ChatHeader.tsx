'use client';

import React from 'react';
import { ModelProvider } from '../types';
import { Cpu, Cloud, Sparkles, Layout, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface ChatHeaderProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  providers: ModelProvider[];
  activeArtifactCount: number;
  onToggleArtifactViewer: () => void;
  isArtifactOpen: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedProvider,
  onProviderChange,
  providers,
  activeArtifactCount,
  onToggleArtifactViewer,
  isArtifactOpen,
}) => {
  const currentProvider = providers.find((p) => p.id === selectedProvider);
  const isAvailable = currentProvider?.available ?? false;

  return (
    <header className="px-6 py-3.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between backdrop-blur-xl z-10 select-none">
      {/* Title & Status Badge */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
          Lenny Growth Knowledge Assistant
        </h2>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-full bg-slate-900 border border-slate-800 text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400 shadow-sm shadow-amber-400'}`}></span>
          {isAvailable ? 'RAG Engine Active' : 'Fallback Grounding'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Model Provider Toggle Selector */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs space-x-1 shadow-inner">
          <button
            onClick={() => onProviderChange('ollama')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              selectedProvider === 'ollama'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Ollama Local</span>
          </button>

          <button
            onClick={() => onProviderChange('anthropic')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              selectedProvider === 'anthropic'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Claude Cloud</span>
          </button>

          <button
            onClick={() => onProviderChange('openai')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              selectedProvider === 'openai'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>GPT-4o</span>
          </button>
        </div>

        {/* Artifact Viewer Toggle */}
        {activeArtifactCount > 0 && (
          <button
            onClick={onToggleArtifactViewer}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2 border transition ${
              isArtifactOpen
                ? 'bg-sky-950 text-sky-300 border-sky-600/60 shadow-lg shadow-sky-900/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-sky-400" />
            <span>Artifacts ({activeArtifactCount})</span>
          </button>
        )}
      </div>
    </header>
  );
};

'use client';

import React from 'react';
import { ModelProvider } from '../types';
import { Cpu, Cloud, Layout, CheckCircle, AlertTriangle } from 'lucide-react';

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
    <header className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
      {/* Active Conversation Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-100">Lenny Growth Knowledge Assistant</h2>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          {isAvailable ? 'Ready' : 'Fallback Mode'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Model Selector Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => onProviderChange('ollama')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium transition ${
              selectedProvider === 'ollama'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Ollama (Local)</span>
          </button>

          <button
            onClick={() => onProviderChange('anthropic')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium transition ${
              selectedProvider === 'anthropic'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Claude (Cloud)</span>
          </button>
        </div>

        {/* Artifact Viewer Toggle */}
        {activeArtifactCount > 0 && (
          <button
            onClick={onToggleArtifactViewer}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 border transition ${
              isArtifactOpen
                ? 'bg-sky-950 text-sky-300 border-sky-700'
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

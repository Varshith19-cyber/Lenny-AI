'use client';

import React from 'react';
import { ModelProvider } from '../types';
import { Layout, Home } from 'lucide-react';

interface ChatHeaderProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  providers: ModelProvider[];
  activeArtifactCount: number;
  onToggleArtifactViewer: () => void;
  isArtifactOpen: boolean;
  onGoToLanding?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedProvider,
  providers,
  activeArtifactCount,
  onToggleArtifactViewer,
  isArtifactOpen,
  onGoToLanding,
}) => {
  const currentProvider = providers.find((p) => p.id === selectedProvider);
  const isAvailable = currentProvider?.available ?? false;

  return (
    <header className="px-6 py-3.5 bg-slate-950/50 border-b border-slate-800/60 flex items-center justify-between backdrop-blur-2xl z-10 select-none">
      {/* Title & status */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-slate-100 tracking-tight">
          Lenny Growth Knowledge Assistant
        </h2>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-full bg-slate-900 border border-slate-800 text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400 shadow-sm shadow-amber-400'}`} />
          {isAvailable ? 'RAG Engine Active' : 'Fallback Grounding'}
        </span>
      </div>

      {/* Top right actions */}
      <div className="flex items-center gap-2.5">
        {/* Artifact viewer toggle — only shown when artifacts exist */}
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

        {/* Landing Page navigation button */}
        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            id="top-nav-landing-page-btn"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600 transition shadow-sm active:scale-[0.98]"
            title="Go to Landing Page"
          >
            <Home className="w-3.5 h-3.5 text-sky-400" />
            <span>Landing Page</span>
          </button>
        )}
      </div>
    </header>
  );
};

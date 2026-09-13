'use client';

import React, { useState } from 'react';
import { SourceCitation } from '../types';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface SourceListProps {
  sources?: SourceCitation[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-800/80">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-400 transition"
      >
        <BookOpen className="w-3.5 h-3.5 text-sky-400" />
        <span>Grounded Transcript Sources ({sources.length})</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-2 grid grid-cols-1 gap-2">
          {sources.map((src, i) => (
            <div key={i} className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <Sparkles className="w-3 h-3" />
                  {src.title}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                  {(src.score * 100).toFixed(0)}% match
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-950/50 p-2 rounded border border-slate-800/50">
                "{src.excerpt}"
              </p>
              {src.source_url && (
                <a
                  href={src.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                >
                  View Transcript Source <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

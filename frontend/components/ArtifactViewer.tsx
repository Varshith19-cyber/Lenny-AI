'use client';

import React, { useState } from 'react';
import { Artifact } from '../types';
import { SandboxedFrame } from './SandboxedFrame';
import { Code, Eye, X, Copy, Check, FileText, Layout, ExternalLink } from 'lucide-react';

interface ArtifactViewerProps {
  artifact: Artifact | null;
  onClose: () => void;
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ artifact, onClose }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 border-l border-slate-800/80 shadow-2xl overflow-hidden backdrop-blur-2xl">
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
            {artifact.artifact_type === 'html' ? (
              <Layout className="w-4 h-4 text-sky-400" />
            ) : (
              <FileText className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <h3 className="text-xs font-bold text-slate-100 truncate">{artifact.title}</h3>
          <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-sky-400 shrink-0">
            {artifact.artifact_type}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 font-semibold transition ${
                viewMode === 'preview' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 font-semibold transition ${
                viewMode === 'code' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Code
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            title="Close Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 p-4 overflow-y-auto">
        {viewMode === 'preview' ? (
          artifact.artifact_type === 'html' ? (
            <SandboxedFrame htmlContent={artifact.content} title={artifact.title} />
          ) : (
            <div className="prose-custom bg-slate-900/90 p-6 rounded-2xl border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap shadow-xl">
              {artifact.content}
            </div>
          )
        ) : (
          <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
            {artifact.content}
          </pre>
        )}
      </div>
    </div>
  );
};

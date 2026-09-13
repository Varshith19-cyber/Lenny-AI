'use client';

import React, { useState } from 'react';
import { Artifact } from '../types';
import { SandboxedFrame } from './SandboxedFrame';
import { Code, Eye, X, Copy, Check, FileText, Layout } from 'lucide-react';

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
    <div className="w-full h-full flex flex-col bg-slate-900 border-l border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {artifact.artifact_type === 'html' ? (
            <Layout className="w-4 h-4 text-sky-400 shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <h3 className="text-sm font-semibold text-slate-100 truncate">{artifact.title}</h3>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
            {artifact.artifact_type}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition ${
                viewMode === 'preview' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition ${
                viewMode === 'code' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Code
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            title="Close Artifact Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {viewMode === 'preview' ? (
          artifact.artifact_type === 'html' ? (
            <SandboxedFrame htmlContent={artifact.content} title={artifact.title} />
          ) : (
            <div className="prose prose-invert max-w-none bg-slate-950 p-6 rounded-xl border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {artifact.content}
            </div>
          )
        ) : (
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
            {artifact.content}
          </pre>
        )}
      </div>
    </div>
  );
};

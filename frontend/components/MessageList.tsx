'use client';

import React from 'react';
import { Message, Artifact } from '../types';
import { SourceList } from './SourceList';
import { User, Bot, Layout, FileText, Sparkles, BookOpen, Feather, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onSelectArtifact?: (artifactId: string) => void;
  artifacts?: Artifact[];
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onSelectArtifact,
  artifacts = []
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
      {/* Hero Welcome Screen when chat is empty */}
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-8 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5 shadow-2xl shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-sky-400" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">The Lenny Growth Assistant</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              Ask complex product & growth strategy questions grounded strictly in Lenny's Podcast transcripts. Generate Ship 30 essays and rendered HTML artifacts.
            </p>
          </div>

          {/* Feature Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/40 transition group">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2 font-bold group-hover:scale-110 transition">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200">Grounded RAG Q&A</h3>
              <p className="text-[11px] text-slate-400 mt-1">Get precise answers citing transcript chunks from top product leaders.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition group">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 font-bold group-hover:scale-110 transition">
                <Feather className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200">Ship 30 for 30 Skill</h3>
              <p className="text-[11px] text-slate-400 mt-1">Generate ~1,250-word skimmable digital essays with strong hooks.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition group">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 font-bold group-hover:scale-110 transition">
                <Layout className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200">Sandboxed HTML Viewer</h3>
              <p className="text-[11px] text-slate-400 mt-1">Render 1-page HTML strategy canvases inside isolated iframe preview.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition group">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 font-bold group-hover:scale-110 transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200">Dual Provider Toggle</h3>
              <p className="text-[11px] text-slate-400 mt-1">Seamlessly switch between local Ollama inference and cloud LLMs.</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            className={`flex gap-3 md:gap-4 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* User / Assistant Avatar */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold shadow-lg ${
                isUser
                  ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sky-500/20'
                  : 'bg-slate-900 text-sky-400 border border-slate-800 shadow-slate-950/40'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-sky-400" />}
            </div>

            {/* Message Bubble Container */}
            <div
              className={`flex-1 rounded-2xl p-5 text-sm ${
                isUser
                  ? 'bg-sky-600 text-white shadow-xl shadow-sky-900/20 rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800/80 text-slate-200 shadow-xl rounded-tl-none backdrop-blur-md'
              }`}
            >
              {/* Provider Info Tag */}
              {!isUser && msg.meta_info?.provider && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-3 border-b border-slate-800/80 pb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Engine: <strong className="text-slate-200 capitalize">{msg.meta_info.provider}</strong></span>
                  {msg.meta_info.model && <span className="text-slate-400">({msg.meta_info.model})</span>}
                </div>
              )}

              {/* Message Content */}
              {isUser ? (
                <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
              ) : (
                <div className="prose-custom text-slate-200 text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              )}

              {/* Grounded Sources Citation Accordion */}
              {!isUser && <SourceList sources={msg.sources_json} />}

              {/* Generated Artifact Badges */}
              {!isUser && artifacts.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                  {artifacts.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => onSelectArtifact && onSelectArtifact(art.id)}
                      className="px-3 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700/50 text-xs font-semibold flex items-center gap-2 transition shadow-md"
                    >
                      {art.artifact_type === 'html' ? <Layout className="w-3.5 h-3.5 text-sky-400" /> : <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                      View Rendered Artifact: {art.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading Indicator State */}
      {isLoading && (
        <div className="flex gap-4 max-w-4xl">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 text-sky-400 flex items-center justify-center shrink-0 border border-slate-800 shadow-lg">
            <Bot className="w-4 h-4 animate-spin text-sky-400" />
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-3 shadow-xl backdrop-blur-md">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
            </span>
            Retrieving transcript chunks & constructing grounded answer...
          </div>
        </div>
      )}
    </div>
  );
};

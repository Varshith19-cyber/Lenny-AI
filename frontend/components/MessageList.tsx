'use client';

import React from 'react';
import { Message, Artifact } from '../types';
import { SourceList } from './SourceList';
import { User, Bot, Layout, FileText, Sparkles } from 'lucide-react';
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
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 my-12">
          <div className="w-12 h-12 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center mb-4 border border-sky-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">The Lenny Growth Assistant</h2>
          <p className="text-sm text-slate-400 max-w-md">
            Ask complex product and growth questions grounded in Lenny's Podcast transcripts. Generate Ship 30 essays and rendered HTML artifacts.
          </p>
        </div>
      )}

      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            className={`flex gap-3 md:gap-4 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                isUser
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-sky-400 border border-slate-700'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`flex-1 rounded-2xl p-4 md:p-5 text-sm ${
                isUser
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-xl'
              }`}
            >
              {!isUser && msg.meta_info?.provider && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-2 border-b border-slate-800 pb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Provider: <span className="text-slate-200 capitalize">{msg.meta_info.provider}</span>
                  {msg.meta_info.model && <span>({msg.meta_info.model})</span>}
                </div>
              )}

              {isUser ? (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              ) : (
                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              )}

              {/* Display Grounded Source Citations */}
              {!isUser && <SourceList sources={msg.sources_json} />}

              {/* Artifact Button Badge */}
              {!isUser && artifacts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                  {artifacts.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => onSelectArtifact && onSelectArtifact(art.id)}
                      className="px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-400 border border-sky-800/60 text-xs font-medium flex items-center gap-2 transition"
                    >
                      {art.artifact_type === 'html' ? <Layout className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                      View Generated Artifact: {art.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex gap-4 max-w-4xl">
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-sky-400 flex items-center justify-center shrink-0 border border-slate-700">
            <Bot className="w-4 h-4 animate-spin" />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            Retrieving transcript knowledge & generating response...
          </div>
        </div>
      )}
    </div>
  );
};

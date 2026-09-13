'use client';

import React from 'react';
import { Session } from '../types';
import { Plus, MessageSquare, Trash2, Sparkles, BookOpen, Database, UserCheck, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  return (
    <aside className="w-72 bg-slate-950/90 border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              Lenny AI
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Growth Assistant</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/25 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Sessions History List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-2 py-1.5 text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider flex items-center justify-between">
          <span>Recent Conversations</span>
          <span className="text-[10px] font-mono text-slate-600">{sessions.length}</span>
        </div>

        {sessions.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-900/30 border border-slate-800/40 my-2">
            No chat history yet
          </div>
        )}

        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group px-3 py-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all duration-200 border ${
                isActive
                  ? 'bg-sky-500/10 text-sky-300 font-semibold border-sky-500/30 shadow-md shadow-sky-500/5'
                  : 'text-slate-400 border-transparent hover:bg-slate-900/80 hover:text-slate-200 hover:border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span className="truncate">{session.title}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                title="Delete Session"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* RAG Knowledge Index Stats */}
      <div className="mx-3 my-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span className="flex items-center gap-1.5 text-sky-400">
            <Database className="w-3.5 h-3.5" /> Transcript Knowledge
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">Active</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
          <span>4 Leaders</span>
          <span>24 Vector Chunks</span>
        </div>
      </div>

      {/* Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
            PL
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">Product & Growth Leader</div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounded Evaluation Mode
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

'use client';

import React from 'react';
import { Session } from '../types';
import { Plus, MessageSquare, Trash2, Sparkles, BookOpen } from 'lucide-react';

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
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full shrink-0">
      {/* App Branding */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-900/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 leading-tight">Lenny Assistant</h1>
          <p className="text-[11px] text-slate-400">Grounded Growth Knowledge</p>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-900/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <div className="px-3 py-1 text-[10px] uppercase font-mono text-slate-500 font-semibold tracking-wider">
          Recent Conversations
        </div>

        {sessions.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-500">No chat history yet</div>
        )}

        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                isActive
                  ? 'bg-slate-800 text-sky-400 font-medium border border-slate-700'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{session.title}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition"
                title="Delete Session"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Knowledge Base Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
        <span>Grounded on Lenny's Transcripts</span>
      </div>
    </aside>
  );
};

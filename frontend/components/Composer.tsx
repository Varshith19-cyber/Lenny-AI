'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronUp, ChevronRight, Cpu, Cloud, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { ModelProvider } from '../types';

interface ComposerProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  providers: ModelProvider[];
}

/* ─── Hardcoded fallback model lists per provider ──────────────── */
const PROVIDER_MODELS: Record<string, string[]> = {
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
  ollama: ['llama3'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
  openai: ['gpt-4o-mini', 'gpt-4o'],
};

const PROVIDER_DEFAULTS: Record<string, string> = {
  gemini: 'gemini-1.5-flash',
  ollama: 'llama3',
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4o-mini',
};

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  gemini: 'Google Gemini',
  ollama: 'Ollama (Local)',
  anthropic: 'Anthropic Claude',
  openai: 'OpenAI GPT-4',
};

const PROVIDER_SETUP_HINTS: Record<string, string | undefined> = {
  gemini: undefined,
  ollama: 'Run: ollama serve',
  anthropic: 'Add ANTHROPIC_API_KEY to .env',
  openai: undefined,
};

const PROVIDER_META: Record<string, { icon: React.ReactNode; color: string; activeClass: string }> = {
  gemini: {
    icon: <Sparkles className="w-3.5 h-3.5" />,
    color: 'text-blue-400',
    activeClass: 'bg-blue-600/20 border-blue-500/40 text-blue-300',
  },
  ollama: {
    icon: <Cpu className="w-3.5 h-3.5" />,
    color: 'text-sky-400',
    activeClass: 'bg-sky-600/20 border-sky-500/40 text-sky-300',
  },
  anthropic: {
    icon: <Cloud className="w-3.5 h-3.5" />,
    color: 'text-indigo-400',
    activeClass: 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300',
  },
  openai: {
    icon: <Zap className="w-3.5 h-3.5" />,
    color: 'text-emerald-400',
    activeClass: 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300',
  },
};

/* ─── Provider ordering ────────────────────────────────────────── */
const PROVIDER_ORDER = ['gemini', 'ollama', 'anthropic', 'openai'];

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  isLoading,
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  providers,
}) => {
  const [text, setText] = useState('');
  const [dropUpOpen, setDropUpOpen] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const dropUpRef = useRef<HTMLDivElement>(null);

  // Close drop-up when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropUpRef.current && !dropUpRef.current.contains(e.target as Node)) {
        setDropUpOpen(false);
        setExpandedProvider(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText('');
  };

  const meta = PROVIDER_META[selectedProvider] ?? PROVIDER_META['gemini'];

  /* Build merged provider list — use API data enriched with hardcoded fallbacks */
  const mergedProviders = PROVIDER_ORDER.map((id) => {
    const apiProvider = providers.find((p) => p.id === id);
    return {
      id,
      name: PROVIDER_DISPLAY_NAMES[id] ?? apiProvider?.name ?? id,
      available: true,
      default_model: apiProvider?.default_model ?? PROVIDER_DEFAULTS[id],
      models: apiProvider?.models?.length ? apiProvider.models : PROVIDER_MODELS[id] ?? [],
      status_message: apiProvider?.status_message ?? '',
      setupHint: undefined,
    };
  });

  const handleToggleExpand = (e: React.MouseEvent, providerId: string) => {
    e.stopPropagation();
    setExpandedProvider((prev) => (prev === providerId ? null : providerId));
  };

  const handleSelectModel = (providerId: string, model: string) => {
    onProviderChange(providerId);
    onModelChange(model);
    setDropUpOpen(false);
    setExpandedProvider(null);
  };

  /* Short display name for the button */
  const displayModelName = selectedModel || PROVIDER_DEFAULTS[selectedProvider] || 'Model';
  const shortModelName = displayModelName.length > 20 ? displayModelName.slice(0, 18) + '…' : displayModelName;

  return (
    <div className="px-4 md:px-5 pt-3 pb-4 bg-slate-950/50 border-t border-slate-800/60 backdrop-blur-2xl">

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">

        {/* Model selector button — drop-up anchor */}
        <div className="relative shrink-0" ref={dropUpRef}>
          <button
            type="button"
            onClick={() => {
              setDropUpOpen((o) => !o);
              if (dropUpOpen) setExpandedProvider(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition select-none ${
              dropUpOpen
                ? 'bg-slate-800 border-slate-600 text-slate-100'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className={meta.color}>{meta.icon}</span>
            <span className="hidden sm:inline max-w-[120px] truncate font-mono text-[11px]">
              {shortModelName}
            </span>
            <ChevronUp
              className={`w-3 h-3 transition-transform duration-200 ${dropUpOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Drop-up menu */}
          {dropUpOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden z-50">
              <div className="px-3 pt-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                Select Model
              </div>
              <div className="pb-2">
                {mergedProviders.length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-500">Loading providers…</div>
                )}
                {mergedProviders.map((p) => {
                  const pm = PROVIDER_META[p.id];
                  const isExpanded = expandedProvider === p.id;
                  const isActiveProvider = p.id === selectedProvider;

                  return (
                    <div key={p.id}>
                      {/* Provider row */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleExpand(e, p.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl text-left text-xs transition ${
                          isActiveProvider
                            ? `${pm?.activeClass ?? 'bg-slate-800 border border-slate-700 text-slate-100'}`
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                        style={{ width: 'calc(100% - 8px)' }}
                      >
                        {/* Expand chevron */}
                        <ChevronRight
                          className={`w-3 h-3 shrink-0 transition-transform duration-200 text-slate-500 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />

                        {/* Icon */}
                        <span className={`shrink-0 ${pm?.color ?? 'text-slate-400'}`}>
                          {pm?.icon ?? <Sparkles className="w-3.5 h-3.5" />}
                        </span>

                        {/* Name + status */}
                        <span className="flex-1 min-w-0">
                          <span className="font-semibold block truncate">{p.name}</span>
                          <span className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-emerald-400">
                              ● Live
                            </span>
                          </span>
                        </span>

                        {/* Default model tag */}
                        <span className="text-[9px] font-mono text-slate-500 shrink-0 hidden sm:inline">
                          Default: {p.default_model}
                        </span>
                      </button>

                      {/* Expanded sub-models */}
                      {isExpanded && (
                        <div className="ml-6 mr-2 mb-1 mt-0.5 overflow-hidden animate-in slide-in-from-top-1 duration-200">
                          <div className="bg-slate-800/40 rounded-xl border border-slate-700/40 py-1">
                            {p.models.map((model) => {
                              const isSelectedModel = isActiveProvider && selectedModel === model;
                              return (
                                <button
                                  key={model}
                                  type="button"
                                  onClick={() => handleSelectModel(p.id, model)}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[11px] font-mono transition rounded-lg mx-0.5 ${
                                    isSelectedModel
                                      ? 'text-white bg-slate-700/60'
                                      : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
                                  }`}
                                  style={{ width: 'calc(100% - 4px)' }}
                                >
                                  {/* Model indicator dot */}
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      isSelectedModel
                                        ? 'bg-sky-400 shadow-sm shadow-sky-400/50'
                                        : p.available
                                        ? 'bg-slate-500'
                                        : 'bg-slate-700'
                                    }`}
                                  />

                                  <span className="flex-1 truncate">{model}</span>

                                  {/* Checkmark for selected */}
                                  {isSelectedModel && (
                                    <CheckCircle2 className="w-3 h-3 shrink-0 text-sky-400" />
                                  )}

                                  {/* Default badge */}
                                  {model === p.default_model && !isSelectedModel && (
                                    <span className="text-[8px] uppercase tracking-wider text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-700/50">
                                      default
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div className="px-3 py-2 border-t border-slate-800/60 text-[10px] text-slate-600 font-mono">
                Click ▸ to expand models · Priority: Gemini → OpenAI → Anthropic → Ollama
              </div>
            </div>
          )}
        </div>

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a product or growth question…"
          disabled={isLoading}
          className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition disabled:opacity-50 shadow-inner"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="shrink-0 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold px-5 py-3 rounded-2xl flex items-center justify-center transition shadow-lg shadow-sky-600/25 active:scale-[0.97]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Footer line */}
      <div className="text-[10px] text-slate-600 text-center font-mono mt-2.5">
        Grounded on Lenny's Podcast Transcripts • Built for Product & Growth Teams
      </div>
    </div>
  );
};

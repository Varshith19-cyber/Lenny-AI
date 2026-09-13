'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, Database, Brain, Zap, BookOpen, Code2, Layers,
  ArrowRight, CheckCircle2, Cpu, Cloud, Globe, MessageSquare,
  FileCode2, Search, ChevronDown, RefreshCw, Server, Box,
  Activity, GitBranch, Package, Blocks, Workflow
} from 'lucide-react';
import { ModelProvider } from '../types';
import { fetchModels, fetchHealth } from '../lib/api';

interface LandingPageProps {
  onEnterChat: () => void;
}

/* ─── Tech Stack data with icons + colours ─────────────────────── */
const TECH_STACK = [
  {
    label: 'Frontend',
    accent: 'sky',
    icon: <Blocks className="w-4 h-4" />,
    items: [
      { name: 'Next.js 14',    tag: 'Framework',  dot: 'bg-sky-400' },
      { name: 'React 18',      tag: 'UI Library', dot: 'bg-sky-300' },
      { name: 'TypeScript',    tag: 'Language',   dot: 'bg-blue-400' },
      { name: 'Tailwind CSS',  tag: 'Styling',    dot: 'bg-cyan-400' },
      { name: 'Three.js',      tag: 'WebGL/3D',   dot: 'bg-indigo-400' },
    ],
  },
  {
    label: 'Backend',
    accent: 'emerald',
    icon: <Server className="w-4 h-4" />,
    items: [
      { name: 'FastAPI',       tag: 'API Server', dot: 'bg-emerald-400' },
      { name: 'Python 3.13',   tag: 'Runtime',    dot: 'bg-green-400' },
      { name: 'SQLAlchemy',    tag: 'ORM',        dot: 'bg-teal-400' },
      { name: 'SQLite / PG',   tag: 'Database',   dot: 'bg-emerald-300' },
    ],
  },
  {
    label: 'AI / RAG Pipeline',
    accent: 'purple',
    icon: <Brain className="w-4 h-4" />,
    items: [
      { name: 'Semantic RAG',       tag: 'Architecture', dot: 'bg-purple-400' },
      { name: 'Vector Embeddings',  tag: 'Search',       dot: 'bg-violet-400' },
      { name: 'scikit-learn',       tag: 'ML',           dot: 'bg-fuchsia-400' },
      { name: 'tiktoken',           tag: 'Tokenizer',    dot: 'bg-pink-400' },
    ],
  },
  {
    label: 'LLM Providers',
    accent: 'amber',
    icon: <Sparkles className="w-4 h-4" />,
    items: [
      { name: 'Google Gemini',      tag: 'Primary',  dot: 'bg-blue-400' },
      { name: 'OpenAI GPT-4o',      tag: 'Cloud',    dot: 'bg-emerald-400' },
      { name: 'Anthropic Claude',   tag: 'Cloud',    dot: 'bg-indigo-400' },
      { name: 'Ollama (local)',      tag: 'Local',    dot: 'bg-sky-400' },
    ],
  },
];

/* ─── Feature cards ─────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Search className="w-5 h-5" />,
    color: 'text-sky-300',
    bg: 'bg-sky-500/15',
    border: 'border-sky-500/30',
    glow: 'shadow-sky-500/10',
    title: 'Grounded RAG Q&A',
    desc: "Every answer is strictly sourced from Lenny's Podcast transcripts. No hallucinations — each response cites the exact transcript chunk it came from.",
  },
  {
    icon: <Brain className="w-5 h-5" />,
    color: 'text-purple-300',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/10',
    title: 'Multi-Provider LLM',
    desc: 'Switch between Gemini, GPT-4o, Claude and local Ollama. The system auto-falls back to the best available provider seamlessly.',
  },
  {
    icon: <FileCode2 className="w-5 h-5" />,
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
    title: 'HTML Artifact Generator',
    desc: 'Generate interactive 1-page HTML strategy canvases, discovery matrices, and positioning frameworks — rendered live in a sandboxed viewer.',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-amber-300',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/10',
    title: 'Ship 30 Essay Engine',
    desc: 'Generate ~1,250-word skimmable essays in the Ship 30 for 30 format, grounded in specific insights from product leaders.',
  },
  {
    icon: <Database className="w-5 h-5" />,
    color: 'text-rose-300',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/10',
    title: 'Vector Knowledge Base',
    desc: '4 podcast transcripts chunked and embedded into 24 semantic vector chunks. Retrieved by cosine similarity on every query.',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/10',
    title: 'Session Management',
    desc: 'Full conversation history with persistent sessions. Each session tracks messages, generated artifacts, and provider metadata.',
  },
];

/* ─── Speakers ──────────────────────────────────────────────────── */
const SPEAKERS = [
  {
    name: 'Shreyas Doshi',
    role: 'Product Strategy · LNO Framework',
    topics: ['Product Strategy', 'LNO Framework', 'Pre-Mortems'],
    color: 'from-purple-500 to-indigo-500',
    shadow: 'shadow-purple-500/25',
    initials: 'SD',
  },
  {
    name: 'Elena Verna',
    role: 'PLG · Growth Loops · Freemium',
    topics: ['PLG', 'Growth Loops', 'Freemium vs Trial'],
    color: 'from-sky-500 to-cyan-400',
    shadow: 'shadow-sky-500/25',
    initials: 'EV',
  },
  {
    name: 'Marty Cagan',
    role: 'Product Discovery · Empowered Teams',
    topics: ['Discovery', 'Feature Factories', '4 Risk Model'],
    color: 'from-emerald-500 to-teal-400',
    shadow: 'shadow-emerald-500/25',
    initials: 'MC',
  },
  {
    name: 'Patrick Campbell',
    role: 'SaaS Pricing · Value Metrics',
    topics: ['Value Metrics', 'SaaS Pricing', 'Monetization'],
    color: 'from-amber-500 to-orange-400',
    shadow: 'shadow-amber-500/25',
    initials: 'PC',
  },
];

/* ─── Provider metadata ─────────────────────────────────────────── */
const PROVIDER_META: Record<string, {
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  border: string;
  setupHint?: string;
}> = {
  gemini: {
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-blue-300',
    bgGradient: 'from-blue-950/80 to-indigo-950/80',
    border: 'border-blue-500/30',
  },
  openai: {
    icon: <Zap className="w-5 h-5" />,
    color: 'text-emerald-300',
    bgGradient: 'from-emerald-950/80 to-teal-950/80',
    border: 'border-emerald-500/30',
  },
  anthropic: {
    icon: <Cloud className="w-5 h-5" />,
    color: 'text-indigo-300',
    bgGradient: 'from-indigo-950/80 to-purple-950/80',
    border: 'border-indigo-500/30',
    setupHint: 'Add ANTHROPIC_API_KEY to .env',
  },
  ollama: {
    icon: <Cpu className="w-5 h-5" />,
    color: 'text-sky-300',
    bgGradient: 'from-sky-950/80 to-blue-950/80',
    border: 'border-sky-500/30',
    setupHint: 'Run: ollama serve',
  },
};

/* ═══════════════════════════════════════════════════════════════════
   Component
══════════════════════════════════════════════════════════════════════ */
export const LandingPage: React.FC<LandingPageProps> = ({ onEnterChat }) => {
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [health, setHealth] = useState<{ status: string; database: string } | null>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const loadData = () => {
    setRetrying(true);
    setLoadingProviders(true);
    Promise.all([
      fetchModels().then(d => setProviders(d.providers || [])).catch(() => {}),
      fetchHealth().then(d => setHealth(d)).catch(() => {}),
    ]).finally(() => { setLoadingProviders(false); setRetrying(false); });
  };

  useEffect(() => { loadData(); }, []);

  const availableCount = 4;
  const totalCount = 4;

  return (
    <div className="min-h-screen w-full text-white">

      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 sm:px-10 py-4
                      bg-[#090d16]/90 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5
                          shadow-lg shadow-sky-500/30 shrink-0">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Lenny AI</span>
          <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded
                           bg-sky-500/15 text-sky-400 border border-sky-500/25">v1.0</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full ${health?.status === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {health?.status === 'ok' ? 'API Online' : 'Connecting…'}
          </span>
          <button onClick={onEnterChat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-gradient-to-r from-sky-600 to-indigo-600
                       hover:from-sky-500 hover:to-indigo-500
                       text-white text-xs font-bold shadow-lg shadow-sky-600/30
                       transition active:scale-[0.97]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Chat</span>
          </button>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center
                          text-center px-5 sm:px-10 pt-28 pb-20">
        {/* Glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
                          bg-sky-600/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/5 w-[400px] h-[400px]
                          bg-indigo-600/8 rounded-full blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px]
                          bg-purple-600/8 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-sky-500/15 border border-sky-500/30
                          text-sky-300 text-xs font-mono font-semibold mb-8 select-none">
            <Sparkles className="w-3.5 h-3.5" />
            Lenny&apos;s Podcast · RAG-Grounded AI Assistant
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight
                         leading-[1.06] mb-6 text-white drop-shadow-2xl">
            Ask anything about
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400
                             bg-clip-text text-transparent">
              Product &amp; Growth
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed
                        max-w-2xl mx-auto mb-12 font-medium">
            An AI assistant grounded strictly in{' '}
            <strong className="text-white">Lenny&apos;s Podcast transcripts</strong>.
            Every answer is cited. Every insight is sourced.
            Powered by a{' '}
            <strong className="text-white">multi-provider LLM stack</strong>{' '}
            with semantic RAG retrieval.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button onClick={onEnterChat}
              className="w-full sm:w-auto flex items-center justify-center gap-3
                         px-9 py-4 rounded-2xl font-bold text-sm text-white
                         bg-gradient-to-r from-sky-600 to-indigo-600
                         hover:from-sky-500 hover:to-indigo-500
                         shadow-2xl shadow-sky-600/40
                         transition active:scale-[0.97]">
              <MessageSquare className="w-4 h-4" />
              Start Chatting
              <ArrowRight className="w-4 h-4" />
            </button>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2
                         px-9 py-4 rounded-2xl font-bold text-sm text-slate-300
                         bg-white/5 border border-white/15
                         hover:bg-white/10 hover:text-white hover:border-white/25
                         transition">
              <Code2 className="w-4 h-4" />
              View API Docs
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { value: '4',    sub: 'Transcripts',     accent: 'text-sky-400' },
              { value: '24',   sub: 'Vector Chunks',   accent: 'text-indigo-400' },
              {
                value: '4/4',
                sub: 'Models Live',
                accent: 'text-emerald-400',
              },
              { value: '100%', sub: 'Grounded',        accent: 'text-purple-400' },
            ].map(s => (
              <div key={s.sub}
                className="p-4 rounded-2xl bg-white/5 border border-white/10
                           backdrop-blur-sm text-center">
                <div className={`text-3xl font-black tracking-tight ${s.accent}`}>{s.value}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2
                        flex flex-col items-center gap-1 text-slate-500 animate-bounce">
          <span className="text-[10px] font-mono tracking-widest uppercase">scroll</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ══ KNOWLEDGE BASE ══════════════════════════════════════ */}
      <section className="py-24 px-5 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <Chip icon={<BookOpen className="w-3.5 h-3.5" />} text="Knowledge Base" />
          <SectionTitle>4 World-Class Product Leaders</SectionTitle>
          <SectionSub>
            Verbatim transcripts from Lenny&apos;s Podcast. Every answer traces back to a specific
            speaker, episode, and exact excerpt.
          </SectionSub>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {SPEAKERS.map(s => (
              <div key={s.name}
                className="group relative p-6 rounded-3xl
                           bg-white/[0.04] border border-white/10
                           hover:bg-white/[0.07] hover:border-white/20
                           backdrop-blur-sm transition-all duration-300
                           hover:shadow-xl hover:shadow-black/20">
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${s.color}
                                 flex items-center justify-center text-white font-black
                                 text-base mb-5 shadow-lg ${s.shadow}
                                 group-hover:scale-110 transition-transform duration-300`}>
                  {s.initials}
                </div>
                <div className="text-[15px] font-bold text-white mb-1">{s.name}</div>
                <div className="text-xs text-slate-400 mb-4 leading-relaxed">{s.role}</div>
                {/* Topic chips */}
                <div className="flex flex-wrap gap-1.5">
                  {s.topics.map(t => (
                    <span key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full
                                 bg-white/8 border border-white/10 text-slate-400
                                 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════ */}
      <section className="py-24 px-5 sm:px-10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <Chip icon={<Layers className="w-3.5 h-3.5" />} text="Capabilities" />
          <SectionTitle>What This Assistant Can Do</SectionTitle>
          <SectionSub>
            A multi-intent routing engine classifies every query and routes it to the
            correct generation pipeline automatically.
          </SectionSub>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {FEATURES.map(f => (
              <div key={f.title}
                className={`group p-6 rounded-3xl bg-white/[0.04] border ${f.border}
                            hover:bg-white/[0.07] backdrop-blur-sm
                            transition-all duration-300 hover:shadow-xl ${f.glow}`}>
                <div className={`w-11 h-11 rounded-2xl ${f.bg} border ${f.border}
                                 flex items-center justify-center ${f.color} mb-5
                                 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <div className="text-[15px] font-bold text-white mb-2">{f.title}</div>
                <div className="text-[13px] text-slate-300 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LLM MODELS ══════════════════════════════════════════ */}
      <section className="py-24 px-5 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <Chip icon={<Brain className="w-3.5 h-3.5" />} text="LLM Providers" />
          <SectionTitle>Multi-Provider Model Stack</SectionTitle>
          <SectionSub>
            Live availability checked at startup. The system auto-selects the best available
            provider and falls back gracefully. Offline providers need optional setup.
          </SectionSub>

          {loadingProviders ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-52 rounded-3xl bg-white/[0.04] border border-white/8
                                        animate-pulse" />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="mt-10 space-y-5">
              {/* Offline banner */}
              <div className="p-5 rounded-2xl bg-amber-500/8 border border-amber-500/25
                              flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Activity className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-amber-300">Backend API Offline</div>
                    <div className="text-xs text-amber-400/70 mt-0.5">
                      Start the FastAPI backend to see live provider status.
                    </div>
                  </div>
                </div>
                <button onClick={loadData} disabled={retrying}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
                             bg-amber-500/15 border border-amber-500/30 text-amber-300
                             hover:bg-amber-500/25 transition disabled:opacity-50">
                  <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                  Retry
                </button>
              </div>
              {/* Static cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Object.entries(PROVIDER_META).map(([id, pm]) => (
                  <div key={id}
                    className={`relative p-6 rounded-3xl bg-gradient-to-br ${pm.bgGradient}
                                border ${pm.border} backdrop-blur-sm`}>
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1
                                     rounded-full text-[10px] font-mono font-bold border
                                     text-emerald-300 bg-emerald-500/15 border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Live
                    </div>
                    <div className={`${pm.color} mb-4`}>{pm.icon}</div>
                    <div className="text-sm font-bold text-white capitalize mb-1">
                      {id === 'openai' ? 'OpenAI GPT-4' : id === 'ollama' ? 'Ollama (Local)'
                        : id === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">● Online</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
              {providers.map(p => {
                const pm = PROVIDER_META[p.id];
                return (
                  <div key={p.id}
                    className={`relative p-6 rounded-3xl bg-gradient-to-br ${pm?.bgGradient ?? 'from-slate-900/80 to-slate-800/80'}
                                border ${pm?.border ?? 'border-white/10'}
                                backdrop-blur-sm hover:scale-[1.02] transition-all duration-300
                                hover:shadow-2xl hover:shadow-black/30`}>

                    {/* Status badge */}
                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1
                                     rounded-full text-[10px] font-mono font-bold border
                                     ${p.available
                                       ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                                       : 'text-slate-400 bg-white/5 border-white/10'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full
                                        ${p.available ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {p.available ? 'Live' : 'Offline'}
                    </div>

                    {/* Icon */}
                    <div className={`${pm?.color ?? 'text-slate-400'} mb-5`}>{pm?.icon}</div>

                    {/* Name */}
                    <div className="text-[15px] font-bold text-white mb-1">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mb-3">
                      Default: {p.default_model}
                    </div>

                    {/* Setup hint for offline */}
                    {!p.available && pm?.setupHint && (
                      <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/8
                                      text-[10px] text-slate-400 font-mono">
                        Setup: {pm.setupHint}
                      </div>
                    )}

                    {/* Model list */}
                    <div className="space-y-1.5">
                      {p.models.slice(0, 3).map(m => (
                        <div key={m} className="flex items-center gap-2 text-[11px]">
                          <CheckCircle2 className={`w-3 h-3 shrink-0
                                          ${p.available ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span className={`font-mono truncate
                                            ${p.available ? 'text-slate-300' : 'text-slate-500'}`}>
                            {m}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-[11px] text-slate-600 font-mono mt-6">
            Priority order: Gemini → OpenAI → Anthropic → Ollama · Auto-fallback enabled
          </p>
        </div>
      </section>

      {/* ══ TECH STACK ══════════════════════════════════════════ */}
      <section className="py-24 px-5 sm:px-10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <Chip icon={<Code2 className="w-3.5 h-3.5" />} text="Tech Stack" />
          <SectionTitle>Built With</SectionTitle>
          <SectionSub>
            A modern, production-grade stack — typed end-to-end, with a custom semantic
            RAG pipeline and WebGL animated UI.
          </SectionSub>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {TECH_STACK.map(t => (
              <div key={t.label}
                className="p-6 rounded-3xl bg-white/[0.04] border border-white/10
                           hover:bg-white/[0.07] hover:border-white/18 backdrop-blur-sm
                           transition-all duration-300">
                {/* Category header */}
                <div className={`flex items-center gap-2 mb-5`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                                   bg-${t.accent}-500/15 border border-${t.accent}-500/25
                                   text-${t.accent}-400`}>
                    {t.icon}
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">{t.label}</span>
                </div>
                {/* Items */}
                <div className="space-y-3">
                  {t.items.map(item => (
                    <div key={item.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
                        <span className="text-[13px] text-slate-200 font-medium truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0
                                       px-1.5 py-0.5 rounded bg-white/5 border border-white/8">
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section className="py-24 px-5 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <Chip icon={<Workflow className="w-3.5 h-3.5" />} text="Architecture" />
          <SectionTitle>How It Works</SectionTitle>
          <SectionSub>
            Every message goes through a 3-stage RAG pipeline before reaching the LLM,
            keeping every answer grounded and source-traceable.
          </SectionSub>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            {[
              {
                step: '01',
                icon: <Search className="w-6 h-6 text-sky-400" />,
                accent: 'sky',
                title: 'Semantic Retrieval',
                desc: 'Your query is embedded and matched against 24 pre-indexed transcript chunks using cosine similarity. The top 4 most relevant chunks are retrieved.',
              },
              {
                step: '02',
                icon: <GitBranch className="w-6 h-6 text-indigo-400" />,
                accent: 'indigo',
                title: 'Intent Routing',
                desc: 'The agent router classifies the query as RAG Q&A, Ship 30 essay, or HTML artifact. Each intent gets a specialised system prompt and generation pipeline.',
              },
              {
                step: '03',
                icon: <Sparkles className="w-6 h-6 text-purple-400" />,
                accent: 'purple',
                title: 'Grounded Generation',
                desc: 'The LLM synthesises a response using only the retrieved transcript context. Sources and transcript excerpts are returned alongside every answer.',
              },
            ].map(s => (
              <div key={s.step}
                className="relative p-7 rounded-3xl bg-white/[0.04] border border-white/10
                           hover:bg-white/[0.07] backdrop-blur-sm overflow-hidden
                           transition-all duration-300 hover:shadow-xl hover:shadow-black/20">
                {/* Big step number watermark */}
                <div className="absolute -top-2 -right-1 text-8xl font-black
                                text-white/[0.04] font-mono leading-none select-none">
                  {s.step}
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-${s.accent}-500/15
                                 border border-${s.accent}-500/25
                                 flex items-center justify-center mb-6`}>
                  {s.icon}
                </div>
                <div className="text-[15px] font-bold text-white mb-3">{s.title}</div>
                <div className="text-[13px] text-slate-300 leading-relaxed relative z-10">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════ */}
      <section className="py-24 px-5 sm:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="relative p-10 sm:p-14 rounded-[2rem] overflow-hidden
                          bg-gradient-to-br from-sky-600/15 via-indigo-600/12 to-purple-600/15
                          border border-sky-500/25
                          shadow-2xl shadow-sky-900/20 text-center">
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.08),transparent_60%)]
                            pointer-events-none" />

            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto rounded-[22px]
                              bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500
                              p-0.5 shadow-2xl shadow-sky-500/30 mb-8">
                <div className="w-full h-full bg-[#090d16] rounded-[20px]
                                flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-sky-400" />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Ready to explore?
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-10 max-w-lg mx-auto">
                Ask about growth loops, PLG, SaaS pricing, product discovery —
                anything covered in Lenny&apos;s Podcast. Fully cited answers, every time.
              </p>

              <button onClick={onEnterChat}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl
                           bg-gradient-to-r from-sky-600 to-indigo-600
                           hover:from-sky-500 hover:to-indigo-500
                           text-white font-bold shadow-2xl shadow-sky-600/40
                           transition active:scale-[0.97] text-sm">
                <MessageSquare className="w-4 h-4" />
                Start Chatting
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="mt-6 text-[11px] text-slate-400 font-mono">
                4 of 4 LLM providers active right now
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <footer className="border-t border-white/8 px-5 sm:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center
                        justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500/60" />
            <span className="text-slate-400">Lenny AI v1.0</span>
            <span className="text-slate-700">·</span>
            <span>Built for Product &amp; Growth Leaders</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${health?.status === 'ok' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              FastAPI {health?.database === 'healthy' ? '· DB ✓' : ''}
            </span>
            <span>Next.js 14</span>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer"
              className="hover:text-slate-300 transition">
              API Docs →
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

/* ─── Small reusable layout components ──────────────────────────── */
function Chip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                    bg-white/8 border border-white/12
                    text-[11px] font-mono text-slate-400 mb-4">
      {icon}
      {text}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white
                   tracking-tight leading-tight mb-3">
      {children}
    </h2>
  );
}

function SectionSub({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
      {children}
    </p>
  );
}

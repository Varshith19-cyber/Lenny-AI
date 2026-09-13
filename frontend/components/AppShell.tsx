'use client';

import React, { useState, useEffect } from 'react';
import { Session, Message, Artifact, ModelProvider } from '../types';
import { fetchSessions, createSession, fetchMessages, sendMessage, fetchModels, fetchSessionArtifacts, fetchArtifact } from '../lib/api';
import { Sidebar } from './Sidebar';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { ArtifactViewer } from './ArtifactViewer';

export const AppShell: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('ollama');
  const [isLoading, setIsLoading] = useState(false);

  // Initial Load: Fetch Sessions & Available LLM Providers
  useEffect(() => {
    async function init() {
      try {
        const [sessionList, modelData] = await Promise.all([
          fetchSessions(),
          fetchModels().catch(() => ({ providers: [] }))
        ]);
        setSessions(sessionList);
        setProviders(modelData.providers || []);

        if (sessionList.length > 0) {
          setActiveSessionId(sessionList[0].id);
        } else {
          handleNewChat();
        }
      } catch (err) {
        console.error('Failed to initialize application:', err);
      }
    }
    init();
  }, []);

  // Fetch messages and artifacts when active session changes
  useEffect(() => {
    if (!activeSessionId) return;

    async function loadSessionData() {
      try {
        const [msgs, arts] = await Promise.all([
          fetchMessages(activeSessionId!),
          fetchSessionArtifacts(activeSessionId!).catch(() => [])
        ]);
        setMessages(msgs);
        setArtifacts(arts);
        if (arts.length > 0) {
          setSelectedArtifact(arts[0]);
        } else {
          setSelectedArtifact(null);
          setIsArtifactOpen(false);
        }
      } catch (err) {
        console.error('Failed to load session data:', err);
      }
    }
    loadSessionData();
  }, [activeSessionId]);

  // Create new session
  const handleNewChat = async () => {
    try {
      const newSession = await createSession('New Conversation');
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([]);
      setArtifacts([]);
      setSelectedArtifact(null);
      setIsArtifactOpen(false);
    } catch (err) {
      console.error('Failed to create new chat:', err);
    }
  };

  // Handle message sending
  const handleSendMessage = async (text: string) => {
    if (!activeSessionId) return;

    // Optimistic User Message update
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      session_id: activeSessionId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await sendMessage({
        session_id: activeSessionId,
        message: text,
        provider: selectedProvider
      });

      // Refresh messages & artifacts from backend
      const [updatedMsgs, updatedArts] = await Promise.all([
        fetchMessages(activeSessionId),
        fetchSessionArtifacts(activeSessionId).catch(() => [])
      ]);

      setMessages(updatedMsgs);
      setArtifacts(updatedArts);

      // If response generated an artifact, open viewer automatically!
      if (res.artifact_id) {
        const art = await fetchArtifact(res.artifact_id);
        setSelectedArtifact(art);
        setIsArtifactOpen(true);
      }

      // Update session list title
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId && s.title === 'New Conversation' ? { ...s, title: text.slice(0, 30) + '...' } : s))
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        session_id: activeSessionId,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to process request.'}`,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length > 0) setActiveSessionId(remaining[0].id);
      else handleNewChat();
    }
  };

  const handleSelectArtifact = async (artifactId: string) => {
    try {
      const art = await fetchArtifact(artifactId);
      setSelectedArtifact(art);
      setIsArtifactOpen(true);
    } catch (err) {
      console.error('Failed to select artifact:', err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* Left Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Conversation & Header */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <ChatHeader
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          providers={providers}
          activeArtifactCount={artifacts.length}
          onToggleArtifactViewer={() => setIsArtifactOpen(!isArtifactOpen)}
          isArtifactOpen={isArtifactOpen}
        />

        <div className="flex-1 flex h-[calc(100%-57px)] overflow-hidden">
          {/* Central Chat View */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              onSelectArtifact={handleSelectArtifact}
              artifacts={artifacts}
            />
            <Composer onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>

          {/* Right Artifact Viewer Panel */}
          {isArtifactOpen && (
            <div className="w-1/2 min-w-[380px] max-w-[650px] h-full border-l border-slate-800">
              <ArtifactViewer artifact={selectedArtifact} onClose={() => setIsArtifactOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

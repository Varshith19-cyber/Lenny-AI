import { Session, Message, Artifact, ModelProvider } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchSessions(): Promise<Session[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function createSession(title: string = 'New Conversation'): Promise<Session> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function fetchMessages(sessionId: string): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendMessage(payload: {
  session_id: string;
  message: string;
  provider?: string;
  model?: string;
}) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Chat request failed');
  }
  return res.json();
}

export async function fetchModels(): Promise<{ providers: ModelProvider[] }> {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
}

export async function fetchArtifact(artifactId: string): Promise<Artifact> {
  const res = await fetch(`${API_BASE}/artifacts/${artifactId}`);
  if (!res.ok) throw new Error('Failed to fetch artifact');
  return res.json();
}

export async function fetchSessionArtifacts(sessionId: string): Promise<Artifact[]> {
  const res = await fetch(`${API_BASE}/artifacts/session/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch session artifacts');
  return res.json();
}

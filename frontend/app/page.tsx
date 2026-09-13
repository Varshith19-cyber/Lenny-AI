'use client';

import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { LandingPage } from '../components/LandingPage';

export default function Home() {
  const [inChat, setInChat] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  const handleStartChat = () => {
    setChatKey((prev) => prev + 1);
    setInChat(true);
  };

  const handleGoToLanding = () => {
    setInChat(false);
  };

  if (inChat) {
    return <AppShell key={chatKey} onGoToLanding={handleGoToLanding} />;
  }

  return <LandingPage onEnterChat={handleStartChat} />;
}


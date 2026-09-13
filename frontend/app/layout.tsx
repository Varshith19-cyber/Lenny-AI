import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Lenny Growth Assistant',
  description: 'AI-powered conversational product and growth assistant grounded in Lenny\'s Podcast transcripts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}

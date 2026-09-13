import './globals.css';
import type { Metadata } from 'next';
import { PredictiveArcBackground } from '../components/PredictiveArcBackground';

export const metadata: Metadata = {
  title: 'Lenny AI — Grounded Growth Assistant',
  description: 'Full-stack AI conversational web application grounded in Lenny\'s Podcast transcripts. Built for product & growth leaders.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#090d16] text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        <PredictiveArcBackground />
        {children}
      </body>
    </html>
  );
}

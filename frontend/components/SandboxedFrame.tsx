'use client';

import React from 'react';

interface SandboxedFrameProps {
  htmlContent: string;
  title?: string;
}

export const SandboxedFrame: React.FC<SandboxedFrameProps> = ({ htmlContent, title = 'Artifact Preview' }) => {
  // Wrap HTML in baseline iframe template if not full document
  const srcDoc = htmlContent.includes('<!DOCTYPE html>')
    ? htmlContent
    : `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 1.5rem;
      background-color: #0f172a;
      color: #f8fafc;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

  return (
    <div className="w-full h-full min-h-[500px] border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-2xl relative">
      <div className="bg-slate-950/80 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-800 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Sandboxed Preview ({title})
        </span>
        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">sandbox="allow-scripts"</span>
      </div>
      <iframe
        title={title}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="w-full h-[calc(100%-33px)] border-0 bg-slate-900"
      />
    </div>
  );
};

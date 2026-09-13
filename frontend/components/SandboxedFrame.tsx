'use client';

import React from 'react';

interface SandboxedFrameProps {
  htmlContent: string;
  title?: string;
}

export const SandboxedFrame: React.FC<SandboxedFrameProps> = ({ htmlContent, title = 'Artifact Preview' }) => {
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
      background-color: #0b0f19;
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
    <div className="w-full h-full min-h-[550px] border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl relative flex flex-col">
      <div className="bg-slate-950 px-4 py-2 text-[11px] font-mono text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
          Sandboxed HTML Canvas ({title})
        </span>
        <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-mono">
          sandbox="allow-scripts"
        </span>
      </div>
      <iframe
        title={title}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="w-full flex-1 border-0 bg-[#0b0f19]"
      />
    </div>
  );
};

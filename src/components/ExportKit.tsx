import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, ExternalLink, Terminal, Layers, ShieldCheck, Box } from 'lucide-react';
import { EXPORT_FILES } from '../data/exportTemplates.js';

export const ExportKit: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState(EXPORT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto py-2">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-[#1a1d24] dark:text-[#f0f3f6]">
              Deploy Kit (Cloudflare Workers & GitHub Actions)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300">
              Wrangler Ready
            </span>
          </div>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
            Production repository configuration files ready for Wrangler CLI, Cloudflare Edge, and Supabase RLS migrations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] hover:bg-[#f8f9fa] dark:hover:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Content'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#f38020] hover:bg-[#d96e14] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: File Tree */}
        <div className="lg:col-span-1 bg-white dark:bg-[#161a22] rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] p-3 shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-[#80868b] uppercase tracking-wider px-2 py-1">
            Configuration Files
          </div>
          {EXPORT_FILES.map((file) => (
            <button
              key={file.name}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center space-x-2 transition-colors cursor-pointer ${
                selectedFile.name === file.name
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold border border-orange-200 dark:border-orange-800'
                  : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f8f9fb] dark:hover:bg-[#1f242e]'
              }`}
            >
              <FileCode className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono truncate">{file.name}</span>
            </button>
          ))}
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-3 bg-white dark:bg-[#161a22] rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] overflow-hidden shadow-2xs flex flex-col">
          <div className="px-4 py-2.5 bg-[#f8f9fb] dark:bg-[#1f242e] border-b border-[#e2e4e9] dark:border-[#252a35] flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
              {selectedFile.name}
            </span>
            <span className="text-[11px] text-[#80868b]">{selectedFile.description}</span>
          </div>

          <pre className="p-4 bg-[#0d1117] text-[#c9d1d9] font-mono text-xs overflow-x-auto flex-1 leading-relaxed">
            {selectedFile.content}
          </pre>
        </div>
      </div>
    </div>
  );
};

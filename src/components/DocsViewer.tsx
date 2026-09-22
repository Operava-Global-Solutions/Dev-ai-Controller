import React, { useState, useEffect } from 'react';
import { Database, ExternalLink, RefreshCw, Copy, Check, BookOpen, Layers } from 'lucide-react';
import type { LLMDocEntry } from '../types/index.js';

export const DocsViewer: React.FC = () => {
  const [docs, setDocs] = useState<LLMDocEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>('cf-workers-ai');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/docs/llms');
      const data = await res.json();
      if (data.success && data.docs) {
        setDocs(data.docs);
      }
    } catch (err) {
      console.warn('Failed to load llms docs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/docs/llms/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId }),
      });
      const data = await res.json();
      if (data.success && data.doc) {
        setDocs((prev) => prev.map((d) => (d.id === data.doc.id ? data.doc : d)));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const currentDoc = docs.find((d) => d.id === selectedId) || docs[0];

  const handleCopy = () => {
    if (!currentDoc) return;
    navigator.clipboard.writeText(currentDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#050505] dark:text-[#f5f5f7]">
            Documentation
          </h2>
          <p className="text-xs text-[#65676b] dark:text-[#b0b3b8] mt-0.5">
            Reference documentation and system context files.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {currentDoc && (
            <a
              href={currentDoc.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#18191a] border border-[#e4e6eb] dark:border-[#2e333d] hover:bg-[#f0f2f5] dark:hover:bg-[#242526] text-[#65676b] dark:text-[#b0b3b8] text-xs font-medium transition-colors cursor-pointer"
            >
              <span>Source URL</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#18191a] border border-[#e4e6eb] dark:border-[#2e333d] hover:bg-[#f0f2f5] dark:hover:bg-[#242526] text-[#050505] dark:text-[#f5f5f7] text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Live Fetch'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#0866ff] hover:bg-[#0055d4] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Content'}</span>
          </button>
        </div>
      </div>

      {/* Docs Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {docs.map((doc) => {
          const isSelected = doc.id === (currentDoc?.id || selectedId);
          return (
            <button
              key={doc.id}
              onClick={() => setSelectedId(doc.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#0866ff] text-white shadow-2xs font-semibold'
                  : 'bg-white dark:bg-[#18191a] text-[#65676b] dark:text-[#b0b3b8] border border-[#e4e6eb] dark:border-[#2e333d] hover:bg-[#f0f2f5] dark:hover:bg-[#242526]'
              }`}
            >
              {doc.title}
            </button>
          );
        })}
      </div>

      {/* Document Content Viewer */}
      {currentDoc ? (
        <div className="bg-white dark:bg-[#18191a] rounded-2xl border border-[#e4e6eb] dark:border-[#2e333d] shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-[#e4e6eb] dark:border-[#2e333d] bg-[#f7f8fa] dark:bg-[#242526]/50 flex items-center justify-between text-xs text-[#65676b] dark:text-[#8a8d91]">
            <span className="font-semibold text-[#050505] dark:text-[#f5f5f7]">
              {currentDoc.summary}
            </span>
            <span className="font-mono text-[11px]">
              Last synced: {new Date(currentDoc.lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="p-4 sm:p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="text-xs font-mono text-[#050505] dark:text-[#e4e6eb] leading-relaxed whitespace-pre-wrap">
              {currentDoc.content}
            </pre>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-[#65676b] dark:text-[#8a8d91]">
          <p className="text-xs">Loading context documentation...</p>
        </div>
      )}
    </div>
  );
};

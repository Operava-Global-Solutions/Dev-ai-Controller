import React, { useState, useEffect } from 'react';
import {
  Clock,
  MessageSquare,
  PlusCircle,
  Search,
  Trash2,
  ExternalLink,
  Tag,
  Calendar,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Terminal,
  Info,
  ArrowRight,
  Shield,
} from 'lucide-react';
import type { ChatSession, AiChatMessage } from '../types/index.js';

function formatCleanText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\*{3}([^*]+)\*{3}/g, '$1')
    .replace(/\*{2}([^*]+)\*{2}/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\*{1,3}/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[\s-]{3,}$/gm, '')
    .replace(/-\s*-\s*-+/g, '')
    .replace(/-\s*-/g, '—')
    .replace(/^[\t ]*[-*]\s+/gm, '• ')
    .trim();
}

interface ChatHistoryProps {
  onOpenSession: (sessionId: string) => void;
  onCreateNewChat: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  onOpenSession,
  onCreateNewChat,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<{
    session: ChatSession;
    messages: AiChatMessage[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat/sessions');
      const data = await res.json();
      if (data.success && data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to load chat history sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleInspectSession = async (session: ChatSession) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/chat/sessions/${session.id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedSessionDetail({
          session: data.session,
          messages: data.messages || [],
        });
      }
    } catch (err) {
      console.error('Failed to inspect session:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (selectedSessionDetail?.session.id === sessionId) {
          setSelectedSessionDetail(null);
        }
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(q);
    const snippetMatch = s.lastMessageSnippet?.toLowerCase().includes(q) || false;
    const tagMatch = s.tags.some((t) => t.toLowerCase().includes(q));
    return titleMatch || snippetMatch || tagMatch;
  });

  const totalMessagesCount = sessions.reduce((acc, s) => acc + (s.messageCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Operava Gradient Accent */}
      <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-gradient-to-r from-[#ff6b35] via-[#f38020] to-[#7928ca] text-white shadow-xs">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                  Chat History
                </h1>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                  Review and resume past conversations.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchSessions}
              className="p-2.5 rounded-xl border border-[#e2e4e9] dark:border-[#2b303c] text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
              title="Refresh History"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={onCreateNewChat}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 text-white shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#f0f2f5] dark:border-[#252a35]">
          <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] border border-[#e2e4e9] dark:border-[#232834]">
            <span className="text-[11px] text-[#80868b] block">Total Sessions</span>
            <span className="text-lg font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
              {sessions.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] border border-[#e2e4e9] dark:border-[#232834]">
            <span className="text-[11px] text-[#80868b] block">Total Messages</span>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {totalMessagesCount}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] border border-[#e2e4e9] dark:border-[#232834]">
            <span className="text-[11px] text-[#80868b] block">Status</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Saved & Up to Date</span>
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#80868b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chat sessions by title, prompt keyword, or tag..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] text-[#1a1d24] dark:text-[#f0f3f6] placeholder:text-[#80868b] focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Main Grid: Sessions List & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sessions List Column */}
        <div className={selectedSessionDetail ? 'lg:col-span-6 space-y-3' : 'lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'}>
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-xs text-[#80868b] space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-500" />
              <p>Loading historical chat sessions...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#e2e4e9] dark:border-[#282d38] p-12 text-center space-y-3">
              <MessageSquare className="h-8 w-8 text-[#80868b] mx-auto opacity-50" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                  No chat sessions found
                </h4>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                  {searchQuery ? 'Try clearing your search query.' : 'Click "Create New Empty Chat" above to start your first session.'}
                </p>
              </div>
              <button
                onClick={onCreateNewChat}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#ff6b35] to-[#9333ea] text-white shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Start New Empty Chat</span>
              </button>
            </div>
          ) : (
            filteredSessions.map((sess) => {
              const isSelected = selectedSessionDetail?.session.id === sess.id;
              const isDeleting = deleteConfirmId === sess.id;

              return (
                <div
                  key={sess.id}
                  className={`rounded-2xl border transition-all p-4 bg-white dark:bg-[#161a22] shadow-2xs flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-500/20'
                      : 'border-[#e2e4e9] dark:border-[#252a35] hover:border-purple-300 dark:hover:border-purple-800'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header: Title & Count */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </div>
                        <h3 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] line-clamp-1">
                          {sess.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] shrink-0">
                        {sess.messageCount} msgs
                      </span>
                    </div>

                    {/* Last Snippet */}
                    <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] line-clamp-2 leading-relaxed bg-[#f8f9fb] dark:bg-[#12161f] p-2.5 rounded-xl border border-[#e2e4e9]/60 dark:border-[#232834]">
                      {sess.lastMessageSnippet || 'Empty session.'}
                    </p>

                    {/* Tags */}
                    {sess.tags && sess.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {sess.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/60"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-[#f0f2f5] dark:border-[#252a35] flex items-center justify-between text-[11px]">
                    <span className="text-[10px] text-[#80868b] flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(sess.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {isDeleting ? (
                        <div className="flex items-center space-x-1 bg-red-50 dark:bg-red-950/40 px-2 py-1 rounded-lg border border-red-200 dark:border-red-800">
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">Delete?</span>
                          <button
                            onClick={() => handleDeleteSession(sess.id)}
                            className="text-[10px] font-bold text-red-700 hover:underline cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] text-gray-500 hover:underline cursor-pointer ml-1"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(sess.id)}
                          className="p-1.5 rounded-lg text-[#80868b] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Delete Session"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleInspectSession(sess)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] hover:bg-purple-100 dark:hover:bg-purple-950 transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => onOpenSession(sess.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-[#ff6b35] to-[#9333ea] text-white hover:opacity-90 shadow-2xs transition-all cursor-pointer"
                      >
                        <span>Open in Chat</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Inspector Drawer / Column */}
        {selectedSessionDetail && (
          <div className="lg:col-span-6 rounded-2xl border border-purple-300 dark:border-purple-800 bg-white dark:bg-[#161a22] shadow-brand-glow p-5 flex flex-col h-[650px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f2f5] dark:border-[#252a35]">
              <div>
                <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                  {selectedSessionDetail.session.title}
                </h3>
                <span className="text-[11px] text-[#80868b]">
                  {selectedSessionDetail.messages.length} messages logged
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenSession(selectedSessionDetail.session.id)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#ff6b35] to-[#9333ea] text-white hover:opacity-95 shadow-xs cursor-pointer"
                >
                  <span>Resume in Chat</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => setSelectedSessionDetail(null)}
                  className="p-1.5 rounded-xl text-[#80868b] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages Stream in Inspector with subtle dots */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 chat-dot-bg px-2">
              {selectedSessionDetail.messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#80868b]">
                  This session is currently empty.
                </div>
              ) : (
                selectedSessionDetail.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl text-xs space-y-2 ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-[#ff6b35]/15 to-[#9333ea]/15 border border-purple-200 dark:border-purple-800 text-[#1a1d24] dark:text-[#f0f3f6]'
                        : 'bg-white/95 dark:bg-[#1f232c]/95 border border-[#e2e4e9] dark:border-[#2d323e] text-[#1a1d24] dark:text-[#f0f3f6]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#80868b]">
                      <span className="font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {m.role === 'user' ? 'User Prompt' : 'Dev’ai Response'}
                      </span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap">{formatCleanText(m.content)}</p>

                    {/* Step Traces */}
                    {m.steps && m.steps.length > 0 && (
                      <div className="pt-2 border-t border-[#e2e4e9]/40 dark:border-[#2d323e] space-y-1">
                        <span className="text-[10px] font-semibold text-[#80868b] uppercase">Traced Steps:</span>
                        {m.steps.map((st, i) => (
                          <div key={i} className="flex items-center space-x-1.5 text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span>{st.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

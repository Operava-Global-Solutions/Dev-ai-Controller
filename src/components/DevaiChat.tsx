import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Zap,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Terminal,
  ShieldCheck,
  Info,
  Copy,
  Check,
  Flame,
  CornerDownLeft,
} from 'lucide-react';
import type {
  AiChatMessage,
  ChatSession,
} from '../types/index.js';

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

interface DevaiChatProps {
  activeSessionId?: string | null;
  onSelectSession?: (sessionId: string | null) => void;
  onNavigateToHistory?: () => void;
  onNavigateToKnowledge?: () => void;
}

export const DevaiChat: React.FC<DevaiChatProps> = ({
  activeSessionId,
  onSelectSession,
  onNavigateToHistory,
  onNavigateToKnowledge,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingElapsed, setThinkingElapsed] = useState<number>(0);
  const [thinkingStep, setThinkingStep] = useState<number>(0);
  const [thinkingDots, setThinkingDots] = useState<string>('.');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickPrompts = [
    'Audit Cloudflare Workers AI edge model health and token status',
    'Test sending a deployment alert email via Resend to developer@operava.com',
    'Inspect Supabase PostgreSQL connection and active RLS policies',
    'List repositories and staged pull requests on GitHub',
  ];

  // Cycling dots indicator: '.' -> '..' -> '...' -> '....'
  useEffect(() => {
    let dotInterval: any = null;
    if (isLoading) {
      dotInterval = setInterval(() => {
        setThinkingDots((prev) => {
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          if (prev === '...') return '....';
          return '.';
        });
      }, 350);
    } else {
      setThinkingDots('.');
    }
    return () => {
      if (dotInterval) clearInterval(dotInterval);
    };
  }, [isLoading]);

  // Timer & step simulator for animated "ai doing and thinking task"
  useEffect(() => {
    let interval: any = null;
    if (isLoading) {
      setThinkingElapsed(0);
      setThinkingStep(0);
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setThinkingElapsed(elapsed);
        if (elapsed > 1.8) {
          setThinkingStep(2);
        } else if (elapsed > 0.8) {
          setThinkingStep(1);
        } else {
          setThinkingStep(0);
        }
      }, 100);
    } else {
      setThinkingElapsed(0);
      setThinkingStep(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Auto-scroll chat history top moving up as responses and chat arrive
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, thinkingStep]);

  // Fetch all sessions
  const loadSessions = async () => {
    try {
      const res = await fetch('/api/chat/sessions');
      const data = await res.json();
      if (data.success && data.sessions) {
        setSessions(data.sessions);
        if (!currentSession && data.sessions.length > 0) {
          const target = activeSessionId
            ? data.sessions.find((s: ChatSession) => s.id === activeSessionId) || data.sessions[0]
            : data.sessions[0];
          selectSession(target.id);
        }
      }
    } catch (err) {
      console.warn('Failed to load chat sessions:', err);
    }
  };

  // Select and load a specific session
  const selectSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setCurrentSession(data.session);
        setMessages(data.messages || []);
        if (onSelectSession) onSelectSession(sessionId);
        setTimeout(() => scrollToBottom('auto'), 50);
      }
    } catch (err) {
      console.warn('Failed to load chat session messages:', err);
    }
  };

  // Create empty new chat session
  const handleCreateNewChat = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Fresh Chat Session',
          tags: ['Dev’ai Assistant'],
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSessions((prev) => [data.session, ...prev]);
        setCurrentSession(data.session);
        setMessages([]); // Empty fresh chat
        if (onSelectSession) onSelectSession(data.session.id);
      }
    } catch (err) {
      console.error('Failed to create new chat session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear current chat
  const handleClearChat = async () => {
    if (!currentSession) return;
    try {
      await fetch(`/api/chat/sessions/${currentSession.id}/clear`, { method: 'POST' });
      setMessages([]);
      setCurrentSession((prev) =>
        prev ? { ...prev, messageCount: 0, lastMessageSnippet: 'Session cleared.' } : null
      );
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId && activeSessionId !== currentSession?.id) {
      selectSession(activeSessionId);
    }
  }, [activeSessionId]);

  const toggleStepAccordion = (msgId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const promptText = inputValue.trim();
    if (!promptText || isLoading) return;

    let sessionId = currentSession?.id;
    if (!sessionId) {
      try {
        const createRes = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: promptText.slice(0, 36) }),
        });
        const createData = await createRes.json();
        if (createData.success) {
          sessionId = createData.session.id;
          setCurrentSession(createData.session);
          setSessions((prev) => [createData.session, ...prev]);
        }
      } catch (e) {
        console.error('Error creating initial session:', e);
      }
    }

    if (!sessionId) return;

    const tempUserMsg: AiChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: promptText }),
      });

      const data = await res.json();
      if (data.success && data.assistantMessage) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
          return [...filtered, data.userMessage || tempUserMsg, data.assistantMessage];
        });

        setCurrentSession((prev) =>
          prev
            ? {
                ...prev,
                messageCount: prev.messageCount + 2,
                lastMessageSnippet: promptText.slice(0, 80),
                updatedAt: new Date().toISOString(),
              }
            : null
        );
      } else {
        throw new Error(data.error || 'Server returned invalid response');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackErrorMsg: AiChatMessage = {
        id: `err-${Date.now()}`,
        sessionId,
        role: 'assistant',
        content: `Error executing command: ${err.message || 'Network timeout'}.`,
        status: 'error',
        timestamp: new Date().toISOString(),
        nonTechExplanation: {
          simpleSummary:
            'Dev’ai could not complete this request because the edge server connection took too long or experienced an interruption.',
          actionableFix:
            'Please check your connection and retry. If this repeats, check the Knowledge Center tab for common resolution steps.',
          suggestedActionLabel: 'Retry Command',
        },
      };
      setMessages((prev) => [...prev, fallbackErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full overflow-hidden select-text">
      {/* Top Header Bar (Cloudflare AI Assistant Style - No Cards) */}
      <div className="shrink-0 px-3 sm:px-5 py-2.5 flex items-center justify-between border-b border-[#e2e4e9]/70 dark:border-[#252a35]/70 bg-white/80 dark:bg-[#12161f]/80 backdrop-blur-xs">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center text-white shadow-xs">
              {isLoading ? (
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
            </div>
            {isLoading && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-[#1a1d24] dark:text-[#f0f3f6]">
                Dev’ai
              </h1>
              {isLoading && (
                <span className="inline-flex items-center space-x-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-300 dark:border-purple-700 shadow-2xs animate-pulse">
                  <span className="h-2 w-2 rounded-full border-2 border-purple-600 border-t-transparent animate-spin shrink-0" />
                  <span>Thinking{thinkingDots}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            onClick={handleCreateNewChat}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 text-white shadow-2xs transition-all cursor-pointer"
            title="Start fresh conversation"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] hover:bg-[#f0f2f5] dark:hover:bg-[#1f242e] transition-colors cursor-pointer"
              title="View all past chat history"
            >
              <Clock className="h-3.5 w-3.5 text-purple-500" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}

          {onNavigateToKnowledge && (
            <button
              onClick={onNavigateToKnowledge}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] hover:bg-[#f0f2f5] dark:hover:bg-[#1f242e] transition-colors cursor-pointer"
              title="Knowledge Center (Non-Tech Guides & Errors)"
            >
              <HelpCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Knowledge</span>
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-[#80868b] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Clear current chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Chat History Stream (Current Chat History moving up - No Cards) */}
      <div
        className={`flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6 chat-dot-bg ${
          isLoading ? 'is-thinking' : ''
        }`}
      >
        {/* Empty State when chat is empty or fresh */}
        {messages.length === 0 && !isLoading && (
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-4 max-w-xl mx-auto space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center text-white shadow-brand-glow animate-cf-glow">
              <Sparkles className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                How can I help you today?
              </h2>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed max-w-md">
                Ask anything about your services, deployments, repository, or troubleshooting guides.
              </p>
            </div>

            {/* Quick action chips (unboxed style) */}
            <div className="w-full space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-[#80868b] block">
                Suggested questions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputValue(qp);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 rounded-xl bg-white/80 dark:bg-[#161a22]/80 hover:bg-white dark:hover:bg-[#1a202c] border border-[#e2e4e9] dark:border-[#282e3b] hover:border-purple-400 dark:hover:border-purple-600/60 text-xs text-[#1a1d24] dark:text-[#f0f3f6] shadow-2xs transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] leading-relaxed line-clamp-2 text-[#5f6368] dark:text-[#c4c9d4] group-hover:text-purple-600 dark:group-hover:text-purple-300">
                      {qp}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isError = msg.status === 'error';
          const isStepsOpen = expandedSteps[msg.id];

          if (isUser) {
            return (
              <div key={msg.id} className="flex flex-col items-end">
                <div className="flex items-center space-x-1.5 text-[10px] text-[#80868b] mb-1 pr-1 font-medium">
                  <span>You</span>
                  <span>•</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs px-4 py-3 bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] border border-[#e2e4e9] dark:border-[#2c3240] text-xs leading-relaxed shadow-2xs font-normal">
                  <p className="whitespace-pre-wrap leading-relaxed">{formatCleanText(msg.content)}</p>
                </div>
              </div>
            );
          }

          // Assistant message - Unboxed Cloudflare AI Assistant Stream (No Cards)
          return (
            <div key={msg.id} className="flex items-start space-x-3 max-w-4xl">
              {/* Cloudflare Operava Assistant Avatar */}
              <div className="shrink-0 h-7 w-7 rounded-lg bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center text-white mt-1 shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                {/* Meta header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[11px] text-[#80868b]">
                    <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                      Dev’ai
                    </span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <button
                    onClick={() => handleCopyContent(formatCleanText(msg.content), msg.id)}
                    className="p-1 rounded-md text-[#80868b] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] hover:bg-[#f0f2f5] dark:hover:bg-[#1f242e] transition-colors cursor-pointer"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {/* Unboxed Content Body (Clean typography directly on stream) */}
                <div
                  className={`text-xs leading-relaxed ${
                    isError
                      ? 'text-red-700 dark:text-red-300 bg-red-50/80 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-800/80'
                      : 'text-[#1a1d24] dark:text-[#e4e7eb]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{formatCleanText(msg.content)}</p>
                </div>

                {/* Multi-step Execution Trace (Cloudflare AI Collapsible Pill) */}
                {msg.steps && msg.steps.length > 0 && (
                  <div className="pt-1">
                    <button
                      onClick={() => toggleStepAccordion(msg.id)}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#f0f2f5] dark:bg-[#1a1f29] text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors border border-[#e2e4e9] dark:border-[#282e3b] cursor-pointer"
                    >
                      <Terminal className="h-3 w-3 text-purple-500" />
                      <span>Executed in {msg.steps.length} steps</span>
                      {isStepsOpen ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                    </button>

                    {isStepsOpen && (
                      <div className="mt-2 pl-3 border-l-2 border-purple-300 dark:border-purple-700 space-y-2 py-1">
                        {msg.steps.map((step, sIdx) => (
                          <div key={sIdx} className="space-y-0.5 text-[11px]">
                            <div className="flex items-center space-x-1.5 text-[#1a1d24] dark:text-[#f0f3f6] font-medium">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                              <span>{step.title}</span>
                            </div>
                            {step.detail && (
                              <p className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6] font-mono pl-4.5">
                                {step.detail}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Non-Technical Explanation Callout */}
                {msg.nonTechExplanation && (
                  <div className="mt-2.5 p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-xs space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-purple-800 dark:text-purple-300 font-semibold text-[11px]">
                      <Info className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Plain English Summary</span>
                    </div>
                    <p className="text-[#333] dark:text-[#ddd] text-[11px] leading-relaxed">
                      {msg.nonTechExplanation.simpleSummary}
                    </p>
                    <div className="text-[11px] pt-0.5">
                      <span className="font-semibold text-purple-800 dark:text-purple-300">Action: </span>
                      <span className="text-[#555] dark:text-[#bbb]">{msg.nonTechExplanation.actionableFix}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Animated AI Doing and Thinking Task (Cloudflare UI Design) */}
        {isLoading && (
          <div className="flex items-start space-x-3 max-w-xl animate-in fade-in duration-300">
            {/* Glowing Operava / Cloudflare Ring */}
            <div className="shrink-0 h-7 w-7 rounded-lg bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center text-white mt-0.5 shadow-brand-glow animate-cf-glow">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
            </div>

            <div className="flex-1 space-y-2.5">
              {/* Task Header with elapsed time and animated indicators */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full border-2 border-purple-600 border-t-transparent animate-spin shrink-0" />
                  <span>Dev’ai is thinking{thinkingDots} & executing task</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                  {thinkingElapsed.toFixed(1)}s
                </span>
              </div>

              {/* Shimmer Progress Line */}
              <div className="h-1 w-full rounded-full overflow-hidden bg-purple-100 dark:bg-[#1f2430]">
                <div className="h-full w-full animate-shimmer rounded-full" />
              </div>

              {/* Animated task steps sequence */}
              <div className="space-y-1.5 text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                <div className="flex items-center space-x-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      thinkingStep >= 0 ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                  <span className={thinkingStep >= 0 ? 'text-[#1a1d24] dark:text-[#f0f3f6] font-medium' : ''}>
                    1. Analyzing request intent & zero-trust token isolation
                  </span>
                  {thinkingStep === 0 && <span className="text-[10px] text-purple-500 animate-pulse font-mono">active</span>}
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      thinkingStep >= 1 ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                  <span className={thinkingStep >= 1 ? 'text-[#1a1d24] dark:text-[#f0f3f6] font-medium' : ''}>
                    2. Querying Cloudflare Workers edge runtime
                  </span>
                  {thinkingStep === 1 && <span className="text-[10px] text-purple-500 animate-pulse font-mono">active</span>}
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      thinkingStep >= 2 ? 'bg-purple-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                  <span className={thinkingStep >= 2 ? 'text-[#1a1d24] dark:text-[#f0f3f6] font-medium' : ''}>
                    3. Synthesizing orchestration result & verifying state
                  </span>
                  {thinkingStep === 2 && <span className="text-[10px] text-purple-500 animate-pulse font-mono">active</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Part of the Chatbox (Cloudflare AI Command Bar - No Cards) */}
      <div className="shrink-0 border-t border-[#e2e4e9]/80 dark:border-[#252a35]/80 bg-white/95 dark:bg-[#10131a]/95 backdrop-blur-md px-3 sm:px-6 pt-2 pb-3 space-y-2">
        {/* Quick prompt suggestion pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-semibold text-[#80868b] uppercase shrink-0">
            Suggested:
          </span>
          {quickPrompts.slice(0, 3).map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => {
                setInputValue(prompt);
                textareaRef.current?.focus();
              }}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#f0f2f5] dark:bg-[#1a1f29] hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40 dark:hover:text-purple-300 border border-[#e2e4e9] dark:border-[#282e3b] text-[#5f6368] dark:text-[#9aa0a6] transition-colors cursor-pointer shrink-0"
            >
              {prompt.slice(0, 42)}...
            </button>
          ))}
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={handleSendMessage}
          className="relative rounded-2xl border border-[#e2e4e9] dark:border-[#2d3342] bg-[#f8f9fb] dark:bg-[#161a22] focus-within:border-purple-500 dark:focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all flex items-end p-1.5 gap-2 shadow-2xs"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dev’ai Controller or give an orchestration task (Press Enter to send, Shift+Enter for newline)..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs bg-transparent text-[#1a1d24] dark:text-[#f0f3f6] placeholder:text-[#80868b] focus:outline-hidden resize-none min-h-[36px] max-h-32 transition-colors disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 text-white shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLoading ? 'px-2.5 h-8 space-x-1.5' : 'h-8 w-8'
            }`}
            title={isLoading ? `AI is thinking${thinkingDots}` : 'Send prompt (Enter)'}
          >
            {isLoading ? (
              <div className="flex items-center space-x-1">
                <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
                <span className="text-[10px] font-mono tracking-wider">{thinkingDots}</span>
              </div>
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

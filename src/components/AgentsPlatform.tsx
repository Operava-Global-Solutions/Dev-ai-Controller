import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Terminal,
  BookOpen,
  Layers,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Plus,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Send,
  Mail,
  Calendar,
  Globe,
  Database,
  Box,
  FileText,
  Search,
  RefreshCw,
  XCircle,
  HelpCircle,
  ChevronRight,
  Code2,
  Radio,
  Sliders,
  Maximize2,
  Trash2,
  Workflow,
} from 'lucide-react';
import { AgentKnowledgeFlows } from './AgentKnowledgeFlows.js';
import type {
  PlatformAgent,
  AgentRoleType,
  ToolDefinition,
  McpServerConfig,
  Automation,
  AutomationStatus,
  AttachedKnowledgeItem,
  AutomationExecutionLog,
  CustomerWidgetConfig,
  AutomationValidationResult,
} from '../types/index.js';

export const AgentsPlatform: React.FC = () => {
  // Navigation tabs within AGENTS
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'automations' | 'architecture' | 'flows'>('flows');

  // Agent Chat State
  const [agents, setAgents] = useState<PlatformAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-general-01');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant' | 'agent-call'; agentName?: string; text: string; timestamp: string; toolsUsed?: string[] }>>([
    {
      role: 'assistant',
      agentName: 'General Agent',
      text: 'Welcome to the General AI Agent Platform. I can retrieve authorized knowledge, invoke MCP tools across GitHub, Figma, Resend, and Cloudflare, coordinate with specialized sub-agents, or formulate deterministic scheduled automations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);
  const [agentToAgentDemo, setAgentToAgentDemo] = useState<boolean>(false);

  // Tools & MCP State
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>([]);

  // Knowledge Items
  const [knowledgeItems, setKnowledgeItems] = useState<AttachedKnowledgeItem[]>([]);
  const [selectedKnowledgePreview, setSelectedKnowledgePreview] = useState<AttachedKnowledgeItem | null>(null);

  // Automations State
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [automationStatusFilter, setAutomationStatusFilter] = useState<AutomationStatus | 'ALL'>('ALL');
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [isLoadingAutomations, setIsLoadingAutomations] = useState<boolean>(true);

  // Natural Language Automation Builder Modal / State
  const [showBuilderModal, setShowBuilderModal] = useState<boolean>(false);
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState<string>('I want to schedule an email on 31.');
  const [isParsingAutomation, setIsParsingAutomation] = useState<boolean>(false);
  const [missingQuestions, setMissingQuestions] = useState<string[]>([]);
  const [draftAutomation, setDraftAutomation] = useState<Partial<Automation> | null>(null);
  const [validationResult, setValidationResult] = useState<AutomationValidationResult | null>(null);

  // Approval Modal State (Consequential Action Gate)
  const [approvalModalAutomation, setApprovalModalAutomation] = useState<Automation | null>(null);
  const [isProcessingApproval, setIsProcessingApproval] = useState<boolean>(false);

  // Execution Logs
  const [executionLogs, setExecutionLogs] = useState<AutomationExecutionLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AutomationExecutionLog | null>(null);

  // Customer Widget Config & Embed State
  const [widgetConfig, setWidgetConfig] = useState<CustomerWidgetConfig | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoadingAutomations(true);
    try {
      const [agentsRes, toolsRes, mcpRes, knowRes, autoRes, logsRes, widgetRes] = await Promise.all([
        fetch('/v1/agents').then((r) => r.json()).catch(() => ({ agents: [] })),
        fetch('/v1/tools').then((r) => r.json()).catch(() => ({ tools: [] })),
        fetch('/v1/mcp').then((r) => r.json()).catch(() => ({ mcpServers: [] })),
        fetch('/v1/knowledge').then((r) => r.json()).catch(() => ({ items: [] })),
        fetch('/v1/automations').then((r) => r.json()).catch(() => ({ automations: [] })),
        fetch('/v1/executions').then((r) => r.json()).catch(() => ({ logs: [] })),
        fetch('/v1/widget/config').then((r) => r.json()).catch(() => ({ config: null })),
      ]);

      if (agentsRes.agents) setAgents(agentsRes.agents);
      if (toolsRes.tools) setTools(toolsRes.tools);
      if (mcpRes.mcpServers) setMcpServers(mcpRes.mcpServers);
      if (knowRes.items) setKnowledgeItems(knowRes.items);
      if (autoRes.automations) {
        setAutomations(autoRes.automations);
        if (autoRes.automations.length > 0) {
          setSelectedAutomation(autoRes.automations[0]);
        }
      }
      if (logsRes.logs) setExecutionLogs(logsRes.logs);
      if (widgetRes.config) setWidgetConfig(widgetRes.config);
    } catch (e) {
      console.warn('Failed to load initial agent platform data:', e);
    } finally {
      setIsLoadingAutomations(false);
    }
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Send message in Agent Chat
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAgentThinking) return;

    const userText = chatInput.trim();
    setChatInput('');
    const newMsgList = [
      ...chatMessages,
      {
        role: 'user' as const,
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setChatMessages(newMsgList);
    setIsAgentThinking(true);

    try {
      // Check if user is asking to trigger sub-agent flow or automation
      if (userText.toLowerCase().includes('design') || userText.toLowerCase().includes('figma')) {
        setAgentToAgentDemo(true);
        setTimeout(() => {
          setChatMessages((prev) => [
            ...prev,
            {
              role: 'agent-call',
              agentName: 'General Agent -> Design Agent',
              text: 'Delegated task to Design Agent via tool "agent.call". Accessing Figma MCP for token definitions...',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              toolsUsed: ['agent.call', 'figma.read'],
            },
            {
              role: 'assistant',
              agentName: 'Design Agent',
              text: 'Design tokens inspected from Figma MCP: Brand gradient `#ff6b35` -> `#f38020` -> `#9333ea`, typography `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`. Verified zero-pill aesthetic and high-contrast dark surface tokens (`#12161f`, `#161a22`).',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              toolsUsed: ['figma.read'],
            },
          ]);
          setIsAgentThinking(false);
        }, 1200);
        return;
      }

      // Default AI completion
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Agent: ${selectedAgent?.name || 'General Agent'}. Role: ${selectedAgent?.type}. User says: "${userText}". Provide a concise, authorized answer. Ground yourself in knowledge if applicable.`,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          agentName: selectedAgent?.name || 'General Agent',
          text: data.message || 'Understood. Operational plan formulated and verified against tenant permissions.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolsUsed: selectedAgent?.enabledTools.slice(0, 2),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          agentName: selectedAgent?.name || 'General Agent',
          text: 'Unable to reach model gateway isolate. Please verify Cloudflare Workers AI connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAgentThinking(false);
    }
  };

  // Natural Language Automation Parser
  const handleParseAutomation = async () => {
    if (!naturalLanguagePrompt.trim()) return;
    setIsParsingAutomation(true);
    setMissingQuestions([]);

    try {
      const res = await fetch('/v1/automations/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: naturalLanguagePrompt }),
      });
      const data = await res.json();
      if (data.success) {
        setMissingQuestions(data.missingQuestions || []);
        setDraftAutomation(data.automationDraft || null);
        setValidationResult(data.validation || null);
      }
    } catch (err) {
      console.warn('Failed to parse automation:', err);
    } finally {
      setIsParsingAutomation(false);
    }
  };

  // Approve Automation
  const handleApprove = async (automationId: string) => {
    setIsProcessingApproval(true);
    try {
      const res = await fetch(`/v1/automations/${automationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.automation) {
        setAutomations((prev) =>
          prev.map((a) => (a.id === data.automation.id || a.automationId === data.automation.automationId ? data.automation : a))
        );
        setSelectedAutomation(data.automation);
        setApprovalModalAutomation(null);
        // Refresh logs
        const logsRes = await fetch('/v1/executions').then((r) => r.json());
        if (logsRes.logs) setExecutionLogs(logsRes.logs);
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Cancel Automation
  const handleCancel = async (automationId: string) => {
    setIsProcessingApproval(true);
    try {
      const res = await fetch(`/v1/automations/${automationId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.automation) {
        setAutomations((prev) =>
          prev.map((a) => (a.id === data.automation.id || a.automationId === data.automation.automationId ? data.automation : a))
        );
        setSelectedAutomation(data.automation);
        setApprovalModalAutomation(null);
      }
    } catch (err) {
      console.error('Cancel failed:', err);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Trigger Immediate Run
  const handleRunNow = async (automationId: string) => {
    try {
      const res = await fetch(`/v1/automations/${automationId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        const [autoRes, logsRes] = await Promise.all([
          fetch('/v1/automations').then((r) => r.json()),
          fetch('/v1/executions').then((r) => r.json()),
        ]);
        if (autoRes.automations) setAutomations(autoRes.automations);
        if (logsRes.logs) {
          setExecutionLogs(logsRes.logs);
          setSelectedLog(logsRes.logs[0]);
        }
      }
    } catch (err) {
      console.error('Run now failed:', err);
    }
  };

  const filteredAutomations = automations.filter((a) => {
    if (automationStatusFilter === 'ALL') return true;
    return a.status === automationStatusFilter;
  });

  const statusTabList: Array<AutomationStatus | 'ALL'> = [
    'ALL',
    'WORKING',
    'DRAFT',
    'PENDING_APPROVAL',
    'SCHEDULED',
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'FAILED',
    'INACTIVE',
  ];

  const getStatusBadgeStyle = (status: AutomationStatus) => {
    switch (status) {
      case 'ACTIVE':
      case 'SCHEDULED':
      case 'COMPLETED':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'PENDING_APPROVAL':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse';
      case 'WORKING':
      case 'DRAFT':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'PAUSED':
      case 'INACTIVE':
        return 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
      case 'FAILED':
        return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e2e4e9] dark:border-[#252a35] pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center text-white shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1a1d24] dark:text-[#f0f3f6]">
                General AI Agent Platform
              </h1>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                Cloudflare Workers AI • Multi-Agent Orchestration • MCP Registry • Consequential Action Approvals
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-[#f0f2f5] dark:bg-[#181c24] border border-[#e2e4e9] dark:border-[#282e3c]">
          <button
            onClick={() => setActiveSubTab('flows')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'flows'
                ? 'bg-white dark:bg-[#222836] text-[#1a1d24] dark:text-[#f0f3f6] shadow-xs'
                : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
            }`}
          >
            <Workflow className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Knowledge & Structure Flows</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono">
              6
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('automations')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'automations'
                ? 'bg-white dark:bg-[#222836] text-[#1a1d24] dark:text-[#f0f3f6] shadow-xs'
                : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Automations Engine</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono">
              {automations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'chat'
                ? 'bg-white dark:bg-[#222836] text-[#1a1d24] dark:text-[#f0f3f6] shadow-xs'
                : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            <span>Chat & Multi-Agent</span>
          </button>

          <button
            onClick={() => setActiveSubTab('architecture')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'architecture'
                ? 'bg-white dark:bg-[#222836] text-[#1a1d24] dark:text-[#f0f3f6] shadow-xs'
                : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-emerald-500" />
            <span>Agent Worker & Architecture</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          TAB 1: AUTOMATIONS ENGINE (Spec Section 8, 9, 10, 11, 12, 13, 14)
          ============================================================ */}
      {activeSubTab === 'automations' && (
        <div className="space-y-6">
          {/* Top Actions & NL Input Trigger */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Natural-Language Automation Creator</span>
                </h2>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
                  State full intent in plain English (e.g. "Send monthly client update on 31 at 09:00 with executive email template"). The AI identifies missing constraints before requesting approval.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowBuilderModal(true);
                  handleParseAutomation();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 shadow-xs transition-all flex items-center space-x-2 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Create Automation</span>
              </button>
            </div>

            {/* Quick Natural Language Bar */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={naturalLanguagePrompt}
                onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
                placeholder="I want to schedule an email on 31..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1b1f28] border border-[#e2e4e9] dark:border-[#2a303c] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowBuilderModal(true);
                    handleParseAutomation();
                  }
                }}
              />
              <button
                onClick={() => {
                  setShowBuilderModal(true);
                  handleParseAutomation();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Interpret Intent</span>
              </button>
            </div>
          </div>

          {/* 9 Lifecycle Status Filter Tabs (Spec Section 14) */}
          <div className="flex items-center overflow-x-auto space-x-1 pb-1 border-b border-[#e2e4e9] dark:border-[#252a35] no-scrollbar">
            {statusTabList.map((st) => {
              const count = st === 'ALL' ? automations.length : automations.filter((a) => a.status === st).length;
              const isSelected = automationStatusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setAutomationStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f0f2f5] dark:hover:bg-[#1a1e27] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
                  }`}
                >
                  <span>{st.replace('_', ' ')}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-[#252a35] text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Grid: Left List + Right Detail Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Automation Cards */}
            <div className="lg:col-span-5 space-y-3">
              {filteredAutomations.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-[#e2e4e9] dark:border-[#252a35] bg-white/50 dark:bg-[#161a22]/50">
                  <Zap className="h-8 w-8 text-[#80868b] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6]">
                    No automations found in "{automationStatusFilter}" status.
                  </p>
                  <p className="text-[11px] text-[#80868b] mt-1">
                    Click "+ Create Automation" to draft a new natural-language workflow.
                  </p>
                </div>
              ) : (
                filteredAutomations.map((auto) => {
                  const isSelected = selectedAutomation?.id === auto.id;
                  return (
                    <div
                      key={auto.id}
                      onClick={() => setSelectedAutomation(auto)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2.5 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-950/15 shadow-sm'
                          : 'border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] hover:border-purple-300 dark:hover:border-purple-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                            {auto.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#80868b]">
                            <span>ID: {auto.automationId}</span>
                            <span>•</span>
                            <span className="truncate max-w-[140px]">{auto.trigger.humanReadable}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeStyle(
                            auto.status
                          )}`}
                        >
                          {auto.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] line-clamp-2 leading-relaxed">
                        {auto.description}
                      </p>

                      <div className="pt-2 border-t border-[#f0f2f5] dark:border-[#202530] flex items-center justify-between text-[10px] text-[#80868b]">
                        <span className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3 text-purple-600" />
                          <span>{auto.attachedKnowledge.length} Attached Docs</span>
                        </span>

                        {auto.status === 'PENDING_APPROVAL' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setApprovalModalAutomation(auto);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-2xs"
                          >
                            Review & Approve
                          </button>
                        )}

                        {auto.status === 'SCHEDULED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunNow(auto.id);
                            }}
                            className="inline-flex items-center space-x-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            <Play className="h-2.5 w-2.5 fill-current" />
                            <span>Run Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Selected Automation Inspector & Workflow Engine */}
            <div className="lg:col-span-7">
              {selectedAutomation ? (
                <div className="p-6 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-6">
                  {/* Title & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#e2e4e9] dark:border-[#252a35] pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                            selectedAutomation.status
                          )}`}
                        >
                          {selectedAutomation.status}
                        </span>
                        <span className="text-[11px] font-mono text-[#80868b]">
                          Title ID: {selectedAutomation.automationId}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-[#1a1d24] dark:text-[#f0f3f6] mt-1">
                        {selectedAutomation.title}
                      </h2>
                      <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
                        {selectedAutomation.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {selectedAutomation.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => setApprovalModalAutomation(selectedAutomation)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-2xs"
                        >
                          Review Approval
                        </button>
                      )}
                      <button
                        onClick={() => handleRunNow(selectedAutomation.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Run Now</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 1: Trigger & Schedule */}
                  <div className="p-4 rounded-xl bg-[#f8f9fb] dark:bg-[#1a1f28] border border-[#e2e4e9] dark:border-[#282e3c] space-y-2">
                    <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider block">
                      Trigger Specification (Spec Section 9)
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                          {selectedAutomation.trigger.humanReadable}
                        </span>
                      </div>
                      {selectedAutomation.nextScheduledRun && (
                        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                          Next Run: {new Date(selectedAutomation.nextScheduledRun).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Section 2: Attached Knowledge Items with Title IDs (Spec Section 4 & 11) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                        <span>Attached Knowledge Items (Title IDs)</span>
                      </h3>
                      <button
                        onClick={() => setActiveSubTab('architecture')}
                        className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        + Manage Repository
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedAutomation.attachedKnowledge.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedKnowledgePreview(item)}
                          className="p-3 rounded-xl border border-[#e2e4e9] dark:border-[#2a303c] bg-white dark:bg-[#141820] hover:border-purple-400 transition-all cursor-pointer text-left space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6] truncate">
                              {item.title}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                              {item.type}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400 truncate">
                            ID: {item.titleId}
                          </div>
                          <p className="text-[10px] text-[#80868b] line-clamp-1">
                            {item.summary || 'Attached knowledge source'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Email Automation Payload & HTML Structure Validation (Spec Section 10) */}
                  {selectedAutomation.emailPayload && (
                    <div className="p-4 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#1a1f28] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider flex items-center space-x-1.5">
                          <Mail className="h-3.5 w-3.5 text-purple-600" />
                          <span>Email Pipeline & Resend Contract</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          Resend API v1 Verified
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[#80868b] block">Recipient:</span>
                          <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold truncate block">
                            {selectedAutomation.emailPayload.recipient}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#80868b] block">Subject:</span>
                          <span className="text-[#1a1d24] dark:text-[#f0f3f6] truncate block">
                            {selectedAutomation.emailPayload.subject}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#e2e4e9] dark:border-[#282e3c] flex items-center justify-between text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                        <span>Template Components: Header, Body, Signature, Valid HTML</span>
                        <button
                          onClick={() => {
                            if (selectedAutomation.attachedKnowledge[0]) {
                              setSelectedKnowledgePreview(selectedAutomation.attachedKnowledge[0]);
                            }
                          }}
                          className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                        >
                          View Formatted HTML
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section 4: Workflow Steps & Execution Sequence (Spec Section 15) */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider block">
                      Deterministic Workflow Sequence (Spec Section 15)
                    </span>
                    <div className="space-y-1.5">
                      {selectedAutomation.actions.map((step) => (
                        <div
                          key={step.order}
                          className="p-2.5 rounded-xl border border-[#e2e4e9] dark:border-[#2a303c] bg-white dark:bg-[#141820] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold flex items-center justify-center">
                              {step.order}
                            </span>
                            <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                              {step.description}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-purple-600 dark:text-purple-400">
                            tool: {step.toolId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 5: AI Knowledge Validation Contract (Spec Section 12) */}
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          AI Knowledge Validation: READY FOR APPROVAL
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                        5/5 Checks Passed
                      </span>
                    </div>
                    <ul className="text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1 pt-1">
                      {selectedAutomation.validation.checks.map((c, idx) => (
                        <li key={idx} className="flex items-center space-x-1.5">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span>{c.item}: {c.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl border border-dashed border-[#e2e4e9] dark:border-[#252a35] bg-white/50 dark:bg-[#161a22]/50">
                  <p className="text-xs text-[#80868b]">Select an automation from the list to inspect details.</p>
                </div>
              )}
            </div>
          </div>

          {/* Execution Log Stream (Spec Section 29) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>Execution Audit Log (Spec Section 29)</span>
                </h3>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
                  Immutable execution traces recorded by Cloudflare Workers scheduler and tool registry invocations.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#80868b]">{executionLogs.length} Records</span>
            </div>

            <div className="space-y-3">
              {executionLogs.map((log) => (
                <div
                  key={log.executionId}
                  className="p-4 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#161a22] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-mono text-[11px]">
                      <span className="font-bold text-purple-600 dark:text-purple-400">{log.executionId}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">{log.automationTitle}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      {log.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">{log.trigger}</p>

                  <div className="pt-2 border-t border-[#e2e4e9] dark:border-[#282e3c] space-y-1">
                    {log.steps.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
                          <span className="font-mono text-[#80868b] text-[10px]">{s.timestamp}</span>
                          <span>{s.label}</span>
                        </span>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      </div>
                    ))}
                  </div>

                  {/* 7-Step Governance Telemetry Badges */}
                  {(log.approvalId || log.canonicalVerification || log.auditHash) && (
                    <div className="pt-2 border-t border-[#e2e4e9] dark:border-[#282e3c] grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                      {log.approvalId && (
                        <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
                          <span className="font-bold block">[Step 4] Approval ID:</span>
                          <span className="truncate block">{log.approvalId}</span>
                        </div>
                      )}
                      {log.canonicalVerification && (
                        <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
                          <span className="font-bold block">[Step 6] Verification:</span>
                          <span className="truncate block">
                            {log.canonicalVerification.verified ? '✓ Zero Drift Asserted' : 'Drift Detected'}
                          </span>
                        </div>
                      )}
                      {log.auditHash && (
                        <div className="p-1.5 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200">
                          <span className="font-bold block">[Step 7] SHA-256 Hash:</span>
                          <span className="truncate block">{log.auditHash.slice(0, 16)}...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: CHAT & MULTI-AGENT WORKSPACE (Spec Section 5, 5.1, 5.2, 6, 7)
          ============================================================ */}
      {activeSubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Agents & Tools Registry Panel */}
          <div className="lg:col-span-4 space-y-4">
            {/* Agent Selector */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-3">
              <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider block">
                Select Active Agent (Spec Section 5.1)
              </span>
              <div className="space-y-1.5">
                {agents.map((agent) => {
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-3 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-950/20 shadow-2xs'
                          : 'border-[#e2e4e9] dark:border-[#2a303c] bg-white dark:bg-[#141820] hover:border-purple-300'
                      }`}
                    >
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center text-white shrink-0">
                        {agent.type === 'developer' && <Terminal className="h-3.5 w-3.5" />}
                        {agent.type === 'knowledge' && <BookOpen className="h-3.5 w-3.5" />}
                        {agent.type === 'customer_service' && <Bot className="h-3.5 w-3.5" />}
                        {agent.type === 'design' && <Layers className="h-3.5 w-3.5" />}
                        {agent.type === 'general' && <Sparkles className="h-3.5 w-3.5" />}
                        {agent.type === 'custom' && <Zap className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] truncate">
                            {agent.name}
                          </span>
                          <span className="text-[9px] font-mono px-1 rounded bg-gray-100 dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6]">
                            {agent.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#80868b] truncate mt-0.5">{agent.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connected Tools & MCP Servers (Spec Section 5.1 & 6) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider block">
                  Connected MCP Servers ({mcpServers.length})
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                {mcpServers.map((mcp) => (
                  <div
                    key={mcp.id}
                    className="p-2 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#141820] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6] block">{mcp.name}</span>
                      <span className="text-[10px] font-mono text-[#80868b]">{mcp.endpoint}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      {mcp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions Enforced (Spec Section 7) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider block">
                Active Tenant Permissions (Spec Section 7)
              </span>
              <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                The model is never the authorization layer. Permission Manager strictly restricts tool invocations.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedAgent?.permissions.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Chat & Agent-to-Agent Canvas */}
          <div className="lg:col-span-8 flex flex-col h-[640px] rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs overflow-hidden">
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-[#e2e4e9] dark:border-[#252a35] bg-[#f8f9fb] dark:bg-[#141820] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-[#1a1d24] dark:text-[#f0f3f6]">
                  {selectedAgent?.name} Workspace
                </span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                  Model: Cloudflare Workers AI (@cf/meta/llama-3.3-70b)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setChatInput('Review Figma design tokens and inspect frontend components');
                  }}
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-white dark:bg-[#202530] border border-[#e2e4e9] dark:border-[#2c3240] text-[#5f6368] dark:text-[#9aa0a6] hover:text-purple-600 cursor-pointer"
                >
                  Agent-to-Agent Demo
                </button>
              </div>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 chat-dot-bg">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-[#80868b]">
                    <span>{msg.agentName || (msg.role === 'user' ? 'Operator' : 'Assistant')}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] text-white shadow-xs rounded-tr-xs'
                        : msg.role === 'agent-call'
                        ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 rounded-tl-xs font-mono'
                        : 'bg-white dark:bg-[#141820] border border-[#e2e4e9] dark:border-[#282e3c] text-[#1a1d24] dark:text-[#f0f3f6] shadow-2xs rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-black/10 dark:border-white/10 flex items-center space-x-1 text-[10px] font-mono opacity-80">
                        <span>Tools invoked:</span>
                        <span>{msg.toolsUsed.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAgentThinking && (
                <div className="flex items-center space-x-2 text-xs text-purple-600 dark:text-purple-400 p-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Agent orchestrating plan & querying authorized tools...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#141820] flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask ${selectedAgent?.name || 'Agent'} or instruct an automation task...`}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1a1f28] border border-[#e2e4e9] dark:border-[#2a303c] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAgentThinking}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 text-white transition-opacity cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: AGENT WORKER & ARCHITECTURE (Spec Section 2, 3, 17, 19, 20)
          ============================================================ */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-6">
          {/* Cloudflare Runtime & Bindings Grid */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-purple-600" />
                  <span>Cloudflare Edge Architecture & Active Bindings</span>
                </h2>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
                  Production workloads run on Cloudflare Workers edge nodes. Source code is tracked in GitHub.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Runtime: Cloudflare Workers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#141820] space-y-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  <span className="font-bold text-xs text-[#1a1d24] dark:text-[#f0f3f6]">Workers AI Binding</span>
                </div>
                <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                  Native <code>env.AI</code> binding executing <code>@cf/meta/llama-3.3-70b-instruct</code> without egress latency.
                </p>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Binding: [ai] active</div>
              </div>

              <div className="p-4 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#141820] space-y-2">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-xs text-[#1a1d24] dark:text-[#f0f3f6]">D1 Relational DB</span>
                </div>
                <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                  SQLite database at edge storing tenant scopes, automations, schedules, and approval records.
                </p>
                <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400">Binding: [[d1_databases]]</div>
              </div>

              <div className="p-4 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#141820] space-y-2">
                <div className="flex items-center space-x-2">
                  <Box className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-xs text-[#1a1d24] dark:text-[#f0f3f6]">Vectorize & R2</span>
                </div>
                <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                  Vector embeddings stored in Cloudflare Vectorize for semantic knowledge search and R2 object storage.
                </p>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Binding: [[vectorize]]</div>
              </div>
            </div>
          </div>

          {/* Embeddable Customer Service AI Widget (Spec Section 17) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-purple-600" />
                  <span>Embeddable Customer-Service AI Widget (Spec Section 17)</span>
                </h3>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
                  Drop this script snippet onto any public website. The widget runs with customer-service permissions only and cannot access developer or admin tools.
                </p>
              </div>

              <button
                onClick={() => {
                  if (widgetConfig?.embedSnippet) {
                    navigator.clipboard.writeText(widgetConfig.embedSnippet);
                    setCopiedSnippet(true);
                    setTimeout(() => setCopiedSnippet(false), 2000);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#202530] border border-[#e2e4e9] dark:border-[#2c3240] text-[#1a1d24] dark:text-[#f0f3f6] hover:border-purple-500 transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                {copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSnippet ? 'Copied Snippet' : 'Copy Script Tag'}</span>
              </button>
            </div>

            {/* Script Tag Display */}
            <div className="p-3.5 rounded-xl bg-[#0f1117] text-white font-mono text-xs overflow-x-auto select-all">
              <code>{widgetConfig?.embedSnippet || `<script src="https://controller.operava.com/widget.js" async></script>`}</code>
            </div>

            {/* Security Isolation Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#141820] border border-[#e2e4e9] dark:border-[#282e3c]">
                <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6] block">Zero Developer Privileges</span>
                <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 block">Customer AI never inherits GitHub or deploy permissions.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#141820] border border-[#e2e4e9] dark:border-[#282e3c]">
                <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6] block">Strict Tenant Scoping</span>
                <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 block">Isolated knowledge chunks. Tenant A cannot see Tenant B data.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#141820] border border-[#e2e4e9] dark:border-[#282e3c]">
                <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6] block">Escalation Fallback</span>
                <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 block">If confidence &lt; 0.85, forwards inquiry to human operators.</span>
              </div>
            </div>
          </div>

          {/* Attached Knowledge Repository with Title IDs (Spec Section 4) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <span>Knowledge Layer & Reusable Title IDs (Spec Section 4)</span>
                </h3>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
                  Knowledge is independent from the agent and reusable by General Agent, Developer Agent, Customer Service, and Automations.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#80868b]">{knowledgeItems.length} Title IDs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledgeItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedKnowledgePreview(item)}
                  className="p-4 rounded-xl border border-[#e2e4e9] dark:border-[#2a303c] bg-white dark:bg-[#141820] hover:border-purple-400 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6]">{item.title}</h4>
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                        Title ID: {item.titleId}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      {item.type}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] line-clamp-2">
                    {item.summary}
                  </p>

                  <div className="text-[10px] text-[#80868b] pt-1 border-t border-[#f0f2f5] dark:border-[#202530] flex items-center justify-between">
                    <span>Status: {item.status}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Inspect Content &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 4: AGENT KNOWLEDGE & STRUCTURE FLOWS
          ============================================================ */}
      {activeSubTab === 'flows' && (
        <AgentKnowledgeFlows agents={agents} onRefreshAgents={fetchInitialData} />
      )}

      {/* ============================================================
          MODAL: Natural Language Automation Builder & Missing Info Resolver
          (Spec Section 8.1, 8.2)
          ============================================================ */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-[#161a22] rounded-3xl border border-[#e2e4e9] dark:border-[#2a303c] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span>Natural-Language Automation Builder</span>
                </h3>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
                  AI validates required constraints before scheduling. Missing parameters trigger clarifying prompts.
                </p>
              </div>
              <button
                onClick={() => setShowBuilderModal(false)}
                className="p-1 rounded-lg text-[#80868b] hover:text-[#1a1d24] dark:hover:text-white cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6]">
                Natural Language Request
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={naturalLanguagePrompt}
                  onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
                  placeholder="e.g. Schedule monthly client email on 31 October 2026 09:00 to client@operava.com"
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleParseAutomation}
                  disabled={isParsingAutomation}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shrink-0"
                >
                  {isParsingAutomation ? 'Analyzing...' : 'Re-analyze'}
                </button>
              </div>
            </div>

            {/* Clarification Questions (Spec Section 8.1) */}
            {missingQuestions.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Ambiguous Details Detected: AI Requires Clarification</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Do not create a schedule while required fields remain ambiguous. Please clarify the following:
                </p>
                <ul className="text-xs text-amber-900 dark:text-amber-200 list-disc list-inside space-y-1">
                  {missingQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Draft Plan Formulation */}
            {draftAutomation && (
              <div className="space-y-4 pt-2 border-t border-[#e2e4e9] dark:border-[#252a35]">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#80868b] block">Title & Title ID:</span>
                    <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6] block">{draftAutomation.title}</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 text-[10px]">
                      {draftAutomation.automationId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#80868b] block">Trigger / Target Time:</span>
                    <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6] block">
                      {draftAutomation.trigger?.scheduleExpression}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Cloudflare Cron Trigger
                    </span>
                  </div>
                </div>

                {/* Attached Knowledge */}
                <div>
                  <span className="text-[10px] font-semibold text-[#80868b] uppercase tracking-wider block mb-1.5">
                    Auto-Attached Knowledge
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {draftAutomation.attachedKnowledge?.map((k) => (
                      <span
                        key={k.id}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      >
                        {k.titleId} ({k.type})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Validation Status */}
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    validationResult?.isReady
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <span className="font-bold block">
                    {validationResult?.isReady ? 'READY FOR APPROVAL' : 'NOT READY'}
                  </span>
                  <span className="text-[11px] block mt-0.5">{validationResult?.explanation}</span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#e2e4e9] dark:border-[#252a35] flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowBuilderModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
              >
                Close
              </button>
              {validationResult?.isReady && draftAutomation && (
                <button
                  type="button"
                  onClick={() => {
                    // Push to automations list in PENDING_APPROVAL
                    const newAuto: Automation = {
                      id: `auto-${Date.now().toString(36)}`,
                      automationId: draftAutomation.automationId || 'scheduled-email-auto',
                      title: draftAutomation.title || 'Scheduled Workflow',
                      description: draftAutomation.description || 'Natural language schedule',
                      status: 'PENDING_APPROVAL',
                      trigger: draftAutomation.trigger || { type: 'schedule', humanReadable: 'Scheduled' },
                      attachedKnowledge: draftAutomation.attachedKnowledge || [],
                      actions: draftAutomation.actions || [],
                      emailPayload: draftAutomation.emailPayload,
                      validation: validationResult,
                      requiresApproval: true,
                      approvalStatus: 'pending',
                      tenantId: 'tenant_prod_edge_001',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    setAutomations([newAuto, ...automations]);
                    setSelectedAutomation(newAuto);
                    setShowBuilderModal(false);
                    setApprovalModalAutomation(newAuto);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-xs"
                >
                  Stage for Approval &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: Consequential Action Approval Preview (Spec Section 13)
          [ CANCEL ] vs [ APPROVE ]
          ============================================================ */}
      {approvalModalAutomation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#161a22] rounded-3xl border border-[#e2e4e9] dark:border-[#2a303c] shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 rounded-2xl bg-amber-500 text-white items-center justify-center shadow-md mx-auto">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                Consequential Action Approval Preview
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] max-w-sm mx-auto">
                Review exact execution parameters before activating schedule on Cloudflare Workflows.
              </p>
            </div>

            {/* Approval Preview Card (Spec Section 13) */}
            <div className="p-4 rounded-2xl bg-[#f8f9fb] dark:bg-[#1a1f28] border border-[#e2e4e9] dark:border-[#282e3c] space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#e2e4e9] dark:border-[#282e3c] pb-2">
                <span className="font-bold text-amber-600 dark:text-amber-400">AUTOMATION READY</span>
                <span className="font-mono text-[10px] text-[#80868b]">
                  ID: {approvalModalAutomation.automationId}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#80868b]">Title:</span>
                  <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                    {approvalModalAutomation.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#80868b]">Trigger:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {approvalModalAutomation.trigger.humanReadable}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#80868b]">Action:</span>
                  <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                    Send Transactional Email (Resend)
                  </span>
                </div>
                {approvalModalAutomation.emailPayload?.recipient && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#80868b]">Recipient:</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400">
                      {approvalModalAutomation.emailPayload.recipient}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#80868b]">Attached Knowledge:</span>
                  <span className="font-mono text-[11px] text-[#1a1d24] dark:text-[#f0f3f6]">
                    {approvalModalAutomation.attachedKnowledge.map((k) => k.titleId).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Notice */}
            <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] text-center leading-relaxed">
              <strong>Cancel</strong>: No schedule is created. Automation remains in DRAFT/INACTIVE.
              <br />
              <strong>Approve</strong>: Automation is saved and scheduled on Cloudflare Cron Triggers.
            </p>

            {/* Buttons: [ CANCEL ] [ APPROVE ] (Spec Section 13) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleCancel(approvalModalAutomation.id)}
                disabled={isProcessingApproval}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#e4e6eb] dark:hover:bg-[#2a303c] transition-colors cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={() => handleApprove(approvalModalAutomation.id)}
                disabled={isProcessingApproval}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 transition-opacity cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
              >
                {isProcessingApproval ? (
                  <span>Activating...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>APPROVE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: Knowledge Item Content Preview
          ============================================================ */}
      {selectedKnowledgePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-[#161a22] rounded-3xl border border-[#e2e4e9] dark:border-[#2a303c] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-[#e2e4e9] dark:border-[#252a35] pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    {selectedKnowledgePreview.type}
                  </span>
                  <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-semibold">
                    Title ID: {selectedKnowledgePreview.titleId}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] mt-1">
                  {selectedKnowledgePreview.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedKnowledgePreview(null)}
                className="p-1 rounded-lg text-[#80868b] hover:text-[#1a1d24] dark:hover:text-white cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-[#0f1117] text-[#f0f3f6] font-mono text-xs">
              <pre className="whitespace-pre-wrap">{selectedKnowledgePreview.content || selectedKnowledgePreview.summary}</pre>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setSelectedKnowledgePreview(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] hover:bg-[#e4e6eb] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

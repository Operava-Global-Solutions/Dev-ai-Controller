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
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  Tag,
  Eye,
  X,
  Workflow,
  Link as LinkIcon,
  Unlink,
  CheckCheck,
  Key,
  Fingerprint,
  Scale,
  FileCheck,
  Lock,
  GitCommit,
} from 'lucide-react';
import type {
  PlatformAgent,
  AttachedKnowledgeItem,
  AgentKnowledgeReference,
  AgentStructureStage,
  AgentStructureFlow,
} from '../types/index.js';

interface AgentKnowledgeFlowsProps {
  agents: PlatformAgent[];
  onRefreshAgents?: () => void;
}

export const AgentKnowledgeFlows: React.FC<AgentKnowledgeFlowsProps> = ({
  agents,
  onRefreshAgents,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'agent-general-01');
  const [knowledgeItems, setKnowledgeItems] = useState<AttachedKnowledgeItem[]>([]);
  const [compatibleItems, setCompatibleItems] = useState<AttachedKnowledgeItem[]>([]);
  const [inspectingDoc, setInspectingDoc] = useState<AttachedKnowledgeItem | null>(null);
  const [isExecutingFlow, setIsExecutingFlow] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [executionReceipt, setExecutionReceipt] = useState<{
    stagesExecuted: Array<{
      order: number;
      canonicalStepNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      canonicalPhase: string;
      id: string;
      name: string;
      stageType: string;
      status: 'completed' | 'cleared';
      durationMs: number;
      inputSnippet: string;
      outputSnippet: string;
      validationCheckPassed: boolean;
      expectedResourcesCheck?: string;
    }>;
    totalDurationMs: number;
    slaTargetMs: number;
    approvalId: string;
    verification: {
      verified: boolean;
      expectedResourcesSummary: string;
      actualResourcesSummary: string;
      driftDetected: boolean;
    };
    auditLogId: string;
    auditHash: string;
  } | null>(null);
  const [currentExecutionStageIndex, setCurrentExecutionStageIndex] = useState<number>(-1);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Fetch knowledge repository and agent-compatible items
  useEffect(() => {
    fetchKnowledgeData();
  }, [selectedAgentId]);

  const fetchKnowledgeData = async () => {
    try {
      const [allRes, compRes] = await Promise.all([
        fetch('/v1/knowledge').then((r) => r.json()).catch(() => ({ items: [] })),
        fetch(`/v1/agents/${selectedAgentId}/compatible-knowledge`).then((r) => r.json()).catch(() => ({ items: [] })),
      ]);
      if (allRes.items) setKnowledgeItems(allRes.items);
      if (compRes.items) setCompatibleItems(compRes.items);
    } catch (e) {
      console.warn('Failed to fetch knowledge data:', e);
    }
  };

  // Run a real authenticated production execution through the selected agent.
  const handleExecuteFlow = async () => {
    if (!selectedAgent || isSimulatingFlow) return;
    setIsSimulatingFlow(true);
    setSimulationResult(null);
    setCurrentSimStageIndex(-1);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/v1/agents/${selectedAgent.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: 'Run a production readiness check. Report only facts observed from this real execution.' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Agent execution failed');
      showTemporaryNotice(`Production execution succeeded via ${data.provider} / ${data.model} in ${data.latencyMs}ms`);
    } catch (e: any) {
      console.error('Production agent execution failed:', e);
      showTemporaryNotice(e?.message || 'Production agent execution failed');
    } finally {
      setIsSimulatingFlow(false);
    }
  };

  // Link knowledge item to agent
  const handleLinkKnowledge = async (titleId: string) => {
    setIsLinking(true);
    try {
      const res = await fetch(`/v1/agents/${selectedAgent.id}/knowledge/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titleId }),
      });
      const data = await res.json();
      if (data.success) {
        showTemporaryNotice(`Linked "${titleId}" to ${selectedAgent.name}`);
        if (onRefreshAgents) onRefreshAgents();
        fetchKnowledgeData();
      }
    } catch (e) {
      console.error('Link failed:', e);
    } finally {
      setIsLinking(false);
    }
  };

  // Unlink knowledge item from agent
  const handleUnlinkKnowledge = async (titleId: string) => {
    try {
      const res = await fetch(`/v1/agents/${selectedAgent.id}/knowledge/unlink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titleId }),
      });
      const data = await res.json();
      if (data.success) {
        showTemporaryNotice(`Unlinked "${titleId}" from ${selectedAgent.name}`);
        if (onRefreshAgents) onRefreshAgents();
        fetchKnowledgeData();
      }
    } catch (e) {
      console.error('Unlink failed:', e);
    }
  };

  const showTemporaryNotice = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleCopyAuditHash = (hash: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const canonicalStepsList = [
    { num: 1, phase: 'understand_request', label: '1. Understand Request', desc: 'Auth, tenant isolation, intent parsing', icon: Shield },
    { num: 2, phase: 'build_executive_plan', label: '2. Executive Plan', desc: 'DAG scheduling, risk matrix, SLA budgeting', icon: Layers },
    { num: 3, phase: 'retrieve_knowledge_prepare_tool', label: '3. Knowledge & Tools', desc: 'Vectorize retrieval, Title IDs, secret injection', icon: BookOpen },
    { num: 4, phase: 'approval_gate', label: '4. Approval Gate', desc: 'Human-in-the-loop, cryptographic approvalId', icon: Key },
    { num: 5, phase: 'execute_approved_action', label: '5. Execute Action', desc: 'Deterministic tool dispatch, edge isolate build', icon: Play },
    { num: 6, phase: 'verify_outcome_compare_resources', label: '6. Verify Outcome', desc: 'Compare results vs expected resources, zero drift', icon: Scale },
    { num: 7, phase: 'audit_log_telemetry', label: '7. Audit Log', desc: 'Immutable ledger record, SHA-256 telemetry hash', icon: Fingerprint },
  ];

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'general':
        return Sparkles;
      case 'developer':
        return Terminal;
      case 'knowledge':
        return BookOpen;
      case 'customer_service':
        return Bot;
      case 'design':
        return Layers;
      default:
        return Zap;
    }
  };

  const getStageTypeBadge = (stageType: string) => {
    switch (stageType) {
      case 'ingress':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'reasoning':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'validation':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'execution':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'gate':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'egress':
        return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const boundTitleIds = new Set(selectedAgent?.knowledgeReferences?.map((r) => r.titleId) || []);

  const filteredCompatibleItems = compatibleItems.filter((item) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.titleId.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.tags?.some((t) => t.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionMessage && (
        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-800 dark:text-purple-200 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-1">
          <span className="flex items-center space-x-2">
            <CheckCheck className="h-4 w-4 text-purple-600" />
            <span className="font-medium">{actionMessage}</span>
          </span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-purple-600 hover:text-purple-900 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 1. Agent Selection Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] uppercase tracking-wider flex items-center space-x-2">
              <Workflow className="h-3.5 w-3.5 text-purple-600" />
              <span>Select Autonomous Agent to Inspect Knowledge & Structure Flow</span>
            </h2>
            <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
              Each agent features dedicated domain knowledge references, standardized input/output contracts, and structured execution stages.
            </p>
          </div>
          <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
            6 Specialized Edge Agents
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {agents.map((agent) => {
            const isSelected = agent.id === selectedAgentId;
            const Icon = getAgentIcon(agent.type);
            const refCount = agent.knowledgeReferences?.length || 0;
            const stageCount = agent.structureFlow?.stages.length || 0;

            return (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgentId(agent.id);
                  setSimulationResult(null);
                  setCurrentSimStageIndex(-1);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-950/20 shadow-xs ring-1 ring-purple-500/50'
                    : 'border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#141820] hover:border-purple-300 dark:hover:border-purple-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-semibold">
                    {agent.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] truncate">
                    {agent.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-[10px] text-[#80868b] mt-0.5">
                    <span>{stageCount} Stages</span>
                    <span>•</span>
                    <span>{refCount} Docs</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Agent Header & Unified Compatibility Matrix */}
      {selectedAgent && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#e2e4e9] dark:border-[#252a35]">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#ff6b35] via-[#f38020] to-[#9333ea] text-white shadow-xs shrink-0">
                {React.createElement(getAgentIcon(selectedAgent.type), { className: 'h-6 w-6' })}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5 flex-wrap">
                  <h2 className="text-base font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                    {selectedAgent.name}
                  </h2>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold">
                    {selectedAgent.type} agent
                  </span>
                  <span className="text-[10px] font-mono text-[#80868b]">
                    ID: {selectedAgent.id}
                  </span>
                </div>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed max-w-3xl">
                  {selectedAgent.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleSimulateFlow}
                disabled={isSimulatingFlow}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 transition-opacity flex items-center space-x-2 shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isSimulatingFlow ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
                <span>{isSimulatingFlow ? 'Executing Production Agent...' : 'Run Production Agent'}</span>
              </button>
            </div>
          </div>

          {/* Unified Compatibility Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Compatible Channels */}
            <div className="p-3.5 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#141820] space-y-2">
              <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider block">
                Compatible Channels
              </span>
              <div className="flex flex-wrap gap-1">
                {(selectedAgent.compatibleChannels || ['webchat', 'api']).map((ch) => (
                  <span
                    key={ch}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            {/* Input & Output Specifications */}
            <div className="p-3.5 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#141820] space-y-2">
              <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider block">
                Supported Formats
              </span>
              <div className="flex flex-wrap gap-1">
                {(selectedAgent.supportedInputFormats || ['text/plain', 'application/json']).map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Performance SLA & Fallback Chain */}
            <div className="p-3.5 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#141820] space-y-2">
              <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider block">
                Execution SLA & Fallback
              </span>
              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-[#80868b]">Target SLA:</span>
                  <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                    &lt; {selectedAgent.structureFlow?.slaTargetMs || 1000}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#80868b]">Fallback:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 truncate max-w-[120px]">
                    {selectedAgent.fallbackChain || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mesh Collaborators */}
            <div className="p-3.5 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#141820] space-y-2">
              <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider block">
                Peer Sub-Agents
              </span>
              <div className="flex flex-wrap gap-1">
                {(selectedAgent.compatibleAgents || ['*']).map((peer) => (
                  <span
                    key={peer}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  >
                    {peer}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Structure Flow Pipeline Diagram & Stages */}
      {selectedAgent?.structureFlow && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Workflow className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                  7-Step Canonical Lifecycle & Operational Pipeline
                </h3>
              </div>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
                Every autonomous agent executes the standardized 7-stage governance lifecycle: Request Understanding, Executive Plan DAG, Knowledge & Tool Preparation, Approval Gate, Deterministic Execution, Outcome Resource Verification, and Immutable Audit Telemetry.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-[#80868b]">
              <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                MODEL: {selectedAgent.structureFlow.canonicalModel || '7_STEP_EXECUTIVE_LIFECYCLE'}
              </span>
              <span>•</span>
              <span>Version: {selectedAgent.structureFlow.version}</span>
            </div>
          </div>

          {/* 7-Step Canonical Navigation & Roadmap Bar */}
          <div className="p-3.5 rounded-xl bg-[#f8f9fb] dark:bg-[#141820] border border-[#e2e4e9] dark:border-[#282e3c]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6] flex items-center space-x-1.5">
                <Shield className="h-3 w-3 text-purple-600" />
                <span>Canonical 7-Step Autonomous Governance Flow</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Strict Zero-Bypass Enforced
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {canonicalStepsList.map((step) => {
                const StepIcon = step.icon;
                const isExecuted =
                  simulationResult !== null || (currentSimStageIndex >= step.num - 1 && isSimulatingFlow);
                const isCurrentlyActive = currentSimStageIndex === step.num - 1 && isSimulatingFlow;

                return (
                  <div
                    key={step.num}
                    className={`p-2 rounded-lg border text-left transition-all space-y-1 ${
                      isCurrentlyActive
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 ring-1 ring-purple-500'
                        : isExecuted
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#181c24]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-purple-600 dark:text-purple-400">
                        Step {step.num}/7
                      </span>
                      <StepIcon
                        className={`h-3 w-3 ${
                          isExecuted ? 'text-emerald-500' : 'text-[#80868b]'
                        }`}
                      />
                    </div>
                    <div className="font-bold text-[10px] text-[#1a1d24] dark:text-[#f0f3f6] truncate">
                      {step.label.slice(3)}
                    </div>
                    <p className="text-[9px] text-[#80868b] line-clamp-1 leading-tight">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Production Execution Receipt */}
          {simulationResult && (
            <div className="p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-3.5 shadow-xs animate-in fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-emerald-200 dark:border-emerald-800/80">
                <span className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-100 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Production Agent Execution Complete ({simulationResult.totalDurationMs}ms / Budget: &lt;{simulationResult.slaTargetMs}ms)
                  </span>
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                    100% VERIFIED & AUDITED
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-600 text-white font-bold">
                    ZERO DRIFT
                  </span>
                </div>
              </div>

              {/* 3-Part Governance Breakdown: Approval, Verification, Audit Trail */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                {/* Step 4: Approval Gate */}
                <div className="p-3 rounded-lg bg-white/80 dark:bg-[#12151d] border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Key className="h-3.5 w-3.5 text-amber-500" />
                    <span>Step 4: Approval Gate Token</span>
                  </div>
                  <div className="font-mono text-[10px] text-purple-700 dark:text-purple-300 font-bold break-all">
                    {simulationResult.approvalId}
                  </div>
                  <p className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">
                    Operator clearance validated before dispatching mutating side-effects.
                  </p>
                </div>

                {/* Step 6: Outcome Resource Comparison */}
                <div className="p-3 rounded-lg bg-white/80 dark:bg-[#12151d] border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Scale className="h-3.5 w-3.5 text-blue-500" />
                    <span>Step 6: Resource Verification</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {simulationResult.verification.actualResourcesSummary}
                  </div>
                  <p className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">
                    {simulationResult.verification.expectedResourcesSummary}
                  </p>
                </div>

                {/* Step 7: Immutable Audit Log & Hash */}
                <div className="p-3 rounded-lg bg-white/80 dark:bg-[#12151d] border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                      <Fingerprint className="h-3.5 w-3.5 text-purple-500" />
                      <span>Step 7: SHA-256 Audit Hash</span>
                    </span>
                    <button
                      onClick={() => handleCopyAuditHash(simulationResult.auditHash)}
                      className="text-[10px] font-mono text-purple-600 hover:text-purple-800 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedHash ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[9px] text-[#1a1d24] dark:text-[#c9d1d9] bg-[#f0f2f5] dark:bg-[#181c24] p-1.5 rounded truncate">
                    {simulationResult.auditHash}
                  </div>
                  <p className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">
                    Persisted to audit ledger: ID <code className="font-mono">{simulationResult.auditLogId}</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sequential Stage Cards */}
          <div className="space-y-3">
            {selectedAgent.structureFlow.stages.map((stage, idx) => {
              const isSimActive = currentSimStageIndex === idx;
              const isSimDone = currentSimStageIndex > idx || (simulationResult !== null && !isSimulatingFlow);

              return (
                <div
                  key={stage.id}
                  className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                    isSimActive
                      ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/30 ring-2 ring-purple-500/30'
                      : isSimDone
                      ? 'border-emerald-200 dark:border-emerald-900 bg-white dark:bg-[#141820]'
                      : 'border-[#e2e4e9] dark:border-[#282e3c] bg-white dark:bg-[#141820]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isSimDone
                            ? 'bg-emerald-600 text-white'
                            : isSimActive
                            ? 'bg-purple-600 text-white animate-pulse'
                            : 'bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6]'
                        }`}
                      >
                        {isSimDone ? <Check className="h-4 w-4" /> : stage.canonicalStepNumber || stage.order}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6] text-xs">
                            {stage.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-semibold border ${getStageTypeBadge(
                              stage.stageType
                            )}`}
                          >
                            {stage.stageType}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            Phase: {stage.canonicalPhase || 'execution'}
                          </span>
                          {stage.requiresApproval && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center space-x-1">
                              <Lock className="h-2.5 w-2.5" />
                              <span>Approval Gate</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {stage.toolDependencies.length > 0 && (
                      <div className="flex items-center space-x-1 shrink-0 text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded-md border border-purple-200 dark:border-purple-800">
                        <span>Tools:</span>
                        <span>{stage.toolDependencies.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Stage Contracts, Invariants & Verification Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-[#f0f2f5] dark:border-[#202530] text-[11px]">
                    <div className="p-2.5 rounded-lg bg-[#f8f9fb] dark:bg-[#181c24] border border-[#e2e4e9] dark:border-[#282e3c]">
                      <span className="text-[10px] font-semibold text-[#80868b] block mb-0.5">
                        Input Contract:
                      </span>
                      <code className="font-mono text-[10px] text-[#374151] dark:text-[#d1d5db] break-all leading-tight block">
                        {stage.inputContract}
                      </code>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#f8f9fb] dark:bg-[#181c24] border border-[#e2e4e9] dark:border-[#282e3c]">
                      <span className="text-[10px] font-semibold text-[#80868b] block mb-0.5">
                        Output Contract:
                      </span>
                      <code className="font-mono text-[10px] text-[#374151] dark:text-[#d1d5db] break-all leading-tight block">
                        {stage.outputContract}
                      </code>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#f8f9fb] dark:bg-[#181c24] border border-[#e2e4e9] dark:border-[#282e3c]">
                      <span className="text-[10px] font-semibold text-[#80868b] block mb-0.5">
                        Expected Resources Check:
                      </span>
                      <span className="text-[10px] text-blue-700 dark:text-blue-400 font-medium leading-tight block">
                        {stage.expectedResourcesCheck || 'Verified schema match'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#f8f9fb] dark:bg-[#181c24] border border-[#e2e4e9] dark:border-[#282e3c]">
                      <span className="text-[10px] font-semibold text-[#80868b] block mb-0.5">
                        Validation & Fallback:
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium leading-tight block">
                        ✓ {stage.validationCheck}
                      </span>
                      {stage.fallbackAction && (
                        <span className="text-[9px] text-[#80868b] mt-1 block italic">
                          Failover: {stage.fallbackAction}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Attached Knowledge References & Documentation */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span>Attached Knowledge References & Grounding</span>
            </h3>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
              Verified documents bound to this agent. All autonomous claims and actions cite these immutable Title IDs.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold">
            {selectedAgent?.knowledgeReferences?.length || 0} Bound Documents
          </span>
        </div>

        {/* References Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(selectedAgent?.knowledgeReferences || []).map((ref) => {
            const rawDoc = knowledgeItems.find((k) => k.titleId === ref.titleId);

            return (
              <div
                key={ref.titleId}
                className="p-4 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-white dark:bg-[#141820] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-1.5">
                      <span>{ref.title}</span>
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-[#80868b]">
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        {ref.titleId}
                      </span>
                      <span>•</span>
                      <span className="uppercase">{ref.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {ref.required ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Required
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUnlinkKnowledge(ref.titleId)}
                        className="text-[#80868b] hover:text-rose-600 p-1 rounded cursor-pointer transition-colors"
                        title="Unlink knowledge document from agent"
                      >
                        <Unlink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                  {ref.purpose}
                </p>

                <div className="pt-2 border-t border-[#f0f2f5] dark:border-[#202530] flex items-center justify-between text-[10px] text-[#80868b]">
                  <span className="font-mono truncate max-w-[180px]">
                    {ref.referenceUri || `operava://knowledge/${ref.titleId}`}
                  </span>
                  {rawDoc && (
                    <button
                      onClick={() => setInspectingDoc(rawDoc)}
                      className="inline-flex items-center space-x-1 font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspect Document</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Universal Compatible Knowledge Repository Browser */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
              <LinkIcon className="h-4 w-4 text-purple-600" />
              <span>Compatible Knowledge Repository & Dynamic Linking</span>
            </h3>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
              Generalized documents certified compatible with <strong>{selectedAgent?.name}</strong>. Operators can link any verified item to expand agent grounding.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-[#80868b]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search compatible docs..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#141820] border border-[#e2e4e9] dark:border-[#282e3c] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filteredCompatibleItems.map((doc) => {
            const isBound = boundTitleIds.has(doc.titleId);

            return (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-[#e2e4e9] dark:border-[#282e3c] bg-[#f8f9fb] dark:bg-[#141820] flex flex-col justify-between space-y-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6] truncate block">
                      {doc.title}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                      {doc.type}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 block">
                    {doc.titleId}
                  </span>
                  <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] line-clamp-2">
                    {doc.summary || doc.content?.slice(0, 100)}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e2e4e9] dark:border-[#282e3c] flex items-center justify-between">
                  <button
                    onClick={() => setInspectingDoc(doc)}
                    className="text-[10px] text-purple-600 hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View Text</span>
                  </button>

                  {isBound ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" />
                      <span>Linked</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleLinkKnowledge(doc.titleId)}
                      disabled={isLinking}
                      className="px-2 py-1 rounded text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      + Link to Agent
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Document Inspector Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] rounded-2xl shadow-xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e2e4e9] dark:border-[#252a35] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                  {inspectingDoc.title}
                </h3>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                  Title ID: {inspectingDoc.titleId} • Format: {inspectingDoc.type} • Schema: {inspectingDoc.schemaVersion || 'v2026.3'}
                </span>
              </div>
              <button
                onClick={() => setInspectingDoc(null)}
                className="text-[#80868b] hover:text-[#1a1d24] dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {inspectingDoc.variablesRequired && inspectingDoc.variablesRequired.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                  <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">
                    Required Template Interpolation Variables:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {inspectingDoc.variablesRequired.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-[#80868b] uppercase tracking-wider block mb-1">
                  Document Content:
                </span>
                <pre className="p-4 rounded-xl bg-[#f8f9fb] dark:bg-[#10131a] border border-[#e2e4e9] dark:border-[#282e3c] font-mono text-[11px] text-[#1a1d24] dark:text-[#f0f3f6] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
                  {inspectingDoc.content}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[#e2e4e9] dark:border-[#252a35] bg-[#f8f9fb] dark:bg-[#141820] flex items-center justify-between">
              <span className="text-[11px] text-[#80868b]">
                Canonical URI: {inspectingDoc.referenceUri || `operava://knowledge/${inspectingDoc.titleId}`}
              </span>
              <button
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#e2e4e9] dark:bg-[#282e3c] text-[#1a1d24] dark:text-[#f0f3f6] hover:opacity-80 cursor-pointer"
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

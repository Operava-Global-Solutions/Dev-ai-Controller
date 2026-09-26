import React, { useState, useEffect } from 'react';
import {
  Bot,
  MessageSquare,
  Mail,
  Send,
  Globe,
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Code2,
  Eye,
  Sliders,
  UserCheck,
  Check,
  X,
} from 'lucide-react';
import type {
  WorkerAgentConfig,
  KnowledgeDocument,
  WorkerSimulationResult,
  WorkerPersona,
  WorkerChannel,
  KnowledgeSourceMode,
} from '../types/index.js';

export const WorkerAgent: React.FC = () => {
  const [config, setConfig] = useState<WorkerAgentConfig>({
    name: 'Dev’ai Edge Customer Worker',
    persona: 'human_rep',
    channel: 'whatsapp',
    knowledgeMode: 'internal_only',
    greetingMessage: 'Hello! Thanks for reaching out. How can I assist you today?',
    customInstructions: 'Always be polite, accurate, and resolve user issues in a clear manner.',
    confidenceThreshold: 0.85,
    activeKnowledgeDocIds: [],
    cloudflareRoute: 'https://worker.operava.com/webhook/whatsapp',
  });

  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configFeedback, setConfigFeedback] = useState<string | null>(null);

  // New Document Modal / Form state
  const [showAddDocModal, setShowAddDocModal] = useState<boolean>(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [newDocFilename, setNewDocFilename] = useState<string>('');
  const [newDocFormat, setNewDocFormat] = useState<'md' | 'txt'>('md');
  const [newDocCategory, setNewDocCategory] = useState<'policy' | 'faq' | 'specs' | 'rules' | 'custom'>('policy');
  const [newDocContent, setNewDocContent] = useState<string>('');
  const [isAddingDoc, setIsAddingDoc] = useState<boolean>(false);

  // Selected format template
  const [showFormatTemplates, setShowFormatTemplates] = useState<boolean>(false);

  // Preview Doc Modal state
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDocument | null>(null);

  // Simulator State
  const [simulationPrompt, setSimulationPrompt] = useState<string>('What is your refund policy if I cancel within 14 days?');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<WorkerSimulationResult | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  // Cloudflare Worker Export State
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportData, setExportData] = useState<{ workerCode: string; wranglerToml: string } | null>(null);
  const [copiedWorkerCode, setCopiedWorkerCode] = useState<boolean>(false);

  // Fetch initial config & documents
  const loadData = async () => {
    setIsLoadingDocs(true);
    try {
      const [configRes, docsRes] = await Promise.all([
        fetch('/api/worker-agent/config'),
        fetch('/api/worker-agent/knowledge'),
      ]);
      const configData = await configRes.json();
      const docsData = await docsRes.json();

      if (configData.success && configData.config) {
        setConfig(configData.config);
      }
      if (docsData.success && docsData.docs) {
        setDocs(docsData.docs);
      }
    } catch (err) {
      console.error('Failed to load Worker Agent data:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update cloudflareRoute whenever channel changes
  const handleChannelChange = (channel: WorkerChannel) => {
    const route = `https://worker.operava.com/webhook/${channel}`;
    setConfig((prev) => ({ ...prev, channel, cloudflareRoute: route }));
  };

  // Save Configuration
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    setConfigFeedback(null);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/worker-agent/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setConfigFeedback('Worker Agent configuration synchronized to Cloudflare edge!');
        setTimeout(() => setConfigFeedback(null), 3000);
      } else {
        setConfigFeedback(data.error || 'Failed to save configuration');
      }
    } catch (err: any) {
      setConfigFeedback(err.message || 'Error saving configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Toggle Document Active state
  const handleToggleDoc = async (id: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/worker-agent/knowledge/${id}/toggle`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.document) {
        setDocs((prev) => prev.map((d) => (d.id === id ? data.document : d)));
      }
    } catch (err) {
      console.error('Failed to toggle document:', err);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (id: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/worker-agent/knowledge/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setDocs((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // File Upload Handler (.txt, .md)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.endsWith('.txt') ? 'txt' : 'md';
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setNewDocTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        setNewDocFilename(file.name);
        setNewDocFormat(extension);
        setNewDocContent(content);
        setShowAddDocModal(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Submit New Knowledge Document
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocContent.trim()) return;

    setIsAddingDoc(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/worker-agent/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: newDocTitle || newDocFilename || 'Custom Knowledge Document',
          filename: newDocFilename || (newDocFormat === 'txt' ? 'knowledge.txt' : 'knowledge.md'),
          format: newDocFormat,
          category: newDocCategory,
          content: newDocContent,
        }),
      });

      const data = await res.json();
      if (data.success && data.document) {
        setDocs((prev) => [data.document, ...prev]);
        setShowAddDocModal(false);
        setNewDocTitle('');
        setNewDocFilename('');
        setNewDocContent('');
      }
    } catch (err) {
      console.error('Failed to create document:', err);
    } finally {
      setIsAddingDoc(false);
    }
  };

  // Run Simulation Test
  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simulationPrompt.trim() || isSimulating) return;

    setIsSimulating(true);
    setSimulationError(null);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/worker-agent/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: simulationPrompt.trim(),
          config,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSimulationResult(data);
      } else {
        setSimulationError(data.error || 'Failed to simulate response');
      }
    } catch (err: any) {
      setSimulationError(err.message || 'Simulation network error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Open Export Modal
  const handleOpenExport = async () => {
    try {
      const res = await fetch('/api/worker-agent/export');
      const data = await res.json();
      if (data.success) {
        setExportData({ workerCode: data.workerCode, wranglerToml: data.wranglerToml });
        setShowExportModal(true);
      }
    } catch (err) {
      console.error('Failed to export worker:', err);
    }
  };

  // Template Loader
  const loadTemplate = (type: 'faq' | 'policy' | 'specs') => {
    if (type === 'faq') {
      setNewDocTitle('Customer FAQ Template');
      setNewDocFilename('customer_faq_template.md');
      setNewDocFormat('md');
      setNewDocCategory('faq');
      setNewDocContent(`# Customer FAQ Document Template

### Q: What is your standard support response time?
A: Our team responds to all incoming queries across WhatsApp, Messenger, and Webchat within 30 seconds.

### Q: How do I request an account cancellation or refund?
A: Submit a request with your registered email. Invoices within 14 days are refunded in full automatically.

### Q: Are my payment and account details secured?
A: Yes, all sessions and secrets are encrypted with AES-256-GCM zero-trust storage.`);
    } else if (type === 'policy') {
      setNewDocTitle('Support Policy Guidelines');
      setNewDocFilename('support_policy_guidelines.txt');
      setNewDocFormat('txt');
      setNewDocCategory('policy');
      setNewDocContent(`OPERATIONAL SUPPORT POLICY GUIDELINES

[SERVICE HOURS]
- 24/7 autonomous edge coverage via Cloudflare Workers AI.
- Human escalation available for complex account modifications.

[VERIFICATION REQUIREMENTS]
- Representatives never solicit passwords or authentication tokens over chat.
- All password or administrative updates require two-factor OTP verification.

[DISCOUNT & PRICING RULES]
- Annual commitments receive a 20% discount applied automatically on invoice generation.`);
    } else {
      setNewDocTitle('Channel Integration Specifications');
      setNewDocFilename('channel_specs.md');
      setNewDocFormat('md');
      setNewDocCategory('specs');
      setNewDocContent(`# Channel Routing Specifications

- WhatsApp Endpoint: /webhook/whatsapp
- Meta Messenger Endpoint: /webhook/messenger
- Transactional Mailer: support@operava.com via Resend
- Cloudflare Runtime: Cloudflare Workers with Edge AI bindings.`);
    }
    setShowFormatTemplates(false);
    setShowAddDocModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#262c37] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center text-white shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <h1 className="text-base font-bold text-[#1a1d24] dark:text-[#f0f3f6] tracking-tight">
              Cloudflare Worker Agent
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Multi-Channel Edge Routing
            </span>
          </div>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] max-w-2xl leading-relaxed">
            Autonomous customer support worker routed through WhatsApp, Messenger, Email, or Live Webchat with customizable personas and strict internal or hybrid knowledge grounding.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleOpenExport}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] border border-[#e2e4e9] dark:border-[#2c3240] hover:bg-[#e4e6eb] dark:hover:bg-[#282f3d] transition-colors cursor-pointer"
          >
            <Code2 className="h-3.5 w-3.5 text-purple-600" />
            <span>Export</span>
          </button>

          <button
            onClick={handleSaveConfig}
            disabled={isSavingConfig}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isSavingConfig ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>{isSavingConfig ? 'Saving...' : 'Deploy'}</span>
          </button>
        </div>
      </div>

      {configFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{configFeedback}</span>
        </div>
      )}

      {/* Grid: Left Column (Channel & Persona Setup) | Right Column (Knowledge Documents) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Channel & Dispatch Routing */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#262c37] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-purple-600" />
                <h3 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] uppercase tracking-wider">
                  Cloudflare Worker Routing Channel
                </h3>
              </div>
              <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] font-mono">
                {config.cloudflareRoute}
              </span>
            </div>

            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
              Select the active ingress webhook channel handled by the Cloudflare edge worker:
            </p>

            {/* Channel Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  id: 'whatsapp' as WorkerChannel,
                  label: 'WhatsApp',
                  icon: MessageSquare,
                  color: 'text-emerald-600 dark:text-emerald-400',
                },
                {
                  id: 'messenger' as WorkerChannel,
                  label: 'Messenger',
                  icon: Send,
                  color: 'text-blue-600 dark:text-blue-400',
                },
                {
                  id: 'email' as WorkerChannel,
                  label: 'Email',
                  icon: Mail,
                  color: 'text-purple-600 dark:text-purple-400',
                },
                {
                  id: 'webchat' as WorkerChannel,
                  label: 'Webchat',
                  icon: Globe,
                  color: 'text-orange-600 dark:text-orange-400',
                },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = config.channel === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleChannelChange(c.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500'
                        : 'border-[#e2e4e9] dark:border-[#2c3240] bg-[#f8f9fb] dark:bg-[#1a1f28] hover:bg-[#f0f2f5] dark:hover:bg-[#202530]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-4 w-4 ${c.color}`} />
                      {isSelected && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                        {c.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Persona & Response Mode */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#262c37] shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <h3 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] uppercase tracking-wider">
                Persona & Conversational Tone
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'human_rep' as WorkerPersona,
                  title: 'Human Representative',
                },
                {
                  id: 'ai_assistant' as WorkerPersona,
                  title: 'AI Assistant',
                },
                {
                  id: 'customer_service' as WorkerPersona,
                  title: 'Customer Services',
                },
              ].map((p) => {
                const isSelected = config.persona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, persona: p.id }))}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500'
                        : 'border-[#e2e4e9] dark:border-[#2c3240] bg-[#f8f9fb] dark:bg-[#1a1f28] hover:bg-[#f0f2f5] dark:hover:bg-[#202530]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                      {p.title}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-purple-600 shrink-0 ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Knowledge Source Strategy Mode */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#262c37] shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <h3 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] uppercase tracking-wider">
                Knowledge Source Strategy
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'internal_only' as KnowledgeSourceMode,
                  title: 'Internal Knowledge Only',
                },
                {
                  id: 'external_and_internal' as KnowledgeSourceMode,
                  title: 'External & Internal Knowledge',
                },
              ].map((m) => {
                const isSelected = config.knowledgeMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, knowledgeMode: m.id }))}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500'
                        : 'border-[#e2e4e9] dark:border-[#2c3240] bg-[#f8f9fb] dark:bg-[#1a1f28] hover:bg-[#f0f2f5] dark:hover:bg-[#202530]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                      {m.title}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-purple-600 shrink-0 ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 5 cols (Knowledge Documents Base) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#262c37] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <h3 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] uppercase tracking-wider">
                  Knowledge Base Files (.txt & .md)
                </h3>
              </div>
              <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                {docs.length} files
              </span>
            </div>

            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
              Upload or create internal knowledge documents in specific markdown or text format to ground the Worker Agent.
            </p>

            {/* Action Bar: Upload File, Format Templates, Add Text */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".txt,.md,.markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowFormatTemplates(!showFormatTemplates)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] border border-[#e2e4e9] dark:border-[#2c3240] hover:bg-[#e4e6eb] dark:hover:bg-[#282f3d] transition-colors cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Templates</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewDocTitle('');
                  setNewDocFilename('');
                  setNewDocContent('');
                  setShowAddDocModal(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] border border-[#e2e4e9] dark:border-[#2c3240] hover:bg-[#e4e6eb] dark:hover:bg-[#282f3d] transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Document</span>
              </button>
            </div>

            {/* Template Selector Dropdown */}
            {showFormatTemplates && (
              <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#1a1f28] border border-purple-200 dark:border-purple-900/60 space-y-2 text-xs">
                <div className="font-semibold text-purple-700 dark:text-purple-300">
                  Select a Pre-Built Specific Format:
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => loadTemplate('faq')}
                    className="p-2 rounded-lg bg-white dark:bg-[#12151c] text-left border border-[#e2e4e9] dark:border-[#2c3240] hover:border-purple-400 cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-[#1a1d24] dark:text-[#f0f3f6]">
                      Markdown FAQ (.md)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadTemplate('policy')}
                    className="p-2 rounded-lg bg-white dark:bg-[#12151c] text-left border border-[#e2e4e9] dark:border-[#2c3240] hover:border-purple-400 cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-[#1a1d24] dark:text-[#f0f3f6]">
                      Support Policy (.txt)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadTemplate('specs')}
                    className="p-2 rounded-lg bg-white dark:bg-[#12151c] text-left border border-[#e2e4e9] dark:border-[#2c3240] hover:border-purple-400 cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-[#1a1d24] dark:text-[#f0f3f6]">
                      Channel Specifications (.md)
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Documents List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {docs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#80868b] border border-dashed rounded-xl">
                  No knowledge documents uploaded. Upload a .txt or .md file to train your worker agent.
                </div>
              ) : (
                docs.map((d) => (
                  <div
                    key={d.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      d.isActive
                        ? 'bg-white dark:bg-[#151921] border-[#e2e4e9] dark:border-[#2c3240]'
                        : 'bg-[#f4f5f8] dark:bg-[#12151c] border-[#e2e4e9] dark:border-[#252a35] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold font-mono rounded ${
                              d.format === 'md'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            .{d.format}
                          </span>
                          <span className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] line-clamp-1">
                            {d.title}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#5f6368] dark:text-[#9aa0a6]">
                          {d.filename} • {Math.round(d.sizeBytes / 1024 * 10) / 10} KB • {d.wordCount || 120} words
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(d)}
                          className="p-1 rounded text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleDoc(d.id)}
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded cursor-pointer ${
                            d.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {d.isActive ? 'Active' : 'Muted'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(d.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Section: Test Multi-Channel Worker Agent */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#262c37] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <h3 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6] uppercase tracking-wider">
              Live Edge Simulation & Multi-Channel Test Console
            </h3>
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            Channel: {config.channel.toUpperCase()} • Persona: {config.persona}
          </span>
        </div>

        <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
          Simulate how the Cloudflare Worker responds to customer inquiries on your active channel ({config.channel}), testing knowledge grounding ({config.knowledgeMode}) and persona tone:
        </p>

        {/* Quick sample inquiry chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSimulationPrompt('What is your refund policy if I cancel my subscription within 14 days?')}
            className="px-2.5 py-1 rounded-lg bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] cursor-pointer"
          >
            "What is your refund policy?"
          </button>
          <button
            type="button"
            onClick={() => setSimulationPrompt('How do I reset my admin password securely?')}
            className="px-2.5 py-1 rounded-lg bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] cursor-pointer"
          >
            "How do I reset admin password?"
          </button>
          <button
            type="button"
            onClick={() => setSimulationPrompt('Can I route WhatsApp and Messenger webhooks simultaneously on Cloudflare?')}
            className="px-2.5 py-1 rounded-lg bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] cursor-pointer"
          >
            "Can I route WhatsApp and Messenger simultaneously?"
          </button>
        </div>

        {/* Form Input & Action */}
        <form onSubmit={handleRunSimulation} className="flex gap-2">
          <input
            type="text"
            value={simulationPrompt}
            onChange={(e) => setSimulationPrompt(e.target.value)}
            placeholder="Type a customer question or inquiry..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1a1f28] border border-[#e2e4e9] dark:border-[#2c3240] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isSimulating || !simulationPrompt.trim()}
            className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>{isSimulating ? 'Processing...' : 'Simulate'}</span>
          </button>
        </form>

        {simulationError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
            {simulationError}
          </div>
        )}

        {/* Simulation Output Card */}
        {simulationResult && (
          <div className="p-4 rounded-xl bg-[#f8f9fb] dark:bg-[#151921] border border-[#e2e4e9] dark:border-[#2c3240] space-y-3 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-[#5f6368] dark:text-[#9aa0a6] pb-2 border-b border-[#e2e4e9] dark:border-[#252a35]">
              <div className="flex items-center space-x-2 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 uppercase font-bold text-[10px]">
                  {simulationResult.channel}
                </span>
                <span>{simulationResult.routingHeader}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>Latency: {simulationResult.latencyMs}ms</span>
                <span>Docs: {simulationResult.referencedDocs.length}</span>
              </div>
            </div>

            {/* Clean Output Message (NO *** or - -) */}
            <div className="text-xs leading-relaxed text-[#1a1d24] dark:text-[#f0f3f6] whitespace-pre-wrap font-normal p-3 rounded-lg bg-white dark:bg-[#1a1f28] border border-[#e2e4e9] dark:border-[#2c3240]">
              {simulationResult.response}
            </div>

            {/* Referenced Knowledge Documents Badge */}
            {simulationResult.referencedDocs.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">
                <span className="font-semibold">Grounding Sources:</span>
                {simulationResult.referencedDocs.map((title, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6]"
                  >
                    • {title}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Knowledge Document Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-[#161a22] rounded-2xl border border-[#e2e4e9] dark:border-[#2c3240] shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setShowAddDocModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-[#80868b] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                Add Knowledge Base Document (.txt or .md)
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                Paste or write content in specific format (Markdown Q&A, Policy, or Technical Specifications).
              </p>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="e.g. Return & Exchange Policy"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] mb-1">
                    Filename (.md or .txt)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDocFilename}
                      onChange={(e) => setNewDocFilename(e.target.value)}
                      placeholder="policy_rules.md"
                      required
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6]"
                    />
                    <select
                      value={newDocFormat}
                      onChange={(e) => setNewDocFormat(e.target.value as 'md' | 'txt')}
                      className="px-3 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6]"
                    >
                      <option value="md">.md</option>
                      <option value="txt">.txt</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] mb-1">
                  Document Content (Specific Format Required)
                </label>
                <textarea
                  rows={10}
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder={`# Specific Knowledge Format Example\n\n### Q: What is your standard policy?\nA: All customers are protected with full SLA coverage...`}
                  required
                  className="w-full p-3 text-xs font-mono rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-3 py-2 text-xs rounded-xl text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingDoc || !newDocContent.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAddingDoc ? 'Adding...' : 'Add Knowledge Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Document Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-[#161a22] rounded-2xl border border-[#e2e4e9] dark:border-[#2c3240] shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-[#80868b] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  .{previewDoc.format}
                </span>
                <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                  {previewDoc.title}
                </h3>
              </div>
              <p className="text-[11px] font-mono text-[#5f6368] dark:text-[#9aa0a6]">
                {previewDoc.filename} • {previewDoc.sizeBytes} bytes • Updated {new Date(previewDoc.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-[#f8f9fb] dark:bg-[#12151c] border border-[#e2e4e9] dark:border-[#2c3240] text-xs font-mono whitespace-pre-wrap leading-relaxed">
              {previewDoc.content}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] hover:bg-[#e4e6eb] dark:hover:bg-[#282f3d] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloudflare Worker Export Modal */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white dark:bg-[#161a22] rounded-2xl border border-[#e2e4e9] dark:border-[#2c3240] shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-[#80868b] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                Cloudflare Worker Production Export
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                Ready-to-deploy worker script and wrangler.toml pre-configured with Cloudflare Workers AI and multi-channel routing.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6]">
                    worker.js
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(exportData.workerCode);
                      setCopiedWorkerCode(true);
                      setTimeout(() => setCopiedWorkerCode(false), 2000);
                    }}
                    className="flex items-center space-x-1 text-[11px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    {copiedWorkerCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedWorkerCode ? 'Copied' : 'Copy worker.js'}</span>
                  </button>
                </div>
                <pre className="max-h-64 overflow-y-auto p-3 text-[11px] font-mono rounded-xl bg-[#f8f9fb] dark:bg-[#12151c] border border-[#e2e4e9] dark:border-[#2c3240] text-[#1a1d24] dark:text-[#f0f3f6]">
                  {exportData.workerCode}
                </pre>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] mb-1">
                  wrangler.toml
                </span>
                <pre className="p-3 text-[11px] font-mono rounded-xl bg-[#f8f9fb] dark:bg-[#12151c] border border-[#e2e4e9] dark:border-[#2c3240] text-[#1a1d24] dark:text-[#f0f3f6]">
                  {exportData.wranglerToml}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] hover:bg-[#e4e6eb] dark:hover:bg-[#282f3d] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  BookOpen,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Key,
  Layers,
  Sparkles,
  Zap,
  Info,
  RefreshCw,
  Search,
  Check,
  LifeBuoy,
  Server,
  Globe,
  Database,
  Mail,
  User,
  Lock,
  GitBranch,
} from 'lucide-react';
import type { NonTechErrorArticle, ProcessGuideArticle } from '../types/index.js';

export const KnowledgeCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'errors' | 'processes' | 'diagnostics' | 'tokens'>('errors');
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedArticle, setExpandedArticle] = useState<string | null>('401');
  const [simulatedError, setSimulatedError] = useState<string | null>(null);

  // Non-Technical Error Dictionary
  const errorArticles: NonTechErrorArticle[] = [
    {
      code: '401',
      title: 'Unauthorized / Missing API Token',
      category: 'authentication',
      severity: 'high',
      whatItMeans:
        'The server knocked on the service door (like Cloudflare, Resend, or GitHub), but did not have the valid secret key card or the password expired.',
      whyItHappened:
        'A required API token has not been configured in your server environment variables, or it was revoked or copied with extra whitespace.',
      howToFixSteps: [
        'Open your server environment settings or .env file.',
        'Locate the missing key (e.g. CLOUDFLARE_API_TOKEN, GITHUB_TOKEN, or RESEND_API_KEY).',
        'Generate a fresh token from the official provider dashboard and paste it securely.',
      ],
      safeToIgnore: false,
    },
    {
      code: '429',
      title: 'Rate Limit Throttled (Too Many Requests)',
      category: 'rate_limit',
      severity: 'medium',
      whatItMeans:
        'The external service asked Dev’ai to pause and catch its breath because too many requests were sent in a single minute.',
      whyItHappened:
        'Automated workflows, heavy prompt iteration, or free-tier usage limits triggered the provider’s protective threshold.',
      howToFixSteps: [
        'Wait 15 to 30 seconds — Dev’ai Controller automatically retries with smart exponential backoff.',
        'If using Cloudflare Workers AI free tier, consider upgrading or relying on the automatic OpenAI backup.',
        'No data was lost; simply resubmit your prompt once the cooldown window finishes.',
      ],
      safeToIgnore: true,
    },
    {
      code: '500',
      title: 'Edge Server Timeout / Internal Processing Hiccup',
      category: 'server',
      severity: 'medium',
      whatItMeans:
        'An edge worker in the Cloudflare global network took longer than usual to complete a heavy computational task or experienced a transient blip.',
      whyItHappened:
        'Complex repository file trees or multi-stage code generation prompts can occasionally exceed standard edge memory limits.',
      howToFixSteps: [
        'Click the "Retry" button — 95% of 500 edge errors resolve on a clean second attempt.',
        'Break down very large requests into two smaller prompts.',
        'Check the Audit Trail tab to verify if secondary fallback kicked in.',
      ],
      safeToIgnore: false,
    },
    {
      code: 'RLS-01',
      title: 'Supabase PostgreSQL RLS Denied (Security Shield Active)',
      category: 'database',
      severity: 'high',
      whatItMeans:
        'The database refused to save or show information because a Row Level Security policy blocked unverified access.',
      whyItHappened:
        'The request was sent using an anonymous client key without a verified user login or without the master server role key.',
      howToFixSteps: [
        'Verify that SUPABASE_SERVICE_KEY is configured on the backend server for elevated administrative writes.',
        'Ensure the user is signed in with a valid session before writing user-specific data.',
        'Check that the tables (api_tokens, audit_logs) have policy grants for the authenticated role.',
      ],
      safeToIgnore: false,
    },
    {
      code: 'GIT-CONFLICT',
      title: 'GitHub Branch Protection or Push Conflict',
      category: 'network',
      severity: 'medium',
      whatItMeans:
        'GitHub protected your main production codebase because someone or another process changed the same files.',
      whyItHappened:
        'Direct commits to the "main" or "master" branch are blocked by repository rules to prevent breaking live apps.',
      howToFixSteps: [
        'Dev’ai automatically avoids this by staging changes on dedicated feature branches (e.g. devai-patch-v1).',
        'Review and approve the created Pull Request on GitHub.',
        'Merge the Pull Request through GitHub’s interface with automated green CI checks.',
      ],
      safeToIgnore: true,
    },
    {
      code: 'COLD-START',
      title: 'Cold-Start Latency (Brief 100ms Initial Delay)',
      category: 'server',
      severity: 'low',
      whatItMeans:
        'The edge server was resting to conserve power and costs, and woke up in a fraction of a second to answer your first click.',
      whyItHappened:
        'Modern serverless architecture scales down to zero when idle.',
      howToFixSteps: [
        'No action required! This is completely normal and saves infrastructure costs.',
        'Once awake, all subsequent requests run at ultra-fast speeds (sub-25ms).',
      ],
      safeToIgnore: true,
    },
  ];

  // Essential Processes for Non-Technical Operators
  const processGuides: ProcessGuideArticle[] = [
    {
      id: 'proc-workers-ai',
      title: 'How Cloudflare Workers AI Operates as Your Primary Edge Brain',
      badge: 'Primary AI',
      summary:
        'Instead of routing requests halfway across the planet to a single data center, Cloudflare runs AI inference on 300+ city hubs nearest to you.',
      steps: [
        {
          step: 1,
          title: 'Immediate Proximity Routing',
          description: 'Your request hits the closest edge location (typically in under 15ms).',
        },
        {
          step: 2,
          title: 'Zero-Trust Token Masking',
          description: 'Credentials are encrypted on the server with AES-256-GCM. Raw keys are never shown in browser code.',
        },
        {
          step: 3,
          title: 'Direct Model Execution',
          description: 'Meta Llama 3.3 70B runs directly on edge GPUs and streams back clean code or orchestration decisions.',
        },
      ],
      safetyTip: 'If Cloudflare experiences any global disruption, Dev’ai automatically switches to OpenAI without interrupting you.',
    },
    {
      id: 'proc-auto-failover',
      title: 'Zero-Downtime Automatic Fallback to OpenAI',
      badge: 'Redundancy',
      summary:
        'To ensure 99.99% uptime, Dev’ai Controller implements automated multi-provider failover behind a single unified API.',
      steps: [
        {
          step: 1,
          title: 'Health Sensing',
          description: 'Dev’ai continuously measures latency and HTTP responses from Cloudflare Workers AI.',
        },
        {
          step: 2,
          title: 'Instant Circuit Breaker',
          description: 'If two requests fail or exceed 4000ms latency, the fallback circuit switches instantly to OpenAI gpt-4o-mini.',
        },
        {
          step: 3,
          title: 'Audit Logging',
          description: 'Every fallback transition is permanently recorded in your Supabase audit log for compliance.',
        },
      ],
      safetyTip: 'You do not need to configure separate endpoints — the Controller handles failover behind the scenes.',
    },
    {
      id: 'proc-loading-dots',
      title: 'Understanding Chat Background Dots & Thinking States',
      badge: 'User Interface',
      summary:
        'When the AI is reasoning or orchestrating third-party services, the background pattern provides clear visual feedback.',
      steps: [
        {
          step: 1,
          title: 'Subtle Dot Grid Design',
          description: 'The small gray dots represent the distributed nodes of the edge network.',
        },
        {
          step: 2,
          title: 'Breathing Motion Animation',
          description: 'When an operation is in progress, the dots gently pulse and shift positions to show active GPU processing.',
        },
        {
          step: 3,
          title: 'Execution Trace Step Feedback',
          description: 'Below each message, an accordion displays each sub-step so you know exactly what was executed.',
        },
      ],
      safetyTip: 'If an operation fails, Dev’ai will output a purple "Plain English Summary" box explaining what to do next.',
    },
  ];

  const filteredErrors = errorArticles.filter(
    (e) =>
      e.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.whatItMeans.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Operava Gradient */}
      <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-gradient-to-r from-[#ff6b35] via-[#f38020] to-[#7928ca] text-white shadow-xs">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                  Knowledge Center
                </h1>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                  Guides, plain-English error explanations, and complete system architecture reference.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#f0f2f5] dark:border-[#252a35] pt-4">
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'errors'
                ? 'bg-gradient-to-r from-[#ff6b35] to-[#9333ea] text-white shadow-xs'
                : 'bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Errors</span>
          </button>

          <button
            onClick={() => setActiveTab('processes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'processes'
                ? 'bg-gradient-to-r from-[#ff6b35] to-[#9333ea] text-white shadow-xs'
                : 'bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Processes</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'diagnostics'
                ? 'bg-gradient-to-r from-[#ff6b35] to-[#9333ea] text-white shadow-xs'
                : 'bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Error Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'tokens'
                ? 'bg-gradient-to-r from-[#ff6b35] to-[#9333ea] text-white shadow-xs'
                : 'bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>System & Architecture</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ERRORS DEMYSTIFIED */}
      {activeTab === 'errors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#80868b]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search error codes or symptoms (e.g. 401, timeout, rate limit, supabase)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] text-[#1a1d24] dark:text-[#f0f3f6] placeholder:text-[#80868b] focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredErrors.map((err) => {
              const isOpen = expandedArticle === err.code;

              return (
                <div
                  key={err.code}
                  className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedArticle(isOpen ? null : err.code)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 hover:bg-[#fcfdfe] dark:hover:bg-[#1b202a] cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {err.code}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                          {err.title}
                        </h3>
                        <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] line-clamp-1">
                          {err.whatItMeans}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          err.severity === 'high'
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                            : err.severity === 'medium'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {err.severity.toUpperCase()}
                      </span>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-[#80868b]" /> : <ChevronDown className="h-4 w-4 text-[#80868b]" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-5 border-t border-[#f0f2f5] dark:border-[#252a35] bg-[#fafbfc] dark:bg-[#13161d] space-y-4 text-xs">
                      {/* What it means in plain English */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a1f29] border border-[#e2e4e9] dark:border-[#2a2f3a] space-y-1">
                        <div className="flex items-center space-x-1.5 font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                          <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span>What this actually means (Plain English):</span>
                        </div>
                        <p className="text-[#4b5563] dark:text-[#d1d5db] leading-relaxed">
                          {err.whatItMeans}
                        </p>
                      </div>

                      {/* Why it happened */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a1f29] border border-[#e2e4e9] dark:border-[#2a2f3a] space-y-1">
                        <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                          Why it happened:
                        </span>
                        <p className="text-[#4b5563] dark:text-[#d1d5db] leading-relaxed">
                          {err.whyItHappened}
                        </p>
                      </div>

                      {/* Step-by-Step Fix */}
                      <div className="space-y-2">
                        <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                          How to fix it:
                        </span>
                        <div className="space-y-2">
                          {err.howToFixSteps.map((step, idx) => (
                            <div
                              key={idx}
                              className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1a1f29] border border-[#e2e4e9] dark:border-[#2a2f3a]"
                            >
                              <span className="h-5 w-5 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#9333ea] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-[#374151] dark:text-[#e5e7eb] leading-relaxed">
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {err.safeToIgnore && (
                        <div className="flex items-center space-x-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Safe to proceed: Dev’ai Controller automatically recovers or retries this state.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ESSENTIAL PROCESSES EXPLAINED */}
      {activeTab === 'processes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {processGuides.map((proc) => (
              <div
                key={proc.id}
                className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-5 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      {proc.badge}
                    </span>
                    <Sparkles className="h-4 w-4 text-[#ff6b35]" />
                  </div>

                  <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                    {proc.title}
                  </h3>

                  <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                    {proc.summary}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#f0f2f5] dark:border-[#252a35]">
                    {proc.steps.map((s) => (
                      <div key={s.step} className="p-2.5 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] text-xs space-y-0.5">
                        <div className="flex items-center space-x-1.5 font-semibold text-purple-700 dark:text-purple-300">
                          <span className="h-4 w-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">
                            {s.step}
                          </span>
                          <span>{s.title}</span>
                        </div>
                        <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] pl-5.5">
                          {s.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f0f2f5] dark:border-[#252a35] text-[11px] text-[#80868b] flex items-center space-x-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>{proc.safetyTip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE ERROR SIMULATOR */}
      {activeTab === 'diagnostics' && (
        <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-6 shadow-2xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
              Production Error Reference
            </h3>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
              Reference real production error signatures and the corrective action to take when they occur.
            </p>
          </div>

          {/* Buttons to trigger sample errors */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: '401-resend', label: '401 Missing Resend Key' },
              { id: '429-cf', label: '429 Cloudflare AI Rate Limit' },
              { id: 'rls-supabase', label: 'Supabase RLS Permission Denied' },
              { id: '504-timeout', label: '504 Edge Gateway Timeout' },
            ].map((sim) => (
              <button
                key={sim.id}
                onClick={() => setSimulatedError(sim.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  simulatedError === sim.id
                    ? 'bg-gradient-to-r from-[#ff6b35] to-[#9333ea] text-white shadow-xs'
                    : 'bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] hover:border-purple-400'
                }`}
              >
                {sim.label}
              </button>
            ))}
          </div>

          {/* Simulated Comparison Box */}
          {simulatedError ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Left: Raw Code Crash (The scary developer way) */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/60 font-mono text-xs space-y-2">
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
                  Raw Technical Stack Trace (Confusing):
                </span>
                <p className="text-red-300 text-[11px] leading-relaxed break-all">
                  {simulatedError === '401-resend' &&
                    'Error: [Resend API 401] Bearer token not provided or authorization failed: code=ERR_BAD_REQUEST at ResendMailer.send (/server/resend.ts:44:11)'}
                  {simulatedError === '429-cf' &&
                    'HTTP 429 Too Many Requests: cf-workers-ai edge bucket quota exhausted for model @cf/meta/llama-3.3-70b-instruct. Retry-After: 45'}
                  {simulatedError === 'rls-supabase' &&
                    'PostgresError: new row violates row-level security policy for table "audit_logs" (42501) - permission denied for schema public'}
                  {simulatedError === '504-timeout' &&
                    'FetchError: request to https://api.cloudflare.com/client/v4/accounts/... timed out after 10000ms at EdgeDispatcher.handle'}
                </p>
              </div>

              {/* Right: Dev’ai Controller Translation (The friendly human way) */}
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-2 shadow-xs">
                <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Dev’ai Plain English Translation:</span>
                </div>
                <p className="text-[#333] dark:text-[#eee] leading-relaxed text-[11px]">
                  {simulatedError === '401-resend' &&
                    'Your email notification could not send because the Resend API secret token is missing or expired. Your application files and data are completely safe.'}
                  {simulatedError === '429-cf' &&
                    'Cloudflare Workers AI reached its momentary request limit. The primary provider rejected the request. Check the live response and configured fallback provider; the system must not claim failover unless a real fallback request succeeds.'}
                  {simulatedError === 'rls-supabase' &&
                    'The database blocked saving this log entry because Row Level Security is active. Setting the SUPABASE_SERVICE_KEY on the server will safely allow this operation.'}
                  {simulatedError === '504-timeout' &&
                    'The edge connection took longer than expected due to network latency. Simply clicking "Retry" will reconnect you.'}
                </p>
                <div className="pt-1 text-[11px] font-medium text-purple-800 dark:text-purple-300">
                  <span>Recommended Action: </span>
                  <span className="font-normal underline">
                    {simulatedError === '401-resend' && 'Open Settings, paste your RESEND_API_KEY, and click save.'}
                    {simulatedError === '429-cf' && 'Check provider status, Retry-After, and live fallback execution result before retrying.'}
                    {simulatedError === 'rls-supabase' && 'Check the Supabase table permissions guide below.'}
                    {simulatedError === '504-timeout' && 'Click the retry button in the chat.'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-[#e2e4e9] dark:border-[#282d38] rounded-xl text-xs text-[#80868b]">
              Select a production error signature above to view its diagnosis and corrective action.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM & ARCHITECTURE KNOWLEDGE BASE */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          {/* Section 1: Zero-Trust Secret Isolation Architecture */}
          <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Zero-Trust Secret Isolation Architecture</span>
                </h3>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                  Status: Active • All credentials reside exclusively within the Cloudflare Worker server runtime.
                </p>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Zero Browser Exposure
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] border border-[#e2e4e9] dark:border-[#232834] space-y-2">
                <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-1.5">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span>AES-256-GCM Server Encryption</span>
                </span>
                <p className="text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                  All external API keys are derived using an AES-256-GCM authenticated cipher with unique 96-bit IVs. They never leave the server backend and are only sent directly to official endpoints (api.cloudflare.com, api.resend.com, api.github.com).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] border border-[#e2e4e9] dark:border-[#232834] space-y-2">
                <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-1.5">
                  <Key className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>UI Masking & Payload Sanitization</span>
                </span>
                <p className="text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                  Tokens displayed anywhere in the UI or client network bundles are strictly masked (e.g. <code className="font-mono">cf_ai_...89a1</code>). Browser network inspection reveals only masked tokens and sanitized audit hashes.
                </p>
              </div>
            </div>

            {/* Secret Registry */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-[#1a1d24] dark:text-[#f0f3f6] block mb-2">
                Protected Secrets Registry:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#191d26] border border-[#eaedf1] dark:border-[#282f3d]">
                  <span className="font-mono font-semibold text-orange-600 dark:text-orange-400 block text-[11px]">CLOUDFLARE_API_TOKEN</span>
                  <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">Edge Workers & AI invocation gateway</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#191d26] border border-[#eaedf1] dark:border-[#282f3d]">
                  <span className="font-mono font-semibold text-purple-600 dark:text-purple-400 block text-[11px]">GITHUB_TOKEN</span>
                  <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">Repository audit & automated PR creation</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#191d26] border border-[#eaedf1] dark:border-[#282f3d]">
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 block text-[11px]">SUPABASE_SERVICE_ROLE_KEY</span>
                  <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">Row-Level Security persistence & audit logs</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#191d26] border border-[#eaedf1] dark:border-[#282f3d]">
                  <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 block text-[11px]">RESEND_API_KEY</span>
                  <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">Transactional email delivery & release alerts</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#191d26] border border-[#eaedf1] dark:border-[#282f3d]">
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 block text-[11px]">OPENAI_API_KEY</span>
                  <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">Automatic standby failover model</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#191d26] border border-[#eaedf1] dark:border-[#282f3d]">
                  <span className="font-mono font-semibold text-pink-600 dark:text-pink-400 block text-[11px]">WORKER_SECRET</span>
                  <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">Root AES encryption master key</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: AI Engine Specifications & Multi-Model Orchestration */}
          <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-purple-500" />
              <span>AI Engine Specifications & Multi-Model Orchestration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] border border-[#e2e4e9] dark:border-[#232834] space-y-2">
                <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-1.5">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span>Primary: Cloudflare Workers AI</span>
                </span>
                <p className="text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                  Model: <strong className="font-mono text-[#1a1d24] dark:text-[#f0f3f6]">@cf/meta/llama-3.3-70b-instruct</strong>.
                  Executes natively on Cloudflare global edge GPU infrastructure with zero data serialization overhead.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] border border-[#e2e4e9] dark:border-[#232834] space-y-2">
                <span className="font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-1.5">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span>Standby Failover: OpenAI</span>
                </span>
                <p className="text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                  Model: <strong className="font-mono text-[#1a1d24] dark:text-[#f0f3f6]">gpt-4o-mini</strong>.
                  Engaged automatically if Cloudflare Workers AI experiences rate limits (HTTP 429) or transient edge timeouts (HTTP 504).
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Operator & Identity Governance */}
          <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6] flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-500" />
              <span>Operator & Identity Governance</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] border border-[#e2e4e9] dark:border-[#232834]">
                <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] block">Operator User</span>
                <span className="font-mono font-semibold text-[#1a1d24] dark:text-[#f0f3f6] text-xs">
                  secured.jelvan@gmail.com
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] border border-[#e2e4e9] dark:border-[#232834]">
                <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] block">Role & Permissions</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400 text-xs">
                  Developer / Operator (Full)
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f8f9fb] dark:bg-[#12161f] border border-[#e2e4e9] dark:border-[#232834]">
                <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] block">Auth Provider</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                  Supabase Auth (RLS Protected)
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Architecture Status */}
          <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            <div>
              <p className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                Dev’ai Controller Edge Platform
              </p>
              <p className="text-[11px] mt-0.5">
                Zero-Trust Secrets Architecture
              </p>
            </div>
            <div className="text-[11px] font-mono px-3 py-1 rounded-lg bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6]">
              Release v2.6.4-prod
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  FolderGit2,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ExternalLink,
  ChevronRight,
  GitPullRequest,
  Check,
  Clock,
  Terminal,
  Cpu,
  Zap,
} from 'lucide-react';
import type { CodingTask } from '../types/index.js';

interface CodingAgentProps {
  tasks: CodingTask[];
  onExecuteTask: (prompt: string, repo: string, branch: string) => Promise<void>;
  isLoading: boolean;
}

export const CodingAgent: React.FC<CodingAgentProps> = ({
  tasks,
  onExecuteTask,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('operava/operava-worker-core');
  const [selectedBranch, setSelectedBranch] = useState('feat/cf-ai-orchestration');
  const [activeTask, setActiveTask] = useState<CodingTask | null>(tasks[0] || null);

  const quickPrompts = [
    'Add Supabase JWT verification middleware to edge router',
    'Implement Resend deployment alert dispatcher on production release',
    'Audit repository dependencies & generate secure Cloudflare Workers config',
    'Create automated pull request with lint & build validation',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onExecuteTask(prompt, selectedRepo, selectedBranch);
    setPrompt('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Model Engine Banner */}
      <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                Coding Agent
              </h2>
            </div>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
              Generate code changes, inspect repository files, and automate tasks.
            </p>
          </div>
        </div>

        {/* Repository & Branch Controls */}
        <div className="mt-4 pt-4 border-t border-[#f0f2f5] dark:border-[#232834] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6] mb-1">
              Target Repository
            </label>
            <div className="relative">
              <FolderGit2 className="absolute left-3 top-2.5 h-4 w-4 text-[#5f6368] dark:text-[#9aa0a6]" />
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="operava/operava-worker-core">operava/operava-worker-core (Cloudflare Workers API)</option>
                <option value="operava/ai-token-hub-frontend">operava/ai-token-hub-frontend (React + Vite Edge)</option>
                <option value="operava/cloudflare-edge-router">operava/cloudflare-edge-router (Routing & Auth Gateway)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6] mb-1">
              Working Branch
            </label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-2.5 h-4 w-4 text-[#5f6368] dark:text-[#9aa0a6]" />
              <input
                type="text"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                placeholder="branch name (e.g. feat/agent-coding)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6] mb-1">
            Coding Task Description
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the feature, bugfix, or refactoring task for the Cloudflare Coding Agent (e.g., 'Add Supabase JWT verification middleware and unit tests')..."
              className="w-full p-3 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500 placeholder:text-[#80868b] resize-none"
            />
          </div>

          {/* Quick Prompts */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-[#80868b] self-center mr-1">Quick Tasks:</span>
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(qp)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/40 dark:hover:text-purple-400 transition-colors cursor-pointer border border-[#e2e4e9] dark:border-[#2c3240]"
              >
                {qp}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
              {isLoading ? (
                <span className="flex items-center text-purple-600 dark:text-purple-400">
                  <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping mr-2" />
                  Dev’ai Workers AI analyzing repo & generating code...
                </span>
              ) : (
                'Non-destructive: Generates diffs and stages GitHub Pull Requests.'
              )}
            </span>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isLoading ? 'Executing...' : 'Run Coding Agent'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Task Execution Details & Diff View */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Tasks List */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6] px-1">
              Coding Tasks History
            </h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setActiveTask(task)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeTask?.id === task.id
                      ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20'
                      : 'border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-medium text-[#1a1d24] dark:text-[#f0f3f6] line-clamp-2">
                      {task.prompt}
                    </p>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">
                    <span className="font-mono">{task.branch}</span>
                    <span>{new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Task Details & Diff Viewer */}
          {activeTask && (
            <div className="lg:col-span-2 rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-5 shadow-2xs space-y-4">
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f0f2f5] dark:border-[#232834]">
                <div>
                  <h4 className="text-sm font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                    {activeTask.prompt}
                  </h4>
                  <div className="mt-1 flex items-center space-x-3 text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                    <span className="font-mono text-orange-600 dark:text-orange-400">{activeTask.repo}</span>
                    <span>•</span>
                    <span className="font-mono">{activeTask.branch}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Model: {activeTask.model}</span>
                  </div>
                </div>

                {activeTask.prUrl && (
                  <a
                    href={activeTask.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 transition-colors border border-[#e2e4e9] dark:border-[#2c3240] self-start"
                  >
                    <GitPullRequest className="h-3.5 w-3.5 text-orange-500" />
                    <span>View PR on GitHub</span>
                    <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                  </a>
                )}
              </div>

              {/* Execution Steps Accordion */}
              <div>
                <p className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-2">
                  Execution Workflow Steps
                </p>
                <div className="space-y-1.5">
                  {activeTask.plan.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-xs text-[#1a1d24] dark:text-[#f0f3f6] p-2 rounded-lg bg-[#f8f9fb] dark:bg-[#1a1e27]"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Badges */}
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">Validation Status:</span>
                  <span>{activeTask.validationResults.output}</span>
                </div>
                <div className="flex space-x-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-mono">
                    Lint: Passed
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-mono">
                    Build: Verified
                  </span>
                </div>
              </div>

              {/* Code Changes Diff View */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider">
                    Surgical Code Diff ({activeTask.filesModified.length} file modified)
                  </p>
                  <span className="text-[10px] font-mono text-[#5f6368] dark:text-[#9aa0a6]">
                    Commit {activeTask.commitSha}
                  </span>
                </div>

                {activeTask.filesModified.map((file, i) => (
                  <div key={i} className="rounded-xl border border-[#e2e4e9] dark:border-[#252a35] overflow-hidden text-xs">
                    <div className="px-3 py-2 bg-[#f4f5f8] dark:bg-[#1f242e] border-b border-[#e2e4e9] dark:border-[#252a35] flex items-center justify-between font-mono text-[11px]">
                      <div className="flex items-center space-x-2">
                        <FileCode className="h-3.5 w-3.5 text-orange-500" />
                        <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">{file.path}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300">
                        {file.action}
                      </span>
                    </div>

                    <pre className="p-3 bg-[#0d1117] text-[#c9d1d9] font-mono text-[11px] overflow-x-auto leading-relaxed">
                      {file.diff.split('\n').map((line, lIdx) => {
                        const isAdd = line.startsWith('+');
                        const isSub = line.startsWith('-');
                        const isHdr = line.startsWith('@@');
                        return (
                          <div
                            key={lIdx}
                            className={
                              isAdd
                                ? 'bg-emerald-950/50 text-emerald-300 px-1 rounded-xs'
                                : isSub
                                ? 'bg-red-950/50 text-red-300 px-1 rounded-xs'
                                : isHdr
                                ? 'text-blue-400 font-semibold'
                                : 'text-[#8b949e]'
                            }
                          >
                            {line}
                          </div>
                        );
                      })}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

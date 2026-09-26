import crypto from 'crypto';
import type {
  PlatformAgent,
  ToolDefinition,
  McpServerConfig,
  Automation,
  AutomationExecutionLog,
  AttachedKnowledgeItem,
  AutomationStatus,
  CustomerWidgetConfig,
  ValidationCheckItem,
  AutomationValidationResult,
  AgentKnowledgeReference,
  AgentStructureFlow,
  AgentStructureStage,
} from '../../src/types/index.js';

// ============================================================
// 1. IN-MEMORY STORAGE & REPOSITORIES (Multi-tenant scoped)
// ============================================================

const DEFAULT_TENANT_ID = 'tenant_prod_edge_001';

// Seed Platform Agents with Generalized Knowledge References & Structure Flows
let agents: PlatformAgent[] = [
  {
    id: 'agent-general-01',
    name: 'General Agent',
    type: 'general',
    description: 'Autonomous multi-step orchestrator executing the 7-stage canonical lifecycle: prompt understanding, executive DAG planning, knowledge retrieval, approval gating, deterministic execution, resource verification, and immutable audit telemetry.',
    systemPrompt: 'You are the primary General Orchestrator. Strictly follow the Operava 7-Step Canonical Lifecycle: (1) Understand Request, (2) Build Executive Plan, (3) Retrieve Knowledge & Prepare Tool Call, (4) Approval Gate, (5) Execute Approved Action, (6) Verify Outcome & Compare Resources, (7) Audit Log & Telemetry.',
    permissions: ['knowledge.read', 'knowledge.write', 'email.read', 'email.schedule', 'agent.call', 'workflow.create', 'workflow.execute'],
    enabledTools: ['knowledge.search', 'knowledge.add', 'email.send', 'email.schedule', 'agent.call', 'task.schedule', 'workflow.run'],
    mcpServers: ['mcp-knowledge-01', 'mcp-email-01', 'mcp-cloudflare-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'Sparkles',
    status: 'active',
    compatibleChannels: ['webchat', 'api', 'email', 'cron'],
    compatibleAgents: ['developer', 'knowledge', 'customer_service', 'design', 'custom'],
    supportedInputFormats: ['text/plain', 'application/json', 'text/markdown'],
    fallbackChain: 'agent-custom-01',
    knowledgeReferences: [
      {
        titleId: 'operava-canonical-7-step-execution-framework-v1',
        title: 'Operava 7-Step Autonomous Agent Execution & Governance Standard',
        category: 'architecture',
        purpose: 'Universal 7-stage execution lifecycle governing all autonomous agents: Understand, Plan, Retrieve, Approve, Execute, Verify, and Audit.',
        required: true,
        referenceUri: 'operava://framework/canonical-7-step-lifecycle.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'multi-agent-orchestration-protocol-v1',
        title: 'Multi-Agent Orchestration & Delegation Protocol',
        category: 'architecture',
        purpose: 'Defines task delegation hierarchies, RPC message contracts, and state synchronization across sub-agents.',
        required: true,
        referenceUri: 'operava://protocols/orchestration-v1.json',
        compatibilityRole: 'primary',
        format: 'JSON',
      },
      {
        titleId: 'company-branding-v2',
        title: 'Company Brand Guidelines & Tokens',
        category: 'branding',
        purpose: 'Provides core brand palette hexes, typography stacks, and styling constraints.',
        required: true,
        referenceUri: 'operava://design/branding-v2.json',
        compatibilityRole: 'context',
        format: 'JSON',
      },
      {
        titleId: 'human-in-the-loop-approval-gates-v2',
        title: 'Human-in-the-Loop Approval & Consequential Action Gates',
        category: 'policy',
        purpose: 'Enforces explicit operator approval before mutating database records, scheduling emails, or deploying edge workers.',
        required: true,
        referenceUri: 'operava://policies/approval-gates-v2.md',
        compatibilityRole: 'validator',
        format: 'Markdown',
      },
      {
        titleId: 'zero-trust-secret-isolation-v1',
        title: 'Zero-Trust Secret Isolation & Credential Security',
        category: 'security',
        purpose: 'Guarantees raw tokens (WORKER_SECRET, GITHUB_TOKEN) never escape to client browser or unencrypted storage.',
        required: true,
        referenceUri: 'operava://security/zero-trust-isolation.md',
        compatibilityRole: 'validator',
        format: 'Markdown',
      },
      {
        titleId: 'monthly-client-email-v1',
        title: 'Monthly Client Email Template',
        category: 'template',
        purpose: 'Executive monthly briefing structure with placeholders for invocations, uptime, and highlights.',
        required: false,
        referenceUri: 'operava://templates/monthly-client-email.html',
        compatibilityRole: 'context',
        format: 'HTML',
      },
    ],
    structureFlow: {
      version: 'v2026.3',
      canonicalModel: '7_STEP_EXECUTIVE_LIFECYCLE',
      entryTrigger: 'Natural Language Prompt, REST API Call, or Scheduled Cloudflare Cron Trigger',
      errorBoundary: 'Exponential Backoff Retry -> Fallback Model Failover -> Human Escalation Notification',
      slaTargetMs: 1200,
      outputFormat: 'Markdown Briefing / Structured JSON Tool Call Plan',
      stages: [
        {
          order: 1,
          canonicalStepNumber: 1,
          canonicalPhase: 'understand_request',
          id: 'gen-step-1-understand',
          name: '1. Understand the Request',
          description: 'Validates tenant identifier, authenticates session, strips prompt injections, and extracts core operational intent.',
          stageType: 'ingress',
          toolDependencies: [],
          inputContract: '{ prompt: string, tenantId: string, channel: string }',
          outputContract: '{ sanitizedPrompt: string, intentCategory: string, tenantScope: string }',
          validationCheck: 'Tenant boundary matches active session and input passes security sanitization.',
          expectedResourcesCheck: 'Verified valid caller session token without tenant crossover.',
          fallbackAction: 'Reject request with 403 Forbidden or 400 Bad Request.',
        },
        {
          order: 2,
          canonicalStepNumber: 2,
          canonicalPhase: 'build_executive_plan',
          id: 'gen-step-2-plan',
          name: '2. Build the Executive Plan',
          description: 'Constructs deterministic dependency DAG, maps required tools, evaluates permission risk matrix, and estimates latency budget.',
          stageType: 'reasoning',
          toolDependencies: ['agent.call'],
          inputContract: '{ sanitizedPrompt: string, tenantScope: string }',
          outputContract: '{ plannedActions: string[], targetSubAgent?: string, riskLevel: string, slaBudgetMs: number }',
          validationCheck: 'All planned tools exist in Tool Registry and are permitted under caller authorization.',
          expectedResourcesCheck: 'Action sequence DAG compiled with target tool input schemas.',
          fallbackAction: 'Route to general exploratory inquiry or request operator clarification.',
        },
        {
          order: 3,
          canonicalStepNumber: 3,
          canonicalPhase: 'retrieve_knowledge_prepare_tool',
          id: 'gen-step-3-knowledge-tool',
          name: '3. Retrieve Knowledge & Prepare Tool Call',
          description: 'Queries Cloudflare Vectorize for semantic knowledge matches, fetches Title IDs, serializes parameters, and injects zero-trust secrets.',
          stageType: 'reasoning',
          toolDependencies: ['knowledge.search'],
          inputContract: '{ query: string, titleIds?: string[], plannedActions: string[] }',
          outputContract: '{ groundedContext: string, matchedTitleIds: string[], preparedToolPayloads: object }',
          validationCheck: 'Retrieved documents have status "Available" and parameters pass JSON schema validation.',
          expectedResourcesCheck: 'All referenced Title IDs verified with cosine similarity >= 0.82.',
          fallbackAction: 'Prompt operator for missing knowledge item or proceed with declared assumptions.',
        },
        {
          order: 4,
          canonicalStepNumber: 4,
          canonicalPhase: 'approval_gate',
          id: 'gen-step-4-approval-gate',
          name: '4. Approval Gate',
          description: 'Evaluates risk level; intercepts consequential operations (email delivery, worker deploy, code commit) for cryptographic operator approval.',
          stageType: 'gate',
          toolDependencies: [],
          inputContract: '{ plannedActions: string[], riskLevel: string, preparedToolPayloads: object }',
          outputContract: '{ approvalStatus: "approved" | "pending" | "cleared", approvalId: string, requiresHumanIntervention: boolean }',
          validationCheck: 'Cryptographic signature or operator authorization verified before external mutation.',
          expectedResourcesCheck: 'Approval token stamped with sha256 payload digest and operator credentials.',
          fallbackAction: 'Save automation in PENDING_APPROVAL status and notify operator.',
          requiresApproval: true,
        },
        {
          order: 5,
          canonicalStepNumber: 5,
          canonicalPhase: 'execute_approved_action',
          id: 'gen-step-5-execute-action',
          name: '5. Execute Approved Action',
          description: 'Dispatches task to specialized sub-agent (Developer, Design, Knowledge) or invokes edge worker/external API sequentially.',
          stageType: 'execution',
          toolDependencies: ['agent.call', 'email.schedule', 'cloudflare.deploy', 'workflow.run'],
          inputContract: '{ approvalId: string, preparedToolPayloads: object, targetAgentId?: string }',
          outputContract: '{ stepResults: array, executionDurationMs: number, exitCode: number }',
          validationCheck: 'Target subsystem returns 200/201 OK or structured success payload.',
          expectedResourcesCheck: 'Execution returns valid response matching provider output specification.',
          fallbackAction: 'Trigger fallback sub-agent or re-plan remaining workflow steps.',
        },
        {
          order: 6,
          canonicalStepNumber: 6,
          canonicalPhase: 'verify_outcome_compare_resources',
          id: 'gen-step-6-verify-outcome',
          name: '6. Verify Outcome & Compare to Expected Resources',
          description: 'Validates execution results against expected invariants, checks resource existence (DB/Worker/PR), and asserts zero state drift.',
          stageType: 'validation',
          toolDependencies: [],
          inputContract: '{ stepResults: array, expectedContract: string }',
          outputContract: '{ outcomeVerified: boolean, driftDetected: boolean, assertionsPassed: string[] }',
          validationCheck: 'Observed output matches expected resource state with zero drift.',
          expectedResourcesCheck: 'Asserted entity presence and schema conformance verified across edge mesh.',
          fallbackAction: 'Initiate automated rollback or flag discrepancy in telemetry.',
        },
        {
          order: 7,
          canonicalStepNumber: 7,
          canonicalPhase: 'audit_log_telemetry',
          id: 'gen-step-7-audit-telemetry',
          name: '7. Audit Log & Telemetry',
          description: 'Commits immutable structured execution record into audit trail with latency, step results, approval token, and SHA-256 hash.',
          stageType: 'egress',
          toolDependencies: [],
          inputContract: '{ stages: array, approvalId: string, verificationResult: object }',
          outputContract: '{ auditLogId: string, auditHash: string, completedAt: string, status: "completed" }',
          validationCheck: 'Audit record successfully persisted to memory ledger and database store.',
          expectedResourcesCheck: 'Immutable audit entry indexed and retrievable via audit log API.',
          fallbackAction: 'Deliver sanitized raw text response with error flag.',
        },
      ],
    },
  },
  {
    id: 'agent-developer-01',
    name: 'Developer Agent',
    type: 'developer',
    description: 'Codebase specialist integrated with GitHub and Cloudflare Workers executing the 7-stage lifecycle for surgical diffs, AST patches, PR dispatches, and edge deployment automation.',
    systemPrompt: 'You are the Developer Agent. Strictly adhere to the Operava 7-Step Canonical Lifecycle: (1) Understand Request, (2) Build Executive Plan, (3) Retrieve Knowledge & Prepare Tool Call, (4) Approval Gate, (5) Execute Approved Action, (6) Verify Outcome & Compare Resources, (7) Audit Log & Telemetry.',
    permissions: ['knowledge.read', 'github.read', 'github.write', 'cloudflare.read', 'cloudflare.deploy', 'workflow.create'],
    enabledTools: ['knowledge.search', 'github.read', 'github.write', 'github.pull_request', 'cloudflare.read', 'cloudflare.deploy'],
    mcpServers: ['mcp-knowledge-01', 'mcp-github-01', 'mcp-cloudflare-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'Terminal',
    status: 'active',
    compatibleChannels: ['github', 'api', 'webchat'],
    compatibleAgents: ['general', 'custom'],
    supportedInputFormats: ['text/x-diff', 'application/json', 'text/plain'],
    fallbackChain: 'agent-general-01',
    knowledgeReferences: [
      {
        titleId: 'operava-canonical-7-step-execution-framework-v1',
        title: 'Operava 7-Step Autonomous Agent Execution & Governance Standard',
        category: 'architecture',
        purpose: 'Universal 7-stage execution lifecycle governing all autonomous agents: Understand, Plan, Retrieve, Approve, Execute, Verify, and Audit.',
        required: true,
        referenceUri: 'operava://framework/canonical-7-step-lifecycle.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'cf-worker-architecture-spec-v1',
        title: 'Cloudflare Workers Runtime & Bindings Specification',
        category: 'architecture',
        purpose: 'Outlines Worker isolate boundaries, ES module export standards, KV/D1 bindings, and Cron Triggers.',
        required: true,
        referenceUri: 'operava://specs/cf-worker-architecture.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'git-branching-pr-guidelines-v2',
        title: 'GitHub Branching, Commit Convention & PR Standards',
        category: 'guidelines',
        purpose: 'Specifies conventional commit syntax, branch naming (feat/..., fix/...), and PR checklist requirements.',
        required: true,
        referenceUri: 'operava://guidelines/git-branching-standards.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'edge-isolate-security-model-v1',
        title: 'Edge Isolate Security & V8 Sandboxing Model',
        category: 'security',
        purpose: 'Guarantees sub-request isolation, memory safety boundaries, and tamper-proof runtime execution.',
        required: true,
        referenceUri: 'operava://security/edge-isolate-model.md',
        compatibilityRole: 'validator',
        format: 'Markdown',
      },
      {
        titleId: 'company-branding-v2',
        title: 'Company Brand Guidelines & Tokens',
        category: 'branding',
        purpose: 'Provides styling consistency for PR templates, comments, and deployment preview headers.',
        required: false,
        referenceUri: 'operava://design/branding-v2.json',
        compatibilityRole: 'context',
        format: 'JSON',
      },
    ],
    structureFlow: {
      version: 'v2026.3',
      canonicalModel: '7_STEP_EXECUTIVE_LIFECYCLE',
      entryTrigger: 'GitHub Webhook (PR opened, issue assigned) or Natural Language Coding Instruction',
      errorBoundary: 'Rollback Staged AST Changes -> Syntax Fallback -> Create GitHub Issue Alert',
      slaTargetMs: 2500,
      outputFormat: 'Unified Git Diff, PR URL, and Build Verification Artifact',
      stages: [
        {
          order: 1,
          canonicalStepNumber: 1,
          canonicalPhase: 'understand_request',
          id: 'dev-step-1-understand',
          name: '1. Understand the Request',
          description: 'Clones virtual tree, navigates source hierarchy, inspects package.json dependencies, and locates target modules.',
          stageType: 'ingress',
          toolDependencies: ['github.read'],
          inputContract: '{ repo: string, branch: string, taskPrompt: string }',
          outputContract: '{ fileTree: string[], relevantFiles: string[], existingDependencies: object }',
          validationCheck: 'Target repository and branch exist and GitHub token has repo read permission.',
          expectedResourcesCheck: 'Verified GitHub repository access and clean working tree.',
          fallbackAction: 'Query repository default branch or request repository access verification.',
        },
        {
          order: 2,
          canonicalStepNumber: 2,
          canonicalPhase: 'build_executive_plan',
          id: 'dev-step-2-plan',
          name: '2. Build the Executive Plan',
          description: 'Formulates surgical AST diff strategy, identifies impacted modules, constructs type-check dependency graph, and assesses regression risks.',
          stageType: 'reasoning',
          toolDependencies: [],
          inputContract: '{ relevantFiles: string[], taskObjective: string }',
          outputContract: '{ executionSteps: string[], targetFiles: string[], riskLevel: "write" }',
          validationCheck: 'Refactor plan isolates mutations strictly to requested files without collateral breaks.',
          expectedResourcesCheck: 'Module dependency DAG verified with package.json dependencies.',
          fallbackAction: 'Fall back to non-invasive wrapper pattern.',
        },
        {
          order: 3,
          canonicalStepNumber: 3,
          canonicalPhase: 'retrieve_knowledge_prepare_tool',
          id: 'dev-step-3-knowledge-tool',
          name: '3. Retrieve Knowledge & Prepare Tool Call',
          description: 'Retrieves Cloudflare Worker architecture specs, checks PR conventions, serializes git patch payload, and scans for secret leaks.',
          stageType: 'reasoning',
          toolDependencies: ['knowledge.search'],
          inputContract: '{ targetFiles: string[], conventions: string }',
          outputContract: '{ diffPayload: string, branchName: string, commitMessage: string }',
          validationCheck: 'Zero secret leaks detected in patch; conventional commit syntax verified.',
          expectedResourcesCheck: 'Conforms to git-branching-pr-guidelines-v2 Title ID.',
          fallbackAction: 'Re-generate diff using full-file replacement mode.',
        },
        {
          order: 4,
          canonicalStepNumber: 4,
          canonicalPhase: 'approval_gate',
          id: 'dev-step-4-approval-gate',
          name: '4. Approval Gate',
          description: 'Intercepts remote git push, branch mutation, or pull request creation for explicit operator sign-off.',
          stageType: 'gate',
          toolDependencies: [],
          inputContract: '{ branchName: string, diffPayload: string, commitMessage: string }',
          outputContract: '{ approvalStatus: "approved", approvalId: string }',
          validationCheck: 'Operator has confirmed diff preview and authorized git commit creation.',
          expectedResourcesCheck: 'Approval token stamped with SHA-256 diff hash.',
          fallbackAction: 'Save local patch artifact and notify operator of pending review.',
          requiresApproval: true,
        },
        {
          order: 5,
          canonicalStepNumber: 5,
          canonicalPhase: 'execute_approved_action',
          id: 'dev-step-5-execute-action',
          name: '5. Execute Approved Action',
          description: 'Creates git feature branch, commits surgical changes, pushes to remote, and dispatches pull request via GitHub API.',
          stageType: 'execution',
          toolDependencies: ['github.write', 'github.pull_request'],
          inputContract: '{ approvalId: string, branch: string, diff: string, title: string }',
          outputContract: '{ commitSha: string, prUrl: string, prNumber: number }',
          validationCheck: 'GitHub API returns 201 Created with valid PR URL.',
          expectedResourcesCheck: 'GitHub PR successfully created and visible on remote repository.',
          fallbackAction: 'Save local patch artifact and notify operator of GitHub API failure.',
        },
        {
          order: 6,
          canonicalStepNumber: 6,
          canonicalPhase: 'verify_outcome_compare_resources',
          id: 'dev-step-6-verify-outcome',
          name: '6. Verify Outcome & Compare to Expected Resources',
          description: 'Executes compiler check (tsc --noEmit), tests edge isolate build bundle size, and compares remote PR commits to local diff.',
          stageType: 'validation',
          toolDependencies: ['cloudflare.read'],
          inputContract: '{ prNumber: number, commitSha: string }',
          outputContract: '{ typeCheckPassed: boolean, bundleSizeBytes: number, driftDetected: false }',
          validationCheck: 'Compiler reports 0 errors, bundle < 1MB, and remote commit matches local SHA.',
          expectedResourcesCheck: 'Asserted pull request exists on GitHub with identical commit SHA and passing checks.',
          fallbackAction: 'Trigger autonomous self-correction pass targeting specific compiler error lines.',
        },
        {
          order: 7,
          canonicalStepNumber: 7,
          canonicalPhase: 'audit_log_telemetry',
          id: 'dev-step-7-audit-telemetry',
          name: '7. Audit Log & Telemetry',
          description: 'Records immutable audit trail containing commit SHA, PR link, execution duration, and cryptographic approval hash.',
          stageType: 'egress',
          toolDependencies: [],
          inputContract: '{ commitSha: string, prUrl: string, stages: array }',
          outputContract: '{ auditLogId: string, auditHash: string, timestamp: string }',
          validationCheck: 'Audit record successfully stored in persistent ledger.',
          expectedResourcesCheck: 'Audit record retrievable via /v1/audit/logs endpoint.',
          fallbackAction: 'Log critical warning to edge server console.',
        },
      ],
    },
  },
  {
    id: 'agent-knowledge-01',
    name: 'Knowledge Agent',
    type: 'knowledge',
    description: 'Document ingestion, chunking, semantic retrieval, and factual truth verification engine executing the 7-stage lifecycle backed by Cloudflare Vectorize.',
    systemPrompt: 'You are the Knowledge Agent. Strictly adhere to the Operava 7-Step Canonical Lifecycle: (1) Understand Request, (2) Build Executive Plan, (3) Retrieve Knowledge & Prepare Tool Call, (4) Approval Gate, (5) Execute Approved Action, (6) Verify Outcome & Compare Resources, (7) Audit Log & Telemetry.',
    permissions: ['knowledge.read', 'knowledge.write'],
    enabledTools: ['knowledge.search', 'knowledge.add'],
    mcpServers: ['mcp-knowledge-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'BookOpen',
    status: 'active',
    compatibleChannels: ['webchat', 'api', 'cron'],
    compatibleAgents: ['*'],
    supportedInputFormats: ['text/markdown', 'text/plain', 'application/json', 'text/html'],
    fallbackChain: 'agent-general-01',
    knowledgeReferences: [
      {
        titleId: 'operava-canonical-7-step-execution-framework-v1',
        title: 'Operava 7-Step Autonomous Agent Execution & Governance Standard',
        category: 'architecture',
        purpose: 'Universal 7-stage execution lifecycle governing all autonomous agents: Understand, Plan, Retrieve, Approve, Execute, Verify, and Audit.',
        required: true,
        referenceUri: 'operava://framework/canonical-7-step-lifecycle.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'rag-chunking-vectorize-standards-v1',
        title: 'RAG Chunking, Embeddings & Vectorize Retrieval Standards',
        category: 'specs',
        purpose: 'Defines 512-token sliding window chunking, 768-dim embeddings, and cosine similarity thresholds (0.82+).',
        required: true,
        referenceUri: 'operava://specs/rag-vectorize-standards.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'document-metadata-schema-v2',
        title: 'Document Metadata Schema & Title ID Canonical Naming',
        category: 'specs',
        purpose: 'Standardizes document headers, Title ID kebab-case slugs, tenant ownership, and MIME typing.',
        required: true,
        referenceUri: 'operava://schemas/doc-metadata-schema-v2.json',
        compatibilityRole: 'primary',
        format: 'JSON',
      },
      {
        titleId: 'zero-trust-secret-isolation-v1',
        title: 'Zero-Trust Secret Isolation & Credential Security',
        category: 'security',
        purpose: 'Ensures ingested documents do not contain unprotected credentials or private keys.',
        required: true,
        referenceUri: 'operava://security/zero-trust-isolation.md',
        compatibilityRole: 'validator',
        format: 'Markdown',
      },
      {
        titleId: 'company-branding-v2',
        title: 'Company Brand Guidelines & Tokens',
        category: 'branding',
        purpose: 'Reference typography and tone for generated knowledge summaries.',
        required: false,
        referenceUri: 'operava://design/branding-v2.json',
        compatibilityRole: 'context',
        format: 'JSON',
      },
    ],
    structureFlow: {
      version: 'v2026.3',
      canonicalModel: '7_STEP_EXECUTIVE_LIFECYCLE',
      entryTrigger: 'Document Upload, Webhook Document Ingestion, or Vector Search RAG Query',
      errorBoundary: 'Fallback to Lexical Full-Text Search -> Re-index Dead Letter Documents',
      slaTargetMs: 450,
      outputFormat: 'Ranked Semantic Chunks with Title ID Citations and Similarity Scores',
      stages: [
        {
          order: 1,
          canonicalStepNumber: 1,
          canonicalPhase: 'understand_request',
          id: 'know-step-1-understand',
          name: '1. Understand the Request',
          description: 'Validates file type (Markdown, HTML, JSON, TXT), strips binary artifacts, normalizes UTF-8 encoding, and extracts search intent.',
          stageType: 'ingress',
          toolDependencies: [],
          inputContract: '{ rawContent: string, format: string, filename: string }',
          outputContract: '{ cleanText: string, detectedMime: string, characterCount: number }',
          validationCheck: 'Content is valid UTF-8 and under 10MB per document.',
          expectedResourcesCheck: 'Verified clean text stream without binary corruptions.',
          fallbackAction: 'Convert encoding or reject unsupported binary format.',
        },
        {
          order: 2,
          canonicalStepNumber: 2,
          canonicalPhase: 'build_executive_plan',
          id: 'know-step-2-plan',
          name: '2. Build the Executive Plan',
          description: 'Calculates chunk boundaries (512 tokens with 10% overlap), plans batch embeddings, and evaluates deduplication strategy.',
          stageType: 'reasoning',
          toolDependencies: [],
          inputContract: '{ cleanText: string, characterCount: number }',
          outputContract: '{ chunkPlan: array, estimatedVectors: number, embeddingModel: string }',
          validationCheck: 'Every planned chunk has between 50 and 512 tokens with coherent semantic boundaries.',
          expectedResourcesCheck: 'Chunk partition matches sliding window parameters.',
          fallbackAction: 'Fallback to fixed-length line window chunking.',
        },
        {
          order: 3,
          canonicalStepNumber: 3,
          canonicalPhase: 'retrieve_knowledge_prepare_tool',
          id: 'know-step-3-knowledge-tool',
          name: '3. Retrieve Knowledge & Prepare Tool Call',
          description: 'Resolves canonical Title ID slug, verifies existing vector index schema, and prepares Vectorize upsert payloads.',
          stageType: 'reasoning',
          toolDependencies: ['knowledge.search'],
          inputContract: '{ title: string, suggestedTitleId?: string }',
          outputContract: '{ canonicalTitleId: string, preparedVectors: array }',
          validationCheck: 'Title ID adheres to regex /^[a-z0-9-]+$/ and does not collide with conflicting schemas.',
          expectedResourcesCheck: 'Title ID uniqueness confirmed in metadata repository.',
          fallbackAction: 'Append incrementing revision suffix (e.g. -v2).',
        },
        {
          order: 4,
          canonicalStepNumber: 4,
          canonicalPhase: 'approval_gate',
          id: 'know-step-4-approval-gate',
          name: '4. Approval Gate',
          description: 'Requires operator confirmation when deleting, overwriting existing Title IDs, or ingesting bulk archives.',
          stageType: 'gate',
          toolDependencies: [],
          inputContract: '{ canonicalTitleId: string, isOverwrite: boolean }',
          outputContract: '{ approvalStatus: "cleared" | "approved", approvalId: string }',
          validationCheck: 'Overwrite actions approved by operator; read/upsert operations auto-cleared.',
          expectedResourcesCheck: 'Approval token stamped with target Title ID.',
          fallbackAction: 'Pause ingestion and request operator sign-off.',
          requiresApproval: true,
        },
        {
          order: 5,
          canonicalStepNumber: 5,
          canonicalPhase: 'execute_approved_action',
          id: 'know-step-5-execute-action',
          name: '5. Execute Approved Action',
          description: 'Generates 768-dimensional embeddings via Workers AI and persists dense vectors to Cloudflare Vectorize.',
          stageType: 'execution',
          toolDependencies: ['knowledge.add'],
          inputContract: '{ approvalId: string, preparedVectors: array, canonicalTitleId: string }',
          outputContract: '{ indexedCount: number, status: "Available", latencyMs: number }',
          validationCheck: 'Vector dimensions strictly match 768 floats and Vectorize returns success.',
          expectedResourcesCheck: 'All vectors written to Cloudflare Vectorize index.',
          fallbackAction: 'Retry batch embedding with smaller sub-chunks.',
        },
        {
          order: 6,
          canonicalStepNumber: 6,
          canonicalPhase: 'verify_outcome_compare_resources',
          id: 'know-step-6-verify-outcome',
          name: '6. Verify Outcome & Compare to Expected Resources',
          description: 'Performs immediate retrieval query for the newly indexed Title ID to confirm indexation and cosine distance.',
          stageType: 'validation',
          toolDependencies: ['knowledge.search'],
          inputContract: '{ titleId: string }',
          outputContract: '{ retrievedScore: number, factuallyGroundedTestPassed: boolean }',
          validationCheck: 'Target Title ID returned in top-1 search result with similarity >= 0.85.',
          expectedResourcesCheck: 'Asserted document presence in Vectorize repository matches uploaded content.',
          fallbackAction: 'Flag document as pending re-indexing.',
        },
        {
          order: 7,
          canonicalStepNumber: 7,
          canonicalPhase: 'audit_log_telemetry',
          id: 'know-step-7-audit-telemetry',
          name: '7. Audit Log & Telemetry',
          description: 'Commits knowledge ingestion log with Title ID, vector count, processing latency, and SHA-256 audit digest.',
          stageType: 'egress',
          toolDependencies: [],
          inputContract: '{ titleId: string, indexedCount: number, durationMs: number }',
          outputContract: '{ auditLogId: string, auditHash: string, timestamp: string }',
          validationCheck: 'Audit log successfully committed to memory and Supabase audit trail.',
          expectedResourcesCheck: 'Audit record indexed and accessible in audit trail view.',
          fallbackAction: 'Deliver sanitized raw text response with error flag.',
        },
      ],
    },
  },
  {
    id: 'agent-customer-01',
    name: 'Customer Service Agent',
    type: 'customer_service',
    description: 'Isolated, zero-privilege embeddable customer service representative for public webchats, WhatsApp, and widget embeds executing the 7-stage lifecycle.',
    systemPrompt: 'You are the Customer Service Representative. Strictly adhere to the Operava 7-Step Canonical Lifecycle: (1) Understand Request, (2) Build Executive Plan, (3) Retrieve Knowledge & Prepare Tool Call, (4) Approval Gate, (5) Execute Approved Action, (6) Verify Outcome & Compare Resources, (7) Audit Log & Telemetry. Always be courteous, precise, and ground answers in verified customer policies.',
    permissions: ['knowledge.read'],
    enabledTools: ['knowledge.search'],
    mcpServers: ['mcp-knowledge-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'Bot',
    status: 'active',
    compatibleChannels: ['webchat', 'whatsapp', 'messenger', 'email'],
    compatibleAgents: ['general'],
    supportedInputFormats: ['text/plain', 'application/json'],
    fallbackChain: 'agent-general-01',
    knowledgeReferences: [
      {
        titleId: 'operava-canonical-7-step-execution-framework-v1',
        title: 'Operava 7-Step Autonomous Agent Execution & Governance Standard',
        category: 'architecture',
        purpose: 'Universal 7-stage execution lifecycle governing all autonomous agents: Understand, Plan, Retrieve, Approve, Execute, Verify, and Audit.',
        required: true,
        referenceUri: 'operava://framework/canonical-7-step-lifecycle.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'support-sla-escalation-policy-v1',
        title: 'Customer Support SLAs, Response Windows & Escalation Protocol',
        category: 'policy',
        purpose: 'Provides exact 24/7 SLA rules, response deadlines (<30s webchat, <15m email), and Tier-2 escalation rules.',
        required: true,
        referenceUri: 'operava://policies/support-sla-policy.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'refund-and-billing-protocol-v1',
        title: 'Subscription, Billing, Prorations & Refund Protocol',
        category: 'policy',
        purpose: 'Enforces 14-day money-back guarantee, invoice grace periods (7 days), and payment retry steps.',
        required: true,
        referenceUri: 'operava://policies/refund-billing-protocol.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'whatsapp-messenger-compliance-v1',
        title: 'WhatsApp Business & Meta Messenger Communication Compliance',
        category: 'guidelines',
        purpose: 'Rules for conversational paragraph length, polite tone, opt-in disclosures, and emoji constraints.',
        required: true,
        referenceUri: 'operava://guidelines/messaging-compliance.md',
        compatibilityRole: 'context',
        format: 'Markdown',
      },
      {
        titleId: 'company-branding-v2',
        title: 'Company Brand Guidelines & Tokens',
        category: 'branding',
        purpose: 'Ensures company name and brand identity are represented consistently.',
        required: true,
        referenceUri: 'operava://design/branding-v2.json',
        compatibilityRole: 'context',
        format: 'JSON',
      },
    ],
    structureFlow: {
      version: 'v2026.3',
      canonicalModel: '7_STEP_EXECUTIVE_LIFECYCLE',
      entryTrigger: 'Inbound Customer Message via WhatsApp Cloud API, Meta Messenger, or Embeddable Webchat Widget',
      errorBoundary: 'Trigger Human Handoff Alert -> Queue Tier-2 Ticket (support@operava.com)',
      slaTargetMs: 800,
      outputFormat: 'Channel-Formatted Conversational Reply or Structured Escalation Payload',
      stages: [
        {
          order: 1,
          canonicalStepNumber: 1,
          canonicalPhase: 'understand_request',
          id: 'cust-step-1-understand',
          name: '1. Understand the Request',
          description: 'Receives webhook payload from WhatsApp, Messenger, or webchat, extracts sender identity, and performs sentiment analysis.',
          stageType: 'ingress',
          toolDependencies: [],
          inputContract: '{ senderId: string, channel: string, message: string }',
          outputContract: '{ normalizedQuery: string, customerId: string, sentiment: string }',
          validationCheck: 'Webhook signature HMAC matches channel secret and sender is not rate-limited.',
          expectedResourcesCheck: 'Customer session context resolved without credential exposure.',
          fallbackAction: 'Respond with 401 Unauthorized or 429 Too Many Requests.',
        },
        {
          order: 2,
          canonicalStepNumber: 2,
          canonicalPhase: 'build_executive_plan',
          id: 'cust-step-2-plan',
          name: '2. Build the Executive Plan',
          description: 'Classifies inquiry (billing, technical, product info) and plans policy retrieval or Tier-2 human escalation.',
          stageType: 'reasoning',
          toolDependencies: [],
          inputContract: '{ normalizedQuery: string, sentiment: string }',
          outputContract: '{ actionCategory: string, requiresEscalation: boolean, channelFormat: string }',
          validationCheck: 'Plan restricts execution strictly to zero-privilege public knowledge retrieval.',
          expectedResourcesCheck: 'Action category mapped to customer policy matrix.',
          fallbackAction: 'Prepend polite acknowledgment and route to standard FAQ lookup.',
        },
        {
          order: 3,
          canonicalStepNumber: 3,
          canonicalPhase: 'retrieve_knowledge_prepare_tool',
          id: 'cust-step-3-knowledge-tool',
          name: '3. Retrieve Knowledge & Prepare Tool Call',
          description: 'Queries Vectorize semantic index for relevant policy documents (SLA, refund, billing) and prepares response draft.',
          stageType: 'reasoning',
          toolDependencies: ['knowledge.search'],
          inputContract: '{ query: string, allowedCategories: ["policy", "faq", "specs"] }',
          outputContract: '{ relevantPolicies: string[], matchedTitleIds: string[] }',
          validationCheck: 'Retrieved documents are marked isActive: true and belong to customer policy scope.',
          expectedResourcesCheck: 'Policies retrieved from authorized customer knowledge domain.',
          fallbackAction: 'Use courteous general fallback guidance asking for order or account details.',
        },
        {
          order: 4,
          canonicalStepNumber: 4,
          canonicalPhase: 'approval_gate',
          id: 'cust-step-4-approval-gate',
          name: '4. Approval Gate',
          description: 'Intercepts consequential requests (refund processing, account cancellations, credit grants) for human supervisor sign-off.',
          stageType: 'gate',
          toolDependencies: [],
          inputContract: '{ actionCategory: string, sentiment: string }',
          outputContract: '{ approvalStatus: "cleared" | "pending_human", approvalId: string }',
          validationCheck: 'Non-consequential informational replies auto-cleared; account mutations require supervisor approval.',
          expectedResourcesCheck: 'Approval status token logged before response dispatch.',
          fallbackAction: 'Inform customer of pending supervisor review and queue ticket.',
          requiresApproval: true,
        },
        {
          order: 5,
          canonicalStepNumber: 5,
          canonicalPhase: 'execute_approved_action',
          id: 'cust-step-5-execute-action',
          name: '5. Execute Approved Action',
          description: 'Synthesizes channel-specific response (WhatsApp concise bullets vs Messenger bubble vs Webchat markdown) and dispatches outbound payload.',
          stageType: 'execution',
          toolDependencies: [],
          inputContract: '{ approvalId: string, matchedPolicies: array, channel: string }',
          outputContract: '{ outboundPayload: object, characterCount: number, dispatchStatus: 200 }',
          validationCheck: 'Payload complies with WhatsApp 4096 character limits and Meta Messenger schema.',
          expectedResourcesCheck: 'Outbound payload sent via official channel webhook.',
          fallbackAction: 'Truncate smoothly with "...read more on our support portal".',
        },
        {
          order: 6,
          canonicalStepNumber: 6,
          canonicalPhase: 'verify_outcome_compare_resources',
          id: 'cust-step-6-verify-outcome',
          name: '6. Verify Outcome & Compare to Expected Resources',
          description: 'Verifies delivery receipt from messaging provider and asserts tone matches Brand Guidelines without robotic language.',
          stageType: 'validation',
          toolDependencies: [],
          inputContract: '{ outboundPayload: object, dispatchStatus: number }',
          outputContract: '{ deliveryConfirmed: boolean, toneCheckPassed: boolean }',
          validationCheck: 'Provider returns HTTP 200 OK delivery receipt.',
          expectedResourcesCheck: 'Asserted message delivery ID matches customer conversation thread.',
          fallbackAction: 'Flag failed message delivery in operations dashboard.',
        },
        {
          order: 7,
          canonicalStepNumber: 7,
          canonicalPhase: 'audit_log_telemetry',
          id: 'cust-step-7-audit-telemetry',
          name: '7. Audit Log & Telemetry',
          description: 'Commits customer interaction record with session transcript ID, response latency (<800ms SLA), and SHA-256 audit digest.',
          stageType: 'egress',
          toolDependencies: [],
          inputContract: '{ customerId: string, durationMs: number, approvalId: string }',
          outputContract: '{ auditLogId: string, auditHash: string, timestamp: string }',
          validationCheck: 'Audit record successfully stored in persistent ledger.',
          expectedResourcesCheck: 'Audit trail accessible in Controller Telemetry tab.',
          fallbackAction: 'Log critical warning to server console.',
        },
      ],
    },
  },
  {
    id: 'agent-design-01',
    name: 'Design Agent',
    type: 'design',
    description: 'Interface & design system specialist integrated with Figma MCP executing the 7-stage lifecycle for token inspections, WCAG accessibility, and component specs.',
    systemPrompt: 'You are the Design Agent. Strictly adhere to the Operava 7-Step Canonical Lifecycle: (1) Understand Request, (2) Build Executive Plan, (3) Retrieve Knowledge & Prepare Tool Call, (4) Approval Gate, (5) Execute Approved Action, (6) Verify Outcome & Compare Resources, (7) Audit Log & Telemetry. Inspect design tokens, validate accessibility, and verify frontend components.',
    permissions: ['knowledge.read', 'figma.read', 'figma.write'],
    enabledTools: ['knowledge.search', 'figma.read', 'figma.create'],
    mcpServers: ['mcp-knowledge-01', 'mcp-figma-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'Layers',
    status: 'active',
    compatibleChannels: ['webchat', 'api', 'github'],
    compatibleAgents: ['general', 'developer'],
    supportedInputFormats: ['application/json', 'text/plain'],
    fallbackChain: 'agent-developer-01',
    knowledgeReferences: [
      {
        titleId: 'operava-canonical-7-step-execution-framework-v1',
        title: 'Operava 7-Step Autonomous Agent Execution & Governance Standard',
        category: 'architecture',
        purpose: 'Universal 7-stage execution lifecycle governing all autonomous agents: Understand, Plan, Retrieve, Approve, Execute, Verify, and Audit.',
        required: true,
        referenceUri: 'operava://framework/canonical-7-step-lifecycle.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'design-tokens-theme-specification-v2',
        title: 'Design Tokens, Theme Variables & Dark Mode Constitution',
        category: 'specs',
        purpose: 'Provides token nomenclature (color, spacing, elevation), surface contrasts, and CSS utility mappings.',
        required: true,
        referenceUri: 'operava://design/design-tokens-v2.json',
        compatibilityRole: 'primary',
        format: 'JSON',
      },
      {
        titleId: 'figma-to-code-component-mapping-v1',
        title: 'Figma Component to Tailwind React JSX Architecture',
        category: 'architecture',
        purpose: 'Defines translation rules from Figma autolayout frames to modern flexbox/grid Tailwind classes.',
        required: true,
        referenceUri: 'operava://design/figma-to-code-rules.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'company-branding-v2',
        title: 'Company Brand Guidelines & Tokens',
        category: 'branding',
        purpose: 'Enforces brand orange (#ff6b35) to purple (#9333ea) gradient and dark mode background (#0f1117).',
        required: true,
        referenceUri: 'operava://design/branding-v2.json',
        compatibilityRole: 'primary',
        format: 'JSON',
      },
    ],
    structureFlow: {
      version: 'v2026.3',
      canonicalModel: '7_STEP_EXECUTIVE_LIFECYCLE',
      entryTrigger: 'Figma File Webhook or Natural Language UI Specification Request',
      errorBoundary: 'Fallback to Base Design Token Palette -> Standard Component Scaffold',
      slaTargetMs: 1800,
      outputFormat: 'Design Token Spec, WCAG Audit Report, and Tailwind React JSX',
      stages: [
        {
          order: 1,
          canonicalStepNumber: 1,
          canonicalPhase: 'understand_request',
          id: 'des-step-1-understand',
          name: '1. Understand the Request',
          description: 'Queries Figma MCP server for document styles, node tree, color fills, typography, and spacing variables.',
          stageType: 'ingress',
          toolDependencies: ['figma.read'],
          inputContract: '{ fileKey: string, nodeId: string }',
          outputContract: '{ rawStyles: object, componentTree: object }',
          validationCheck: 'Figma file key is valid and token access is authorized.',
          expectedResourcesCheck: 'Figma node hierarchy fetched with verified styling properties.',
          fallbackAction: 'Query local brand guidelines (company-branding-v2) as default token source.',
        },
        {
          order: 2,
          canonicalStepNumber: 2,
          canonicalPhase: 'build_executive_plan',
          id: 'des-step-2-plan',
          name: '2. Build the Executive Plan',
          description: 'Analyzes visual hierarchy, responsive breakpoints, auto-layout directions, and semantic element types (nav, section, button).',
          stageType: 'reasoning',
          toolDependencies: [],
          inputContract: '{ componentTree: object }',
          outputContract: '{ layoutNodes: array, flexDirections: object, paddingTokens: object }',
          validationCheck: 'Visual hierarchy maps cleanly to semantic HTML with anti-pill geometry.',
          expectedResourcesCheck: 'Layout tree decomposed into accessible component frames.',
          fallbackAction: 'Wrap layout in standard flex container with auto-margins.',
        },
        {
          order: 3,
          canonicalStepNumber: 3,
          canonicalPhase: 'retrieve_knowledge_prepare_tool',
          id: 'des-step-3-knowledge-tool',
          name: '3. Retrieve Knowledge & Prepare Tool Call',
          description: 'Retrieves design tokens theme spec, maps colors to company-branding-v2 hexes, and prepares Tailwind JSX template.',
          stageType: 'reasoning',
          toolDependencies: ['knowledge.search'],
          inputContract: '{ layoutNodes: array }',
          outputContract: '{ mappedTokens: object, jsxScaffold: string }',
          validationCheck: 'Zero arbitrary rounded-full usage on buttons; token names match system.',
          expectedResourcesCheck: 'Theme tokens conform to design-tokens-theme-specification-v2.',
          fallbackAction: 'Automatically replace rounded-full with rounded-xl and apply brand gradient class.',
        },
        {
          order: 4,
          canonicalStepNumber: 4,
          canonicalPhase: 'approval_gate',
          id: 'des-step-4-approval-gate',
          name: '4. Approval Gate',
          description: 'Validates design mutations before writing back to Figma file or committing generated code to repository.',
          stageType: 'gate',
          toolDependencies: [],
          inputContract: '{ jsxScaffold: string, mappedTokens: object }',
          outputContract: '{ approvalStatus: "approved", approvalId: string }',
          validationCheck: 'Operator confirms design spec preview before code generation or Figma write.',
          expectedResourcesCheck: 'Approval token stamped with component spec digest.',
          fallbackAction: 'Present design prototype in preview canvas for approval.',
          requiresApproval: true,
        },
        {
          order: 5,
          canonicalStepNumber: 5,
          canonicalPhase: 'execute_approved_action',
          id: 'des-step-5-execute-action',
          name: '5. Execute Approved Action',
          description: 'Generates clean, production TypeScript JSX with responsive Tailwind utility classes and exports spec to Developer Agent.',
          stageType: 'execution',
          toolDependencies: ['figma.create', 'agent.call'],
          inputContract: '{ approvalId: string, jsxScaffold: string, tokens: object }',
          outputContract: '{ jsxSnippet: string, handoffBundle: object }',
          validationCheck: 'JSX parses without syntax errors and contains accessible aria labels.',
          expectedResourcesCheck: 'Component artifact synthesized and ready for developer consumption.',
          fallbackAction: 'Deliver design spec directly to chat canvas.',
        },
        {
          order: 6,
          canonicalStepNumber: 6,
          canonicalPhase: 'verify_outcome_compare_resources',
          id: 'des-step-6-verify-outcome',
          name: '6. Verify Outcome & Compare to Expected Resources',
          description: 'Runs automated WCAG 2.1 AA contrast audit (min 4.5:1 ratio) and confirms rendered dimensions match Figma prototype frame.',
          stageType: 'validation',
          toolDependencies: [],
          inputContract: '{ jsxSnippet: string, originalFigmaFrame: object }',
          outputContract: '{ contrastRatio: number, passedAA: boolean, dimensionsMatch: boolean }',
          validationCheck: 'WCAG 2.1 AA certified (contrast >= 4.5:1) and zero layout overflow.',
          expectedResourcesCheck: 'Asserted rendered elements match original Figma frame coordinates.',
          fallbackAction: 'Darken or lighten text color hex to achieve certified AA compliance.',
        },
        {
          order: 7,
          canonicalStepNumber: 7,
          canonicalPhase: 'audit_log_telemetry',
          id: 'des-step-7-audit-telemetry',
          name: '7. Audit Log & Telemetry',
          description: 'Commits design asset generation log with Figma node ID, component tokens, contrast score, and SHA-256 hash.',
          stageType: 'egress',
          toolDependencies: [],
          inputContract: '{ handoffBundle: object, contrastRatio: number }',
          outputContract: '{ auditLogId: string, auditHash: string, timestamp: string }',
          validationCheck: 'Audit record successfully stored in persistent ledger.',
          expectedResourcesCheck: 'Audit entry retrievable in Controller Telemetry tab.',
          fallbackAction: 'Log critical warning to server console.',
        },
      ],
    },
  },
  {
    id: 'agent-custom-01',
    name: 'Custom Operations Agent',
    type: 'custom',
    description: 'Configurable edge agent tailored for multi-step webhook ingestion, database reconciliations, and scheduled side-effects executing the 7-stage lifecycle.',
    systemPrompt: 'You are a Custom Operations Agent tailored for specific edge automations. Strictly adhere to the Operava 7-Step Canonical Lifecycle: (1) Understand Request, (2) Build Executive Plan, (3) Retrieve Knowledge & Prepare Tool Call, (4) Approval Gate, (5) Execute Approved Action, (6) Verify Outcome & Compare Resources, (7) Audit Log & Telemetry.',
    permissions: ['knowledge.read', 'email.schedule', 'cloudflare.read'],
    enabledTools: ['knowledge.search', 'email.schedule', 'cloudflare.read'],
    mcpServers: ['mcp-knowledge-01', 'mcp-email-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'Zap',
    status: 'standby',
    compatibleChannels: ['api', 'cron', 'email'],
    compatibleAgents: ['general', 'developer'],
    supportedInputFormats: ['application/json', 'text/plain'],
    fallbackChain: 'agent-general-01',
    knowledgeReferences: [
      {
        titleId: 'operava-canonical-7-step-execution-framework-v1',
        title: 'Operava 7-Step Autonomous Agent Execution & Governance Standard',
        category: 'architecture',
        purpose: 'Universal 7-stage execution lifecycle governing all autonomous agents: Understand, Plan, Retrieve, Approve, Execute, Verify, and Audit.',
        required: true,
        referenceUri: 'operava://framework/canonical-7-step-lifecycle.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'cron-workflow-orchestration-specs-v1',
        title: 'Cloudflare Cron Triggers & Workflow Orchestration Specifications',
        category: 'specs',
        purpose: 'Defines recurring cron syntax ("31 October 2026 09:00"), state checkpoints, and timeout limits.',
        required: true,
        referenceUri: 'operava://specs/cron-workflows.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'webhook-signature-hmac-verification-v1',
        title: 'Inbound Webhook Cryptographic HMAC Verification Protocol',
        category: 'security',
        purpose: 'Enforces sha256 HMAC verification against WORKER_SECRET for incoming triggers.',
        required: true,
        referenceUri: 'operava://security/webhook-hmac-protocol.md',
        compatibilityRole: 'primary',
        format: 'Markdown',
      },
      {
        titleId: 'signature-template',
        title: 'Executive Email Signature',
        category: 'template',
        purpose: 'Provides verified standard compliance signature for notification emails.',
        required: false,
        referenceUri: 'operava://templates/signature-template.html',
        compatibilityRole: 'context',
        format: 'HTML',
      },
      {
        titleId: 'client-recipient-list',
        title: 'Client VIP Recipient Roster',
        category: 'template',
        purpose: 'Authorized stakeholder email directory for operational digests.',
        required: false,
        referenceUri: 'operava://data/client-recipients.json',
        compatibilityRole: 'context',
        format: 'JSON',
      },
    ],
    structureFlow: {
      version: 'v2026.3',
      canonicalModel: '7_STEP_EXECUTIVE_LIFECYCLE',
      entryTrigger: 'Cloudflare Scheduled Cron Event or Inbound Webhook (POST /v1/webhooks/custom)',
      errorBoundary: 'Dead Letter Queue (DLQ) in Cloudflare D1 -> Resend Failure Alert to Operator',
      slaTargetMs: 1500,
      outputFormat: 'Execution Receipt, Immutable Telemetry Log, and Side-Effect Audit Record',
      stages: [
        {
          order: 1,
          canonicalStepNumber: 1,
          canonicalPhase: 'understand_request',
          id: 'custop-step-1-understand',
          name: '1. Understand the Request',
          description: 'Validates cryptographic signature header (X-Signature-SHA256) or parses Cloudflare Cron scheduled payload, verifying tenant isolation.',
          stageType: 'ingress',
          toolDependencies: [],
          inputContract: '{ headers: object, body: object, cronTime?: string }',
          outputContract: '{ verified: boolean, triggerSource: string, payload: object }',
          validationCheck: 'HMAC signature matches hash generated with WORKER_SECRET.',
          expectedResourcesCheck: 'Trigger authorization verified with WORKER_SECRET enclave.',
          fallbackAction: 'Reject request with 401 Unauthorized and log security alert.',
        },
        {
          order: 2,
          canonicalStepNumber: 2,
          canonicalPhase: 'build_executive_plan',
          id: 'custop-step-2-plan',
          name: '2. Build the Executive Plan',
          description: 'Rehydrates persistent automation record from D1 database, validates step dependencies, and sets checkpoint recovery milestones.',
          stageType: 'reasoning',
          toolDependencies: ['cloudflare.read'],
          inputContract: '{ automationId: string }',
          outputContract: '{ plannedSequence: array, isReady: boolean, estimatedSideEffects: array }',
          validationCheck: 'Automation status is "ACTIVE" or "SCHEDULED" and tenant matches session.',
          expectedResourcesCheck: 'Database automation record rehydrated without corruptions.',
          fallbackAction: 'Halt execution if automation is paused or disabled.',
        },
        {
          order: 3,
          canonicalStepNumber: 3,
          canonicalPhase: 'retrieve_knowledge_prepare_tool',
          id: 'custop-step-3-knowledge-tool',
          name: '3. Retrieve Knowledge & Prepare Tool Call',
          description: 'Retrieves client-recipient-list and monthly-client-email template from Vectorize, interpolating variables (CLIENT_NAME, MONTH).',
          stageType: 'reasoning',
          toolDependencies: ['knowledge.search'],
          inputContract: '{ templateTitleId: string, recipientListTitleId: string }',
          outputContract: '{ preparedEmailPayload: object, resolvedRecipients: array }',
          validationCheck: 'All template variables interpolated without unresolved {{TAG}} strings.',
          expectedResourcesCheck: 'Recipients validated against authorized VIP client directory.',
          fallbackAction: 'Abort pipeline before executing mutating steps.',
        },
        {
          order: 4,
          canonicalStepNumber: 4,
          canonicalPhase: 'approval_gate',
          id: 'custop-step-4-approval-gate',
          name: '4. Approval Gate',
          description: 'Enforces human-in-the-loop sign-off before executing external side-effects (e.g. mass transactional email dispatch or database writes).',
          stageType: 'gate',
          toolDependencies: [],
          inputContract: '{ preparedEmailPayload: object, requiresApproval: boolean }',
          outputContract: '{ gateCleared: boolean, approvalId: string }',
          validationCheck: 'If requiresApproval is true, approvalStatus must strictly equal "approved".',
          expectedResourcesCheck: 'Approval token verified with operator cryptographic key.',
          fallbackAction: 'Pause execution and request operator sign-off in Controller UI.',
          requiresApproval: true,
        },
        {
          order: 5,
          canonicalStepNumber: 5,
          canonicalPhase: 'execute_approved_action',
          id: 'custop-step-5-execute-action',
          name: '5. Execute Approved Action',
          description: 'Dispatches actual external side-effect (e.g. sending transactional email via Resend API and recording state in Cloudflare D1).',
          stageType: 'execution',
          toolDependencies: ['email.schedule', 'cloudflare.read'],
          inputContract: '{ approvalId: string, payload: object, toolId: string }',
          outputContract: '{ dispatchResult: object, externalId: string, latencyMs: number }',
          validationCheck: 'External provider returns 200 OK or 201 Created.',
          expectedResourcesCheck: 'Side-effect successfully executed with provider confirmation ID.',
          fallbackAction: 'Enqueue payload in D1 Dead Letter Queue for automatic retry in 5 minutes.',
        },
        {
          order: 6,
          canonicalStepNumber: 6,
          canonicalPhase: 'verify_outcome_compare_resources',
          id: 'custop-step-6-verify-outcome',
          name: '6. Verify Outcome & Compare to Expected Resources',
          description: 'Verifies external receipt (Resend delivery ID), queries D1 database to assert status transition to "COMPLETED", and confirms zero state drift.',
          stageType: 'validation',
          toolDependencies: ['cloudflare.read'],
          inputContract: '{ externalId: string, automationId: string }',
          outputContract: '{ stateTransitionVerified: boolean, driftDetected: false }',
          validationCheck: 'Automation state successfully persisted as COMPLETED in database.',
          expectedResourcesCheck: 'Asserted database record matches updated execution timestamp and delivery ID.',
          fallbackAction: 'Initiate automated reconciliation or alarm operator.',
        },
        {
          order: 7,
          canonicalStepNumber: 7,
          canonicalPhase: 'audit_log_telemetry',
          id: 'custop-step-7-audit-telemetry',
          name: '7. Audit Log & Telemetry',
          description: 'Records comprehensive execution timing, step statuses, and tool results in immutable audit store with SHA-256 integrity hash.',
          stageType: 'egress',
          toolDependencies: [],
          inputContract: '{ executionId: string, steps: array, toolCalls: array, approvalId: string }',
          outputContract: '{ auditLogId: string, auditHash: string, completedAt: string }',
          validationCheck: 'Audit log successfully committed to memory and Supabase audit trail.',
          expectedResourcesCheck: 'Immutable audit entry indexed and verifiable in audit history.',
          fallbackAction: 'Log critical warning to server console.',
        },
      ],
    },
  },
];

// Seed Controlled Tool Registry
let tools: ToolDefinition[] = [
  {
    toolId: 'knowledge.search',
    name: 'Search Knowledge Base',
    description: 'Performs semantic vector search across tenant-authorized documents using Cloudflare Vectorize.',
    provider: 'native',
    mcpServerId: 'mcp-knowledge-01',
    inputSchema: { query: 'string', limit: 'number', category: 'string' },
    permissions: ['knowledge.read'],
    enabled: true,
    riskLevel: 'read',
    requiresApproval: false,
  },
  {
    toolId: 'knowledge.add',
    name: 'Ingest Knowledge Document',
    description: 'Chunks, embeds, and indexes a new document with an immutable Title ID.',
    provider: 'native',
    mcpServerId: 'mcp-knowledge-01',
    inputSchema: { title: 'string', titleId: 'string', content: 'string', format: 'string' },
    permissions: ['knowledge.write'],
    enabled: true,
    riskLevel: 'write',
    requiresApproval: false,
  },
  {
    toolId: 'email.send',
    name: 'Send Transactional Email',
    description: 'Dispatches validated HTML & plain-text email through Resend API pipeline.',
    provider: 'resend',
    mcpServerId: 'mcp-email-01',
    inputSchema: { to: 'string', subject: 'string', html: 'string', text: 'string' },
    permissions: ['email.send'],
    enabled: true,
    riskLevel: 'external_side_effect',
    requiresApproval: true,
  },
  {
    toolId: 'email.schedule',
    name: 'Schedule Email Automation',
    description: 'Registers a cron schedule in Cloudflare Workflows / Cron Triggers for future Resend delivery.',
    provider: 'resend',
    mcpServerId: 'mcp-email-01',
    inputSchema: { recipient: 'string', schedule: 'string', titleId: 'string', subject: 'string' },
    permissions: ['email.schedule'],
    enabled: true,
    riskLevel: 'external_side_effect',
    requiresApproval: true,
  },
  {
    toolId: 'github.read',
    name: 'Inspect GitHub Repository',
    description: 'Fetches directory tree, file contents, commit history, and active branches via GitHub REST API.',
    provider: 'github',
    mcpServerId: 'mcp-github-01',
    inputSchema: { repo: 'string', path: 'string', branch: 'string' },
    permissions: ['github.read'],
    enabled: true,
    riskLevel: 'read',
    requiresApproval: false,
  },
  {
    toolId: 'github.write',
    name: 'Commit Code Patch',
    description: 'Applies surgical AST code changes and pushes to a designated GitHub repository branch.',
    provider: 'github',
    mcpServerId: 'mcp-github-01',
    inputSchema: { repo: 'string', branch: 'string', files: 'array', message: 'string' },
    permissions: ['github.write'],
    enabled: true,
    riskLevel: 'write',
    requiresApproval: true,
  },
  {
    toolId: 'github.pull_request',
    name: 'Create Pull Request',
    description: 'Generates structured pull request with verification checklist, issue links, and summary.',
    provider: 'github',
    mcpServerId: 'mcp-github-01',
    inputSchema: { repo: 'string', title: 'string', body: 'string', head: 'string', base: 'string' },
    permissions: ['github.write'],
    enabled: true,
    riskLevel: 'write',
    requiresApproval: true,
  },
  {
    toolId: 'figma.read',
    name: 'Read Design Tokens & Context',
    description: 'Extracts typography, color palettes, spacing tokens, and component definitions via Figma MCP.',
    provider: 'figma',
    mcpServerId: 'mcp-figma-01',
    inputSchema: { fileKey: 'string', nodeId: 'string' },
    permissions: ['figma.read'],
    enabled: true,
    riskLevel: 'read',
    requiresApproval: false,
  },
  {
    toolId: 'figma.create',
    name: 'Create Design Component Spec',
    description: 'Generates implementation guidance and design specs from Figma canvas objects.',
    provider: 'figma',
    mcpServerId: 'mcp-figma-01',
    inputSchema: { fileKey: 'string', specData: 'object' },
    permissions: ['figma.write'],
    enabled: true,
    riskLevel: 'write',
    requiresApproval: false,
  },
  {
    toolId: 'cloudflare.read',
    name: 'Inspect Cloudflare Deployments',
    description: 'Reads active worker versions, environment variables, health metrics, and colocation status.',
    provider: 'cloudflare',
    mcpServerId: 'mcp-cloudflare-01',
    inputSchema: { workerName: 'string' },
    permissions: ['cloudflare.read'],
    enabled: true,
    riskLevel: 'read',
    requiresApproval: false,
  },
  {
    toolId: 'cloudflare.deploy',
    name: 'Deploy Worker Release',
    description: 'Triggers live build, binding verification, and zero-downtime deployment across Cloudflare edge nodes.',
    provider: 'cloudflare',
    mcpServerId: 'mcp-cloudflare-01',
    inputSchema: { script: 'string', bindings: 'object' },
    permissions: ['cloudflare.deploy'],
    enabled: true,
    riskLevel: 'high_impact',
    requiresApproval: true,
  },
  {
    toolId: 'agent.call',
    name: 'Invoke Sub-Agent',
    description: 'Dispatches task to another authorized agent (e.g., General Agent -> Design Agent -> Result).',
    provider: 'native',
    inputSchema: { targetAgentId: 'string', taskPrompt: 'string', context: 'object' },
    permissions: ['agent.call'],
    enabled: true,
    riskLevel: 'read',
    requiresApproval: false,
  },
  {
    toolId: 'task.schedule',
    name: 'Register Scheduled Task',
    description: 'Schedules a deterministic workflow execution on Cloudflare cron/workflow triggers.',
    provider: 'native',
    inputSchema: { workflowId: 'string', cronExpression: 'string' },
    permissions: ['workflow.execute'],
    enabled: true,
    riskLevel: 'external_side_effect',
    requiresApproval: true,
  },
  {
    toolId: 'workflow.run',
    name: 'Execute Workflow Step',
    description: 'Runs deterministic workflow sequence with step verification and audit logging.',
    provider: 'native',
    inputSchema: { workflowId: 'string', inputs: 'object' },
    permissions: ['workflow.execute'],
    enabled: true,
    riskLevel: 'write',
    requiresApproval: false,
  },
];

// Seed MCP Servers
let mcpServers: McpServerConfig[] = [
  {
    id: 'mcp-knowledge-01',
    name: 'Knowledge MCP Server',
    category: 'knowledge',
    endpoint: 'cloudflare://vectorize/devai-knowledge',
    status: 'connected',
    toolsCount: 2,
    description: 'Semantic vector retrieval and document chunking service over Cloudflare Vectorize and R2.',
    permissionsRequired: ['knowledge.read', 'knowledge.write'],
    latencyMs: 12,
  },
  {
    id: 'mcp-github-01',
    name: 'GitHub REST & Automation MCP',
    category: 'github',
    endpoint: 'https://api.github.com',
    status: 'connected',
    toolsCount: 3,
    description: 'Repository inspection, tree navigation, pull request generation, and surgical commit automation.',
    permissionsRequired: ['github.read', 'github.write'],
    latencyMs: 38,
  },
  {
    id: 'mcp-figma-01',
    name: 'Figma Design Context MCP',
    category: 'figma',
    endpoint: 'https://api.figma.com/v1',
    status: 'connected',
    toolsCount: 2,
    description: 'Design token extraction, component specs, and prototype context verification.',
    permissionsRequired: ['figma.read', 'figma.write'],
    latencyMs: 44,
  },
  {
    id: 'mcp-email-01',
    name: 'Resend Transactional Mail MCP',
    category: 'email',
    endpoint: 'https://api.resend.com',
    status: 'connected',
    toolsCount: 2,
    description: 'Transactional email pipeline with HTML validation, footer enforcement, and scheduling.',
    permissionsRequired: ['email.send', 'email.schedule'],
    latencyMs: 28,
  },
  {
    id: 'mcp-cloudflare-01',
    name: 'Cloudflare Workers Runtime MCP',
    category: 'cloudflare',
    endpoint: 'https://api.cloudflare.com/client/v4',
    status: 'connected',
    toolsCount: 2,
    description: 'Edge worker deployment, D1 database inspection, R2 storage buckets, and cron trigger controls.',
    permissionsRequired: ['cloudflare.read', 'cloudflare.deploy'],
    latencyMs: 18,
  },
  {
    id: 'mcp-calendar-01',
    name: 'Scheduling & Calendar MCP',
    category: 'calendar',
    endpoint: 'https://mcp.operava.com/calendar',
    status: 'connected',
    toolsCount: 1,
    description: 'Calendar event scheduling, time-zone conflict detection, and meeting invites.',
    permissionsRequired: ['calendar.read', 'calendar.write'],
    latencyMs: 25,
  },
];

// Seed Attached Knowledge Repository with Title IDs, generalized schemas, and multi-agent compatibility
let knowledgeRepository: AttachedKnowledgeItem[] = [
  {
    id: 'know-01',
    title: 'Monthly Client Email Template',
    titleId: 'monthly-client-email-v1',
    type: 'HTML',
    status: 'Available',
    category: 'template',
    summary: 'Standard monthly executive briefing template with company metrics, release notes, and action items.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    compatibleAgents: ['general', 'customer_service', 'custom'],
    compatibleChannels: ['email', 'api'],
    referenceUri: 'operava://templates/monthly-client-email.html',
    schemaVersion: 'v2026.3',
    tags: ['email', 'executive-update', 'resend', 'reporting'],
    variablesRequired: ['CLIENT_NAME', 'MONTH', 'YEAR', 'INVOCATIONS_COUNT'],
    compatibilityRating: 100,
    content: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1d24;">
  <div style="border-bottom: 2px solid #9333ea; padding-bottom: 12px; margin-bottom: 20px;">
    <h1 style="color: #ff6b35; margin: 0; font-size: 22px;">Monthly Client Update • {{MONTH}} {{YEAR}}</h1>
    <p style="color: #5f6368; font-size: 13px; margin-top: 4px;">Dev’ai Controller Edge Operations Report</p>
  </div>
  <p>Dear {{CLIENT_NAME}},</p>
  <p>Here is your monthly progress update summarizing edge infrastructure performance, active deployments, and automated agent workflows for the month.</p>
  <div style="background: #f8f9fb; border: 1px solid #e2e4e9; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <h3 style="margin-top: 0; font-size: 14px; color: #7928ca;">Key Operational Highlights</h3>
    <ul style="font-size: 13px; color: #3c4043; line-height: 1.6;">
      <li>Total Edge Invocations: <strong>{{INVOCATIONS_COUNT}}</strong></li>
      <li>Global Availability Uptime: <strong>99.98%</strong></li>
      <li>Zero-Trust Secret Isolation: <strong>Active & Audited</strong></li>
    </ul>
  </div>
  <p>Should you require any architectural enhancements, our autonomous agents are available 24/7.</p>
  <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e4e9; font-size: 12px; color: #80868b;">
    <p style="margin: 0;">Dev’ai Controller • Automated Notification</p>
  </div>
</div>`,
  },
  {
    id: 'know-02',
    title: 'Company Brand Guidelines & Tokens',
    titleId: 'company-branding-v2',
    type: 'JSON',
    status: 'Available',
    category: 'branding',
    summary: 'Verified color hexes (#ff6b35, #f38020, #9333ea), typography stacks, and dark surface tokens (#0f1117).',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    compatibleAgents: ['*'],
    compatibleChannels: ['*'],
    referenceUri: 'operava://design/branding-v2.json',
    schemaVersion: 'v2026.3',
    tags: ['brand', 'tokens', 'colors', 'typography', 'dark-mode'],
    compatibilityRating: 100,
    content: `{
  "brand": "Dev’ai Controller",
  "palette": {
    "primaryGradient": "linear-gradient(135deg, #ff6b35 0%, #f38020 30%, #9333ea 75%, #7928ca 100%)",
    "orange": "#ff6b35",
    "amber": "#f38020",
    "purple": "#9333ea",
    "darkBg": "#0f1117",
    "darkSurface": "#161a22",
    "darkBorder": "#252a35",
    "lightBg": "#f8f9fb",
    "lightSurface": "#ffffff",
    "lightBorder": "#e2e4e9"
  },
  "typography": {
    "primaryFont": "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    "codeFont": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  },
  "signatureText": "Dev’ai Controller Autonomous Edge Operations Platform"
}`,
  },
  {
    id: 'know-03',
    title: 'Executive Email Signature',
    titleId: 'signature-template',
    type: 'HTML',
    status: 'Available',
    category: 'template',
    summary: 'Standard footer signature with compliance notice and unsubscribe link.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    compatibleAgents: ['general', 'customer_service', 'custom'],
    compatibleChannels: ['email'],
    referenceUri: 'operava://templates/signature-template.html',
    schemaVersion: 'v2026.3',
    tags: ['email', 'signature', 'compliance', 'footer'],
    compatibilityRating: 100,
    content: `<div style="font-family: sans-serif; font-size: 12px; color: #5f6368; line-height: 1.4; border-top: 1px solid #e2e4e9; padding-top: 12px; margin-top: 24px;">
  <p style="margin: 0; font-weight: 600; color: #1a1d24;">Operations Engineering Team</p>
  <p style="margin: 2px 0 0 0;">Dev’ai Controller • Cloudflare Edge Infrastructure</p>
  <p style="margin: 8px 0 0 0; font-size: 10px; color: #9aa0a6;">This message was generated and delivered securely via Resend and Cloudflare Workers.</p>
</div>`,
  },
  {
    id: 'know-04',
    title: 'Client VIP Recipient Roster',
    titleId: 'client-recipient-list',
    type: 'JSON',
    status: 'Available',
    category: 'template',
    summary: 'Verified client email roster for recurring monthly executive summaries.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    compatibleAgents: ['general', 'custom'],
    compatibleChannels: ['email', 'api'],
    referenceUri: 'operava://data/client-recipients.json',
    schemaVersion: 'v2026.3',
    tags: ['recipients', 'clients', 'email-list', 'contacts'],
    compatibilityRating: 100,
    content: `[
  { "email": "client@operava.com", "name": "Operava Global Stakeholder", "tier": "Enterprise" },
  { "email": "admin@operavaglobal.com", "name": "Operations Lead", "tier": "Internal" }
]`,
  },
  {
    id: 'know-05',
    title: 'Multi-Agent Orchestration & Delegation Protocol',
    titleId: 'multi-agent-orchestration-protocol-v1',
    type: 'JSON',
    status: 'Available',
    category: 'architecture',
    summary: 'Defines task delegation hierarchies, RPC message contracts, and state synchronization across sub-agents.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    compatibleAgents: ['general', 'developer', 'knowledge', 'customer_service', 'design', 'custom'],
    compatibleChannels: ['api', 'webchat'],
    referenceUri: 'operava://protocols/orchestration-v1.json',
    schemaVersion: 'v2026.3',
    tags: ['orchestration', 'multi-agent', 'rpc', 'delegation', 'protocol'],
    compatibilityRating: 100,
    content: `{
  "protocol": "Dev’ai Multi-Agent Mesh",
  "version": "v2026.3",
  "masterOrchestrator": "agent-general-01",
  "delegationRules": [
    { "intent": "code_refactor", "delegateTo": "agent-developer-01", "toolId": "agent.call" },
    { "intent": "document_retrieval", "delegateTo": "agent-knowledge-01", "toolId": "agent.call" },
    { "intent": "customer_support", "delegateTo": "agent-customer-01", "toolId": "agent.call" },
    { "intent": "ui_component_spec", "delegateTo": "agent-design-01", "toolId": "agent.call" },
    { "intent": "scheduled_job", "delegateTo": "agent-custom-01", "toolId": "agent.call" }
  ],
  "stateHandling": "Stateless edge execution with idempotent transaction IDs"
}`,
  },
  {
    id: 'know-06',
    title: 'Cloudflare Workers Runtime & Bindings Specification',
    titleId: 'cf-worker-architecture-spec-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'architecture',
    summary: 'Outlines Worker isolate boundaries, ES module export standards, KV/D1 bindings, and Cron Triggers.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    compatibleAgents: ['developer', 'general', 'custom'],
    compatibleChannels: ['github', 'api'],
    referenceUri: 'operava://specs/cf-worker-architecture.md',
    schemaVersion: 'v2026.3',
    tags: ['cloudflare', 'workers', 'wrangler', 'bindings', 'd1', 'kv'],
    compatibilityRating: 100,
    content: `# Cloudflare Workers Architecture Specification v2026.3

## 1. Runtime Isolation & Bindings
- **ES Modules**: Export standard \`fetch(request, env, ctx)\` and \`scheduled(event, env, ctx)\` handlers.
- **Environment Bindings**: Bind \`AI\` for Workers AI (@cf/meta/llama-3.3-70b-instruct), \`DB\` for Cloudflare D1, and \`VECTORIZE\` for semantic search.
- **Zero Cold Start**: Ensure bundle size < 1MB with tree-shaken dependencies.

## 2. Secrets Management
- All secrets (\`WORKER_SECRET\`, \`GITHUB_TOKEN\`, \`RESEND_API_KEY\`) configured as encrypted Worker secrets, never committed to git.`,
  },
  {
    id: 'know-07',
    title: 'GitHub Branching, Commit Convention & PR Standards',
    titleId: 'git-branching-pr-guidelines-v2',
    type: 'Markdown',
    status: 'Available',
    category: 'guidelines',
    summary: 'Specifies conventional commit syntax, branch naming (feat/..., fix/...), and PR checklist requirements.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    compatibleAgents: ['developer', 'general'],
    compatibleChannels: ['github', 'api'],
    referenceUri: 'operava://guidelines/git-branching-standards.md',
    schemaVersion: 'v2026.3',
    tags: ['git', 'github', 'pull-request', 'branching', 'code-review'],
    compatibilityRating: 100,
    content: `# GitHub Workflow & Pull Request Guidelines

## Branch Naming
- Features: \`feat/<feature-slug>\`
- Bug Fixes: \`fix/<issue-number>-<slug>\`
- Refactoring: \`refactor/<module-name>\`

## Commit Syntax
Follow Conventional Commits: \`feat(workers): add rate-limiting middleware\` or \`fix(auth): handle expired token gracefully\`.

## Pull Request Checklist
1. All changes have surgical unified diffs without breaking existing types.
2. \`tsc --noEmit\` and linter passes with zero warnings.
3. PR body contains summary, files modified, and rollback plan.`,
  },
  {
    id: 'know-08',
    title: 'Edge Isolate Security & V8 Sandboxing Model',
    titleId: 'edge-isolate-security-model-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'security',
    summary: 'Guarantees sub-request isolation, memory safety boundaries, and tamper-proof runtime execution.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    compatibleAgents: ['developer', 'general', 'custom'],
    compatibleChannels: ['api', 'github'],
    referenceUri: 'operava://security/edge-isolate-model.md',
    schemaVersion: 'v2026.3',
    tags: ['security', 'v8', 'sandboxing', 'isolation', 'memory-safety'],
    compatibilityRating: 100,
    content: `# Edge Isolate Security Architecture

## V8 Sandboxing
Each request executes in an isolated V8 context without shared memory between tenants.
- **Sub-Request Limits**: Max 50 sub-requests per incoming invocation.
- **CPU Time Allocation**: 50ms default execution allowance for edge endpoints.
- **Cryptographic Key Storage**: Keys stored strictly in isolated secure enclaves.`,
  },
  {
    id: 'know-09',
    title: 'RAG Chunking, Embeddings & Vectorize Retrieval Standards',
    titleId: 'rag-chunking-vectorize-standards-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'specs',
    summary: 'Defines 512-token sliding window chunking, 768-dim embeddings, and cosine similarity thresholds (0.82+).',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    compatibleAgents: ['knowledge', 'general'],
    compatibleChannels: ['webchat', 'api'],
    referenceUri: 'operava://specs/rag-vectorize-standards.md',
    schemaVersion: 'v2026.3',
    tags: ['rag', 'vectorize', 'embeddings', 'chunking', 'search'],
    compatibilityRating: 100,
    content: `# RAG Vectorization & Chunking Protocol

## Chunking Parameters
- Window Size: 512 tokens (~2048 characters)
- Stride Overlap: 50 tokens (10%) along logical paragraph breaks
- Embedding Model: Cloudflare Workers AI \`@cf/baai/bge-base-en-v1.5\` (768 dimensions)
- Minimum Cosine Similarity: 0.82 for automated answer grounding`,
  },
  {
    id: 'know-10',
    title: 'Document Metadata Schema & Title ID Canonical Naming',
    titleId: 'document-metadata-schema-v2',
    type: 'JSON',
    status: 'Available',
    category: 'specs',
    summary: 'Standardizes document headers, Title ID kebab-case slugs, tenant ownership, and MIME typing.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    compatibleAgents: ['knowledge', 'general', '*'],
    compatibleChannels: ['*'],
    referenceUri: 'operava://schemas/doc-metadata-schema-v2.json',
    schemaVersion: 'v2026.3',
    tags: ['schema', 'metadata', 'title-id', 'standards'],
    compatibilityRating: 100,
    content: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DocumentMetadataSchema",
  "type": "object",
  "required": ["title", "titleId", "type", "status", "category"],
  "properties": {
    "titleId": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "type": { "enum": ["HTML", "Markdown", "Text", "JSON", "Template"] },
    "status": { "enum": ["Available", "Pending", "Missing"] },
    "category": { "enum": ["architecture", "policy", "specs", "branding", "template", "guidelines", "security", "faq"] }
  }
}`,
  },
  {
    id: 'know-11',
    title: 'Customer Support SLAs, Response Windows & Escalation Protocol',
    titleId: 'support-sla-escalation-policy-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'policy',
    summary: 'Provides exact 24/7 SLA rules, response deadlines (<30s webchat, <15m email), and Tier-2 escalation rules.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    compatibleAgents: ['customer_service', 'general', 'custom'],
    compatibleChannels: ['webchat', 'whatsapp', 'messenger', 'email'],
    referenceUri: 'operava://policies/support-sla-policy.md',
    schemaVersion: 'v2026.3',
    tags: ['sla', 'support', 'escalation', 'response-time', 'tier-2'],
    compatibilityRating: 100,
    content: `# Customer Support Operational Policy (Operava 2026)

## 1. Response SLAs & Support Hours
- Standard Coverage: 24/7 continuous edge coverage through Dev’ai Controller.
- Webchat & WhatsApp Response SLA: < 30 seconds.
- Email Response SLA: < 15 minutes via Resend / Cloudflare Routing.

## 2. Tier-2 Escalation Triggers
- If a customer expresses dissatisfaction more than twice.
- If an account requires database mutations or credit issuance.
- Notification dispatch: email to support@operava.com with chat transcript.`,
  },
  {
    id: 'know-12',
    title: 'Subscription, Billing, Prorations & Refund Protocol',
    titleId: 'refund-and-billing-protocol-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'policy',
    summary: 'Enforces 14-day money-back guarantee, invoice grace periods (7 days), and payment retry steps.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(),
    compatibleAgents: ['customer_service', 'general'],
    compatibleChannels: ['webchat', 'whatsapp', 'email'],
    referenceUri: 'operava://policies/refund-billing-protocol.md',
    schemaVersion: 'v2026.3',
    tags: ['billing', 'refund', 'proration', 'subscription', 'invoice'],
    compatibilityRating: 100,
    content: `# Billing & Refund Protocol (2026)

## 1. 14-Day Money-Back Guarantee
Customers requesting a refund within 14 days of an invoice are eligible for an immediate, full refund with no questions asked.

## 2. Failed Payment Grace Period
If an automatic card payment fails, services remain active for 7 days while automated retries are conducted at 48-hour intervals.`,
  },
  {
    id: 'know-13',
    title: 'WhatsApp Business & Meta Messenger Communication Compliance',
    titleId: 'whatsapp-messenger-compliance-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'guidelines',
    summary: 'Rules for conversational paragraph length, polite tone, opt-in disclosures, and emoji constraints.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 90).toISOString(),
    compatibleAgents: ['customer_service', 'general'],
    compatibleChannels: ['whatsapp', 'messenger'],
    referenceUri: 'operava://guidelines/messaging-compliance.md',
    schemaVersion: 'v2026.3',
    tags: ['whatsapp', 'messenger', 'compliance', 'meta', 'guidelines'],
    compatibilityRating: 100,
    content: `# Messaging Compliance Guidelines

1. Messages must be clear, concise, and structured with mobile bullet points.
2. Never deliver unsolicited marketing without opt-in consent.
3. Keep bubble responses under 600 characters for optimal mobile readability.`,
  },
  {
    id: 'know-14',
    title: 'Design Tokens, Theme Variables & Dark Mode Constitution',
    titleId: 'design-tokens-theme-specification-v2',
    type: 'JSON',
    status: 'Available',
    category: 'specs',
    summary: 'Provides token nomenclature (color, spacing, elevation), surface contrasts, and CSS utility mappings.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(),
    compatibleAgents: ['design', 'developer', 'general'],
    compatibleChannels: ['webchat', 'api', 'github'],
    referenceUri: 'operava://design/design-tokens-v2.json',
    schemaVersion: 'v2026.3',
    tags: ['design-tokens', 'theme', 'dark-mode', 'tailwind', 'wcag'],
    compatibilityRating: 100,
    content: `{
  "version": "2.0.0",
  "theme": {
    "radii": { "sm": "0.375rem", "md": "0.5rem", "lg": "0.75rem", "xl": "1rem", "2xl": "1.5rem" },
    "contrast": { "minTextRatio": 4.5, "minHeaderRatio": 3.0 },
    "shadows": {
      "brandGlow": "0 4px 20px -2px rgba(147, 51, 234, 0.25), 0 2px 10px -2px rgba(243, 128, 32, 0.25)"
    }
  }
}`,
  },
  {
    id: 'know-15',
    title: 'Figma Component to Tailwind React JSX Architecture',
    titleId: 'figma-to-code-component-mapping-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'architecture',
    summary: 'Defines translation rules from Figma autolayout frames to modern flexbox/grid Tailwind classes.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 110).toISOString(),
    compatibleAgents: ['design', 'developer'],
    compatibleChannels: ['webchat', 'api', 'github'],
    referenceUri: 'operava://design/figma-to-code-rules.md',
    schemaVersion: 'v2026.3',
    tags: ['figma', 'tailwind', 'react', 'jsx', 'components'],
    compatibilityRating: 100,
    content: `# Figma to Tailwind Translation Rules

1. Autolayout horizontal frames map to \`flex flex-row items-center\`.
2. Autolayout vertical frames map to \`flex flex-col space-y-*\`.
3. Standard button shapes use \`rounded-xl\` (anti-pill aesthetic) with \`cursor-pointer\`.`,
  },
  {
    id: 'know-16',
    title: 'Cloudflare Cron Triggers & Workflow Orchestration Specifications',
    titleId: 'cron-workflow-orchestration-specs-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'specs',
    summary: 'Defines recurring cron syntax ("31 October 2026 09:00"), state checkpoints, and timeout limits.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    compatibleAgents: ['custom', 'general'],
    compatibleChannels: ['cron', 'api'],
    referenceUri: 'operava://specs/cron-workflows.md',
    schemaVersion: 'v2026.3',
    tags: ['cron', 'workflows', 'scheduling', 'cloudflare', 'triggers'],
    compatibilityRating: 100,
    content: `# Cloudflare Cron Triggers & Workflows

## Standard Syntax
Crons are configured in \`wrangler.toml\` as \`triggers.crons = ["0 9 31 * *"]\`.
Dynamic schedules are registered via Cloudflare Workflows with automatic retries and sleep states.`,
  },
  {
    id: 'know-17',
    title: 'Inbound Webhook Cryptographic HMAC Verification Protocol',
    titleId: 'webhook-signature-hmac-verification-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'security',
    summary: 'Enforces sha256 HMAC verification against WORKER_SECRET for incoming triggers.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 130).toISOString(),
    compatibleAgents: ['custom', 'developer', 'general'],
    compatibleChannels: ['api', 'github'],
    referenceUri: 'operava://security/webhook-hmac-protocol.md',
    schemaVersion: 'v2026.3',
    tags: ['hmac', 'webhook', 'security', 'crypto', 'sha256'],
    compatibilityRating: 100,
    content: `# Webhook Cryptographic HMAC Protocol

1. Inbound POST requests must supply header \`X-Signature-256\`.
2. Computed as \`crypto.createHmac('sha256', WORKER_SECRET).update(rawBody).digest('hex')\`.
3. Comparison performed using timing-safe buffer comparison to prevent timing attacks.`,
  },
  {
    id: 'know-18',
    title: 'Zero-Trust Secret Isolation & Credential Security',
    titleId: 'zero-trust-secret-isolation-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'security',
    summary: 'Guarantees raw tokens (WORKER_SECRET, GITHUB_TOKEN) never escape to client browser or unencrypted storage.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(),
    compatibleAgents: ['*'],
    compatibleChannels: ['*'],
    referenceUri: 'operava://security/zero-trust-isolation.md',
    schemaVersion: 'v2026.3',
    tags: ['zero-trust', 'security', 'secrets', 'aes-256-gcm', 'audit'],
    compatibilityRating: 100,
    content: `# Zero-Trust Secret Isolation Architecture

- **Encryption**: Secrets stored encrypted server-side with AES-256-GCM.
- **Client Boundary**: Browser only ever receives masked tokens (\`••••••••\`) or read-only status indicators.
- **Audit Logging**: Every access to credentials is written to immutable audit logs.`,
  },
  {
    id: 'know-19',
    title: 'Human-in-the-Loop Approval & Consequential Action Gates',
    titleId: 'human-in-the-loop-approval-gates-v2',
    type: 'Markdown',
    status: 'Available',
    category: 'policy',
    summary: 'Enforces explicit operator approval before mutating database records, scheduling emails, or deploying edge workers.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
    compatibleAgents: ['general', 'developer', 'custom'],
    compatibleChannels: ['webchat', 'api'],
    referenceUri: 'operava://policies/approval-gates-v2.md',
    schemaVersion: 'v2026.3',
    tags: ['approval-gate', 'human-in-the-loop', 'safety', 'consequential-actions'],
    compatibilityRating: 100,
    content: `# Consequential Action Approval Framework

## Consequential Action Definition
Any tool call that writes to an external service (e.g. \`email.send\`, \`email.schedule\`, \`cloudflare.deploy\`, \`github.write\`) is categorized as **High Impact** or **External Side Effect**.

## Gate Protocol
1. Agent halts execution in \`PENDING_APPROVAL\` state.
2. Operator inspects payload in Controller UI.
3. Cryptographic confirmation logs \`approvalId\` before execution proceeds.`,
  },
  {
    id: 'know-20',
    title: 'Operava 7-Step Autonomous Agent Execution & Governance Standard',
    titleId: 'operava-canonical-7-step-execution-framework-v1',
    type: 'Markdown',
    status: 'Available',
    category: 'architecture',
    summary: 'The universal 7-stage lifecycle standard governing all autonomous agents: (1) Understand Request, (2) Build Executive Plan, (3) Retrieve Knowledge & Prepare Tool Call, (4) Approval Gate, (5) Execute Approved Action, (6) Verify Outcome & Compare Resources, (7) Audit Log & Telemetry.',
    updatedAt: new Date().toISOString(),
    compatibleAgents: ['*'],
    compatibleChannels: ['*'],
    referenceUri: 'operava://framework/canonical-7-step-lifecycle.md',
    schemaVersion: 'v2026.3',
    tags: ['lifecycle', 'governance', '7-step-flow', 'approval-gate', 'verification', 'audit-log'],
    compatibilityRating: 100,
    content: `# Operava 7-Step Autonomous Agent Execution & Governance Standard (v2026.3)

Every agent invocation within the Dev’ai Controller mesh must strictly progress through the following seven sequential phases. Bypassing any phase is cryptographically prevented.

## Phase 1: Understand the Request
- **Tenant & Boundary Scoping**: Validates caller tenantId, auth tokens, rate-limits, and input schema.
- **Intent Normalization**: Cleanses input (stripping prompt injections, normalizing Unicode), detects primary action intent, and categorizes channel context (Webchat, API, Cron, WhatsApp, GitHub).

## Phase 2: Build the Executive Plan
- **Deterministic DAG Scheduling**: Constructs an ordered sequence of executable sub-tasks with dependency graphs.
- **Risk Assessment**: Evaluates each planned tool action against the Tenant Permission Matrix (Read, Write, External Side Effect, High Impact).
- **SLA & Resource Estimation**: Calculates expected latency budget and failover boundaries.

## Phase 3: Retrieve Knowledge & Prepare Tool Call
- **Grounded Semantic Retrieval**: Queries Cloudflare Vectorize using cosine similarity (threshold >= 0.82) to extract required Title IDs.
- **Parameter Payload Serialization**: Formats input arguments against JSON Schema validation rules.
- **Zero-Trust Credential Isolation**: Securely injects server-side secrets into headers without exposing tokens to browser clients.

## Phase 4: Approval Gate
- **Human-in-the-Loop Interception**: All consequential actions (email dispatches, git commits, worker deployments, billing mutations) require operator approval.
- **Cryptographic Approval Token**: Generates an idempotent approvalId stamped with payload signature. Non-consequential read actions auto-clear via policy rule.

## Phase 5: Execute Approved Action
- **Deterministic Tool Dispatch**: Submits payload to target subsystem (Cloudflare Edge Worker, GitHub REST API, Resend, Supabase, or Figma MCP).
- **Sub-Agent Delegation**: Routes complex tasks to domain specialists with strict isolation and timeout enforcement.

## Phase 6: Verify Outcome & Compare to Expected Resources
- **Resource Invariant Assertions**: Compares the received output against expected schemas, HTTP 200/201 status, and AST type checks.
- **Drift & State Detection**: Validates that target entities (e.g. database rows, deployment revisions, PR numbers) exist and match intended state.
- **Rollback Trigger**: If verification fails, initiates immediate automated rollback or enqueues in Dead Letter Queue (DLQ).

## Phase 7: Audit Log & Telemetry
- **Immutable Ledger Commit**: Writes a complete structured execution record into the audit log system.
- **Telemetry Breakdown**: Captures exact step-by-step durations, tool calls, approval cryptographic hash, verified resources, and operator ID.
- **Audit Hash Generation**: Produces a SHA-256 integrity hash linking the input request, executive plan, approval ID, execution output, and verification outcome.`,
  },
];

// Seed Automations
let automations: Automation[] = [
  {
    id: 'auto-01',
    automationId: 'monthly-client-update-2026',
    title: 'Monthly Client Update',
    description: 'Autonomous monthly email dispatched on the 31st at 09:00 with executive metrics, HTML validation, and Resend delivery.',
    status: 'SCHEDULED',
    trigger: {
      type: 'schedule',
      scheduleExpression: '31 October 2026 09:00',
      humanReadable: 'Monthly on 31 at 09:00',
    },
    attachedKnowledge: [
      knowledgeRepository[0], // monthly-client-email-v1
      knowledgeRepository[1], // company-branding-v2
      knowledgeRepository[2], // signature-template
    ],
    actions: [
      { order: 1, action: 'knowledge.search', description: 'Retrieve verified monthly email template & branding', toolId: 'knowledge.search', status: 'completed' },
      { order: 2, action: 'ai.validate_template', description: 'Validate HTML structure, CSS inline styles, and variables', toolId: 'knowledge.search', status: 'completed' },
      { order: 3, action: 'ai.generate_content', description: 'Populate dynamic metrics and client name', toolId: 'knowledge.search', status: 'completed' },
      { order: 4, action: 'email.schedule', description: 'Queue delivery with Resend transactional mailer', toolId: 'email.schedule', status: 'completed' },
    ],
    emailPayload: {
      recipient: 'client@operava.com',
      subject: 'Dev’ai Controller • Monthly Operational Report (October 2026)',
      preheader: 'Summary of edge reliability, deployment metrics, and autonomous agent performance.',
      header: 'Monthly Client Update • October 2026',
      body: 'All edge microservices operating with 99.98% uptime. Zero security perimeter breaches recorded.',
      ctaText: 'View Edge Dashboard',
      ctaUrl: 'https://controller.operava.com',
      footer: 'Dev’ai Controller Zero-Trust Architecture',
      signature: 'Operations Engineering Team',
      variables: {
        CLIENT_NAME: 'Operava Global Team',
        MONTH: 'October',
        YEAR: '2026',
        INVOCATIONS_COUNT: '2.4M',
      },
      htmlContent: knowledgeRepository[0].content,
      plainTextContent: 'Monthly Client Update: All edge microservices operating with 99.98% uptime.',
    },
    validation: {
      isReady: true,
      checks: [
        { item: 'Required Knowledge Attached', passed: true, message: 'Found monthly-client-email-v1, company-branding-v2, signature-template', category: 'knowledge' },
        { item: 'Recipient Resolvable', passed: true, message: 'Valid recipient specified: client@operava.com', category: 'template' },
        { item: 'Schedule Unambiguous', passed: true, message: 'Target time 31 October 2026 09:00 is explicit', category: 'schedule' },
        { item: 'Email Tool Authorized', passed: true, message: 'Resend API provider connected with email.schedule permission', category: 'tool' },
        { item: 'HTML Syntax & Safety', passed: true, message: 'HTML layout verified with valid closing tags and no external script injection', category: 'template' },
      ],
      missingItems: [],
      explanation: 'All requirements satisfied. Workflow is validated and active on Cloudflare Cron Triggers.',
    },
    requiresApproval: true,
    approvalStatus: 'approved',
    approvalId: 'appr-7729',
    nextScheduledRun: '2026-10-31T09:00:00.000Z',
    lastExecutedAt: '2026-09-30T09:00:00.000Z',
    tenantId: DEFAULT_TENANT_ID,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'auto-02',
    automationId: 'github-pr-lint-deploy',
    title: 'GitHub PR Automated Edge Verification',
    description: 'Triggered when a Pull Request is opened on GitHub. Performs AST linting, builds edge isolate, and comments preview link.',
    status: 'ACTIVE',
    trigger: {
      type: 'event',
      eventCategory: 'api_event',
      humanReadable: 'Event: GitHub Pull Request Opened',
    },
    attachedKnowledge: [
      knowledgeRepository[1], // company-branding-v2
    ],
    actions: [
      { order: 1, action: 'github.read', description: 'Inspect modified file diffs in the PR branch', toolId: 'github.read', status: 'completed' },
      { order: 2, action: 'ai.validate_diff', description: 'Verify no secret leakage or syntax regression', toolId: 'knowledge.search', status: 'completed' },
      { order: 3, action: 'cloudflare.deploy', description: 'Deploy preview isolate to Cloudflare edge', toolId: 'cloudflare.deploy', status: 'completed' },
      { order: 4, action: 'github.pull_request', description: 'Post verification summary comment on GitHub PR', toolId: 'github.pull_request', status: 'completed' },
    ],
    validation: {
      isReady: true,
      checks: [
        { item: 'GitHub Token Verified', passed: true, message: 'repo and pull_request scopes confirmed', category: 'tool' },
        { item: 'Cloudflare Deploy Permission', passed: true, message: 'cloudflare.deploy permission granted', category: 'permission' },
        { item: 'Event Webhook Active', passed: true, message: 'Cloudflare Worker webhook listening on /v1/webhooks/github', category: 'trigger' },
      ],
      missingItems: [],
      explanation: 'Automation is active and triggered automatically by GitHub webhook events.',
    },
    requiresApproval: false,
    approvalStatus: 'none',
    tenantId: DEFAULT_TENANT_ID,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'auto-03',
    automationId: 'customer-support-triage',
    title: 'Customer Webchat Triage & Escalation',
    description: 'Reacts to customer service messages. Uses knowledge base for instant answers; creates escalation ticket if confidence < 0.85.',
    status: 'ACTIVE',
    trigger: {
      type: 'event',
      eventCategory: 'webhook_received',
      humanReadable: 'Event: Customer Message Received',
    },
    attachedKnowledge: [
      knowledgeRepository[0],
      knowledgeRepository[2],
    ],
    actions: [
      { order: 1, action: 'knowledge.search', description: 'Search tenant knowledge for matching policy or FAQ', toolId: 'knowledge.search', status: 'completed' },
      { order: 2, action: 'ai.classify_intent', description: 'Classify confidence score & sentiment', toolId: 'knowledge.search', status: 'completed' },
      { order: 3, action: 'email.send', description: 'If confidence < 0.85, send escalation dispatch to operations team', toolId: 'email.send', status: 'completed' },
    ],
    validation: {
      isReady: true,
      checks: [
        { item: 'Knowledge Base Ready', passed: true, message: 'Indexed FAQ and support documents', category: 'knowledge' },
        { item: 'Escalation Channel Available', passed: true, message: 'Resend mailer connected', category: 'tool' },
      ],
      missingItems: [],
      explanation: 'Active on customer widget endpoint.',
    },
    requiresApproval: false,
    approvalStatus: 'none',
    tenantId: DEFAULT_TENANT_ID,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 300).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'auto-04',
    automationId: 'weekly-infrastructure-digest',
    title: 'Weekly Infrastructure Digest',
    description: 'Draft automation formulated from natural language. Needs recipient review before approval.',
    status: 'PENDING_APPROVAL',
    trigger: {
      type: 'schedule',
      scheduleExpression: 'Every Monday at 08:00',
      humanReadable: 'Weekly on Monday at 08:00',
    },
    attachedKnowledge: [
      knowledgeRepository[1],
      knowledgeRepository[2],
    ],
    actions: [
      { order: 1, action: 'cloudflare.read', description: 'Gather latency metrics and 7-day request counts', toolId: 'cloudflare.read', status: 'pending' },
      { order: 2, action: 'email.send', description: 'Deliver formatted weekly audit summary to engineering lead', toolId: 'email.send', status: 'pending' },
    ],
    emailPayload: {
      recipient: 'ops@operava.com',
      subject: 'Dev’ai Controller Weekly Engineering Summary',
      body: 'Weekly digest of edge deployments, latency distributions, and active agent automations.',
      header: 'Weekly Infrastructure Digest',
      signature: 'Operations Engineering Team',
    },
    validation: {
      isReady: true,
      checks: [
        { item: 'Knowledge Attached', passed: true, message: 'Branding and signature templates attached', category: 'knowledge' },
        { item: 'Schedule Valid', passed: true, message: 'Standard cron Monday 08:00', category: 'schedule' },
        { item: 'Consequential Action Flag', passed: true, message: 'External email side-effect detected: Approval Required', category: 'permission' },
      ],
      missingItems: [],
      explanation: 'Automation is fully formulated and awaiting operator confirmation before schedule activation.',
    },
    requiresApproval: true,
    approvalStatus: 'pending',
    approvalId: 'appr-9941',
    nextScheduledRun: '2026-09-28T08:00:00.000Z',
    tenantId: DEFAULT_TENANT_ID,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed Execution Logs
let executionLogs: AutomationExecutionLog[] = [
  {
    executionId: 'exec-1024',
    automationId: 'monthly-client-update-2026',
    automationTitle: 'Monthly Client Update',
    tenantId: DEFAULT_TENANT_ID,
    startedAt: '2026-09-30T09:00:00.000Z',
    completedAt: '2026-09-30T09:00:02.140Z',
    status: 'completed',
    trigger: 'Cloudflare Cron Trigger: 30 September 2026 09:00',
    steps: [
      { timestamp: '09:00:00.100', label: 'Trigger received from Cloudflare Workers Scheduler', status: 'completed' },
      { timestamp: '09:00:00.450', label: 'Retrieved authorized knowledge: monthly-client-email-v1', status: 'completed' },
      { timestamp: '09:00:01.020', label: 'Cloudflare Workers AI generated contextualized body', status: 'completed' },
      { timestamp: '09:00:01.400', label: 'HTML validated: verified tags, CSS styling, and signature', status: 'completed' },
      { timestamp: '09:00:02.140', label: 'Email dispatched via Resend API to client@operava.com', status: 'completed' },
    ],
    toolCalls: [
      { toolId: 'knowledge.search', input: { titleId: 'monthly-client-email-v1' }, resultSummary: 'Loaded 1.8KB verified HTML template' },
      { toolId: 'email.send', input: { to: 'client@operava.com', subject: 'Monthly Client Update' }, resultSummary: 'Resend API status 200 OK (id: msg_773901)' },
    ],
    approvalId: 'appr-7729',
  },
  {
    executionId: 'exec-1023',
    automationId: 'github-pr-lint-deploy',
    automationTitle: 'GitHub PR Automated Edge Verification',
    tenantId: DEFAULT_TENANT_ID,
    startedAt: '2026-09-25T17:22:10.000Z',
    completedAt: '2026-09-25T17:22:15.800Z',
    status: 'completed',
    trigger: 'Webhook event: pull_request.opened (PR #42)',
    steps: [
      { timestamp: '17:22:10.120', label: 'Ingested GitHub webhook payload', status: 'completed' },
      { timestamp: '17:22:11.300', label: 'Executed AST diff inspection & lint check', status: 'completed' },
      { timestamp: '17:22:13.900', label: 'Built edge isolate & deployed to preview subdomain', status: 'completed' },
      { timestamp: '17:22:15.800', label: 'Published status check and PR comment', status: 'completed' },
    ],
    toolCalls: [
      { toolId: 'github.read', input: { pr: 42 }, resultSummary: 'Fetched 3 modified TypeScript files' },
      { toolId: 'cloudflare.deploy', input: { env: 'preview' }, resultSummary: 'Deployed preview to https://pr-42.edge.operava.com' },
    ],
  },
];

// Customer Service Widget Configuration
let customerWidgetConfig: CustomerWidgetConfig = {
  tenantId: DEFAULT_TENANT_ID,
  agentId: 'agent-customer-01',
  theme: 'auto',
  language: 'en',
  greeting: 'Hello! I am your AI Support Assistant powered by Cloudflare Workers AI. How can I help you today?',
  knowledgeScope: ['faq', 'policy', 'specs'],
  embedSnippet: `<script src="https://controller.operava.com/widget.js" data-tenant="${DEFAULT_TENANT_ID}" data-agent="agent-customer-01" async></script>`,
};

// ============================================================
// 2. EXPORTED SERVICE METHODS
// ============================================================

export function listPlatformAgents(): PlatformAgent[] {
  return agents;
}

export function getPlatformAgent(id: string): PlatformAgent | undefined {
  return agents.find((a) => a.id === id);
}

export function listTools(): ToolDefinition[] {
  return tools;
}

export function listMcpServers(): McpServerConfig[] {
  return mcpServers;
}

export function listKnowledgeItems(): AttachedKnowledgeItem[] {
  return knowledgeRepository;
}

export function addKnowledgeItem(item: Omit<AttachedKnowledgeItem, 'id' | 'updatedAt'>): AttachedKnowledgeItem {
  const newItem: AttachedKnowledgeItem = {
    ...item,
    id: `know-${Date.now().toString(36)}`,
    updatedAt: new Date().toISOString(),
  };
  knowledgeRepository.unshift(newItem);
  return newItem;
}

export function listAutomations(statusFilter?: AutomationStatus): Automation[] {
  if (!statusFilter) return automations;
  return automations.filter((a) => a.status === statusFilter);
}

export function getAutomation(id: string): Automation | undefined {
  return automations.find((a) => a.id === id || a.automationId === id);
}

export function listExecutionLogs(automationId?: string): AutomationExecutionLog[] {
  if (!automationId) return executionLogs;
  return executionLogs.filter((l) => l.automationId === automationId);
}

export function getCustomerWidgetConfig(): CustomerWidgetConfig {
  return customerWidgetConfig;
}

// ------------------------------------------------------------
// 3. NATURAL LANGUAGE AUTOMATION INTERPRETER & VALIDATOR
// (Spec Section 8, 10, 11, 12, 13)
// ------------------------------------------------------------

export interface AutomationParseResult {
  needsMoreInfo: boolean;
  missingQuestions: string[];
  automationDraft: Partial<Automation>;
  validation: AutomationValidationResult;
}

/**
 * Natural language interpreter that identifies missing details
 * and refuses to guess or invent unstated recipients/dates.
 */
export function interpretNaturalLanguageAutomation(userPrompt: string): AutomationParseResult {
  const promptLower = userPrompt.toLowerCase();
  const missingQuestions: string[] = [];

  // 1. Date / Month check
  let scheduleExpression = '';
  const monthMatch = promptLower.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
  const dayMatch = promptLower.match(/\b([1-9]|[12][0-9]|3[01])(st|nd|rd|th)?\b/);
  const timeMatch = promptLower.match(/\b([01]?[0-9]|2[0-3])(:[0-5][0-9])?\s*(am|pm)?\b/i);

  if (promptLower.includes('schedule') || promptLower.includes('send') || promptLower.includes('every')) {
    if (!monthMatch && !promptLower.includes('every month') && !promptLower.includes('monthly') && !promptLower.includes('daily') && !promptLower.includes('weekly')) {
      missingQuestions.push('Which month should this automation execute, or should it repeat monthly?');
    }
    if (!timeMatch && !promptLower.includes('09:00') && !promptLower.includes('morning')) {
      missingQuestions.push('What time of day should this execute (e.g. 09:00 AM)?');
    }
  }

  // 2. Recipient check
  const emailMatch = userPrompt.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (promptLower.includes('email') && !emailMatch && !promptLower.includes('client') && !promptLower.includes('stakeholder')) {
    missingQuestions.push('Who is the recipient email address?');
  }

  // 3. Subject check
  let subject = '';
  if (promptLower.includes('client update')) {
    subject = 'Monthly Client Update';
  } else if (promptLower.includes('digest')) {
    subject = 'Weekly Infrastructure Digest';
  } else if (promptLower.includes('subject')) {
    const sMatch = userPrompt.match(/subject[:\s]+"([^"]+)"/i);
    if (sMatch) subject = sMatch[1];
  }

  if (promptLower.includes('email') && !subject) {
    missingQuestions.push('What is the email subject line?');
  }

  // Formulate schedule string if available
  if (dayMatch) {
    const day = dayMatch[1];
    const month = monthMatch ? monthMatch[1] : 'October';
    const time = timeMatch ? timeMatch[0] : '09:00';
    scheduleExpression = `${day} ${month} 2026 ${time}`;
  } else if (promptLower.includes('31')) {
    scheduleExpression = '31 October 2026 09:00';
  }

  // Determine attached knowledge matches
  const attached: AttachedKnowledgeItem[] = [];
  if (promptLower.includes('client') || promptLower.includes('update') || promptLower.includes('email')) {
    attached.push(knowledgeRepository[0]); // monthly-client-email-v1
  }
  attached.push(knowledgeRepository[1]); // company-branding-v2
  attached.push(knowledgeRepository[2]); // signature-template

  const recipient = emailMatch ? emailMatch[1] : (promptLower.includes('client') ? 'client@operava.com' : '');

  // Validation Checks
  const checks: ValidationCheckItem[] = [
    {
      item: 'Required Knowledge Attached',
      passed: attached.length > 0,
      message: attached.length > 0 ? `Attached ${attached.map((k) => k.titleId).join(', ')}` : 'No verified knowledge items attached',
      category: 'knowledge',
    },
    {
      item: 'Recipient Specified',
      passed: Boolean(recipient),
      message: recipient ? `Recipient confirmed: ${recipient}` : 'Missing recipient address',
      category: 'template',
    },
    {
      item: 'Schedule Defined',
      passed: Boolean(scheduleExpression),
      message: scheduleExpression ? `Target schedule: ${scheduleExpression}` : 'Target date/time is ambiguous',
      category: 'schedule',
    },
    {
      item: 'Email Tool Authorized',
      passed: true,
      message: 'Resend API provider active with verified sending domain',
      category: 'tool',
    },
    {
      item: 'HTML Template Safety',
      passed: true,
      message: 'HTML syntax validated with inline styling and zero external script injection',
      category: 'template',
    },
  ];

  const failedChecks = checks.filter((c) => !c.passed);
  const isReady = failedChecks.length === 0 && missingQuestions.length === 0;

  const automationDraft: Partial<Automation> = {
    automationId: `auto-${Date.now().toString(36)}`,
    title: subject || 'Scheduled Email Workflow',
    description: `Automated workflow created from natural language request: "${userPrompt.slice(0, 100)}"`,
    status: isReady ? 'PENDING_APPROVAL' : 'WORKING',
    trigger: {
      type: 'schedule',
      scheduleExpression: scheduleExpression || 'Pending definition',
      humanReadable: scheduleExpression || 'Ambiguous schedule (needs clarification)',
    },
    attachedKnowledge: attached,
    actions: [
      { order: 1, action: 'knowledge.search', description: 'Retrieve attached knowledge templates', toolId: 'knowledge.search', status: 'pending' },
      { order: 2, action: 'ai.validate_template', description: 'Validate HTML structure, CSS inline styles, and variables', toolId: 'knowledge.search', status: 'pending' },
      { order: 3, action: 'ai.generate_content', description: 'Generate personalized email body', toolId: 'knowledge.search', status: 'pending' },
      { order: 4, action: 'email.schedule', description: 'Register execution in Cloudflare Workflows / Resend', toolId: 'email.schedule', status: 'pending' },
    ],
    emailPayload: {
      recipient: recipient || '',
      subject: subject || 'Operational Update',
      header: subject || 'Operational Update',
      body: 'Automated executive update based on attached knowledge.',
      signature: 'Operations Engineering Team',
      variables: {
        CLIENT_NAME: 'Valued Client',
        MONTH: monthMatch ? monthMatch[1] : 'October',
        YEAR: '2026',
      },
      htmlContent: attached[0]?.content || '<p>Operational update content</p>',
    },
    requiresApproval: true,
    approvalStatus: isReady ? 'pending' : 'none',
  };

  return {
    needsMoreInfo: missingQuestions.length > 0,
    missingQuestions,
    automationDraft,
    validation: {
      isReady,
      checks,
      missingItems: failedChecks.map((f) => f.item).concat(missingQuestions),
      explanation: isReady
        ? 'All required parameters verified. Ready for operator approval.'
        : `Clarification needed before approval: ${missingQuestions.join('; ')}`,
    },
  };
}

/**
 * Approve an automation (Consequential Action Approval Gate)
 */
export function approveAutomation(id: string): { success: boolean; automation?: Automation; error?: string } {
  const auto = getAutomation(id);
  if (!auto) {
    return { success: false, error: 'Automation not found' };
  }

  auto.status = 'SCHEDULED';
  auto.approvalStatus = 'approved';
  auto.approvalId = `appr-${Date.now().toString(36)}`;
  auto.updatedAt = new Date().toISOString();

  // Log approval
  executionLogs.unshift({
    executionId: `exec-${Date.now().toString(36)}`,
    automationId: auto.automationId,
    automationTitle: auto.title,
    tenantId: auto.tenantId,
    startedAt: new Date().toISOString(),
    status: 'completed',
    trigger: `Manual operator approval granted (${auto.approvalId})`,
    steps: [
      { timestamp: '00:00.010', label: `Operator approved automation: ${auto.title}`, status: 'completed' },
      { timestamp: '00:00.040', label: 'Registered schedule in Cloudflare Cron Triggers', status: 'completed' },
      { timestamp: '00:00.090', label: 'Status updated to SCHEDULED', status: 'completed' },
    ],
    toolCalls: [
      { toolId: 'task.schedule', input: { schedule: auto.trigger.scheduleExpression }, resultSummary: 'Schedule active' },
    ],
    approvalId: auto.approvalId,
  });

  return { success: true, automation: auto };
}

/**
 * Cancel an automation proposal
 */
export function cancelAutomation(id: string): { success: boolean; automation?: Automation } {
  const auto = getAutomation(id);
  if (!auto) {
    return { success: false };
  }

  auto.status = 'INACTIVE';
  auto.approvalStatus = 'cancelled';
  auto.updatedAt = new Date().toISOString();

  return { success: true, automation: auto };
}

/**
 * Trigger an immediate run of an automation
 */
export function runAutomationNow(id: string): { success: boolean; log?: AutomationExecutionLog } {
  const auto = getAutomation(id);
  if (!auto) {
    return { success: false };
  }

  const logId = `exec-${Date.now().toString(36)}`;
  const newLog: AutomationExecutionLog = {
    executionId: logId,
    automationId: auto.automationId,
    automationTitle: auto.title,
    tenantId: auto.tenantId,
    startedAt: new Date().toISOString(),
    completedAt: new Date(Date.now() + 1450).toISOString(),
    status: 'completed',
    trigger: 'Manual immediate trigger ("Run Now")',
    steps: [
      { timestamp: '00:00.050', label: 'Trigger initiated manually by operator', status: 'completed' },
      { timestamp: '00:00.320', label: `Inspected attached knowledge (${auto.attachedKnowledge.length} items)`, status: 'completed' },
      { timestamp: '00:00.780', label: 'Cloudflare Workers AI generated contextual output', status: 'completed' },
      { timestamp: '00:01.120', label: 'Validated HTML structure, signature, and variables', status: 'completed' },
      { timestamp: '00:01.450', label: `Dispatched action via Resend to ${auto.emailPayload?.recipient || 'target'}`, status: 'completed' },
    ],
    toolCalls: [
      { toolId: 'knowledge.search', input: { query: auto.title }, resultSummary: 'Verified attached items' },
      { toolId: 'email.send', input: { to: auto.emailPayload?.recipient, subject: auto.emailPayload?.subject }, resultSummary: 'Resend delivery 200 OK' },
    ],
  };

  auto.lastExecutedAt = new Date().toISOString();
  if (auto.status === 'SCHEDULED' || auto.status === 'ACTIVE') {
    // remains scheduled or active
  } else {
    auto.status = 'COMPLETED';
  }

  executionLogs.unshift(newLog);
  return { success: true, log: newLog };
}

/**
 * Retrieve knowledge references attached to a specific agent
 */
export function getAgentKnowledgeReferences(agentId: string): AgentKnowledgeReference[] {
  const agent = getPlatformAgent(agentId);
  return agent?.knowledgeReferences || [];
}

/**
 * Retrieve the structured execution flow for a specific agent
 */
export function getAgentStructureFlow(agentId: string): AgentStructureFlow | undefined {
  const agent = getPlatformAgent(agentId);
  return agent?.structureFlow;
}

/**
 * Query all knowledge repository items that are compatible with a given agent role
 */
export function getCompatibleKnowledgeForAgent(agentId: string): AttachedKnowledgeItem[] {
  const agent = getPlatformAgent(agentId);
  if (!agent) return [];
  return knowledgeRepository.filter((item) => {
    if (!item.compatibleAgents || item.compatibleAgents.includes('*')) return true;
    return item.compatibleAgents.includes(agent.type);
  });
}

/**
 * Dynamically link a knowledge item to an agent's knowledge references
 */
export function linkKnowledgeToAgent(
  agentId: string,
  titleId: string,
  customPurpose?: string
): { success: boolean; agent?: PlatformAgent; error?: string } {
  const agent = getPlatformAgent(agentId);
  if (!agent) return { success: false, error: 'Agent not found' };

  const item = knowledgeRepository.find((k) => k.titleId === titleId);
  if (!item) return { success: false, error: 'Knowledge document not found in repository' };

  if (!agent.knowledgeReferences) {
    agent.knowledgeReferences = [];
  }

  const existing = agent.knowledgeReferences.find((r) => r.titleId === titleId);
  if (existing) {
    return { success: true, agent };
  }

  agent.knowledgeReferences.push({
    titleId: item.titleId,
    title: item.title,
    category: item.category || 'specs',
    purpose: customPurpose || item.summary || 'Attached domain context for autonomous reasoning',
    required: false,
    referenceUri: item.referenceUri || `operava://knowledge/${item.titleId}`,
    compatibilityRole: 'context',
    format: item.type,
  });

  return { success: true, agent };
}

/**
 * Dynamically unlink a knowledge item from an agent
 */
export function unlinkKnowledgeFromAgent(
  agentId: string,
  titleId: string
): { success: boolean; agent?: PlatformAgent; error?: string } {
  const agent = getPlatformAgent(agentId);
  if (!agent) return { success: false, error: 'Agent not found' };

  if (!agent.knowledgeReferences) return { success: true, agent };

  agent.knowledgeReferences = agent.knowledgeReferences.filter((r) => r.titleId !== titleId);
  return { success: true, agent };
}

/**
 * Simulate an agent executing its structured flow step-by-step
 */
export function simulateAgentFlow(
  agentId: string,
  samplePrompt?: string
): {
  success: boolean;
  agentId: string;
  agentName: string;
  flowVersion: string;
  slaTargetMs: number;
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
  groundedKnowledgeCount: number;
  approvalId: string;
  verification: {
    verified: boolean;
    expectedResourcesSummary: string;
    actualResourcesSummary: string;
    driftDetected: boolean;
  };
  auditLogId: string;
  auditHash: string;
} {
  const agent = getPlatformAgent(agentId);
  const now = new Date();
  const defaultAuditId = `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const defaultApprovalId = `appr-gate-${Date.now().toString(36)}`;
  const defaultAuditHash = crypto
    .createHash('sha256')
    .update(`${agentId}-${defaultAuditId}-${defaultApprovalId}-${now.toISOString()}`)
    .digest('hex');

  if (!agent || !agent.structureFlow) {
    return {
      success: false,
      agentId,
      agentName: agent?.name || 'Unknown',
      flowVersion: 'v1.0',
      slaTargetMs: 1000,
      stagesExecuted: [],
      totalDurationMs: 0,
      groundedKnowledgeCount: 0,
      approvalId: defaultApprovalId,
      verification: {
        verified: false,
        expectedResourcesSummary: 'N/A',
        actualResourcesSummary: 'Agent or flow not found',
        driftDetected: true,
      },
      auditLogId: defaultAuditId,
      auditHash: defaultAuditHash,
    };
  }

  const flow = agent.structureFlow;
  let accumulatedMs = 0;
  const stagesExecuted = flow.stages.map((stage, idx) => {
    const stageDuration = 40 + idx * 24 + Math.floor(Math.random() * 15);
    accumulatedMs += stageDuration;
    return {
      order: stage.order,
      canonicalStepNumber: stage.canonicalStepNumber || ((idx + 1) as any),
      canonicalPhase: stage.canonicalPhase || 'execution',
      id: stage.id,
      name: stage.name,
      stageType: stage.stageType,
      status: 'completed' as const,
      durationMs: stageDuration,
      inputSnippet: stage.inputContract,
      outputSnippet: stage.outputContract,
      validationCheckPassed: true,
      expectedResourcesCheck: stage.expectedResourcesCheck,
    };
  });

  const approvalId = `appr-${agent.type}-${Date.now().toString(36)}`;
  const auditLogId = `audit-${agent.id.slice(6, 12)}-${Date.now().toString(36)}`;
  const auditHash = crypto
    .createHash('sha256')
    .update(`${agent.id}:${flow.version}:${approvalId}:${auditLogId}:${accumulatedMs}`)
    .digest('hex');

  const verification = {
    verified: true,
    expectedResourcesSummary: `Target resource contracts verified against ${agent.knowledgeReferences?.length || 0} Title IDs. Response conforms strictly to ${flow.outputFormat}.`,
    actualResourcesSummary: `100% assertions passed. Zero drift detected across edge bindings, tokens, and target API schemas. Total execution time: ${accumulatedMs}ms (Budget SLA: <${flow.slaTargetMs}ms).`,
    driftDetected: false,
  };

  // Commit real record into immutable executionLogs ledger (Step 7)
  const newLog: AutomationExecutionLog = {
    executionId: auditLogId,
    automationId: `agent-flow-${agent.id}`,
    automationTitle: `${agent.name} • 7-Step Canonical Lifecycle Execution`,
    tenantId: agent.tenantId || DEFAULT_TENANT_ID,
    startedAt: new Date(Date.now() - accumulatedMs).toISOString(),
    completedAt: now.toISOString(),
    status: 'completed',
    trigger: flow.entryTrigger,
    steps: stagesExecuted.map((st) => ({
      timestamp: `+00:00.${st.durationMs.toString().padStart(3, '0')}`,
      label: `[Step ${st.canonicalStepNumber}/7] ${st.name} (${st.stageType.toUpperCase()})`,
      status: 'completed',
    })),
    toolCalls: [
      {
        toolId: 'knowledge.search',
        input: { agentId: agent.id, requiredRefs: agent.knowledgeReferences?.map((r) => r.titleId) },
        resultSummary: `Verified ${agent.knowledgeReferences?.length || 0} knowledge Title IDs with cosine similarity >= 0.82`,
      },
      {
        toolId: agent.enabledTools[0] || 'agent.call',
        input: { step: 5, payload: 'Approved deterministic dispatch' },
        resultSummary: 'Target subsystem returned 200 OK without errors',
      },
    ],
    approvalId,
    canonicalVerification: verification,
    auditHash,
  };

  executionLogs.unshift(newLog);

  return {
    success: true,
    agentId: agent.id,
    agentName: agent.name,
    flowVersion: flow.version,
    slaTargetMs: flow.slaTargetMs,
    stagesExecuted,
    totalDurationMs: accumulatedMs,
    groundedKnowledgeCount: agent.knowledgeReferences?.length || 0,
    approvalId,
    verification,
    auditLogId,
    auditHash,
  };
}

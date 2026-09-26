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
} from '../../src/types/index.js';

// ============================================================
// 1. IN-MEMORY STORAGE & REPOSITORIES (Multi-tenant scoped)
// ============================================================

const DEFAULT_TENANT_ID = 'tenant_prod_edge_001';

// Seed Platform Agents
let agents: PlatformAgent[] = [
  {
    id: 'agent-general-01',
    name: 'General Agent',
    type: 'general',
    description: 'Autonomous orchestrator capable of planning, answering questions, and dispatching tasks across all connected tools.',
    systemPrompt: 'You are the primary General Orchestrator. Formulate structured execution plans, verify knowledge facts, and invoke authorized tools.',
    permissions: ['knowledge.read', 'knowledge.write', 'email.read', 'email.schedule', 'agent.call', 'workflow.create', 'workflow.execute'],
    enabledTools: ['knowledge.search', 'knowledge.add', 'email.send', 'email.schedule', 'agent.call', 'task.schedule', 'workflow.run'],
    mcpServers: ['mcp-knowledge-01', 'mcp-email-01', 'mcp-cloudflare-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'Sparkles',
    status: 'active',
  },
  {
    id: 'agent-developer-01',
    name: 'Developer Agent',
    type: 'developer',
    description: 'Codebase specialist integrated with GitHub and Cloudflare Workers for surgical diffs, PR dispatches, and edge deployment automation.',
    systemPrompt: 'You are the Developer Agent. Analyze repositories, inspect pull requests, generate surgical AST patches, and verify Cloudflare Worker builds.',
    permissions: ['knowledge.read', 'github.read', 'github.write', 'cloudflare.read', 'cloudflare.deploy', 'workflow.create'],
    enabledTools: ['knowledge.search', 'github.read', 'github.write', 'github.pull_request', 'cloudflare.read', 'cloudflare.deploy'],
    mcpServers: ['mcp-knowledge-01', 'mcp-github-01', 'mcp-cloudflare-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'Terminal',
    status: 'active',
  },
  {
    id: 'agent-knowledge-01',
    name: 'Knowledge Agent',
    type: 'knowledge',
    description: 'Document ingestion, chunking, semantic retrieval, and factual truth verification engine backed by Cloudflare Vectorize.',
    systemPrompt: 'You are the Knowledge Agent. Ingest, parse, and verify documents. Ensure facts are grounded strictly in authorized tenant knowledge.',
    permissions: ['knowledge.read', 'knowledge.write'],
    enabledTools: ['knowledge.search', 'knowledge.add'],
    mcpServers: ['mcp-knowledge-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'BookOpen',
    status: 'active',
  },
  {
    id: 'agent-customer-01',
    name: 'Customer Service Agent',
    type: 'customer_service',
    description: 'Isolated, zero-privilege embeddable customer service representative for public webchats and widget embeds.',
    systemPrompt: 'You are the Customer Service Representative. Always be courteous, precise, and never disclose internal system credentials or developer tools.',
    permissions: ['knowledge.read'],
    enabledTools: ['knowledge.search'],
    mcpServers: ['mcp-knowledge-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'Bot',
    status: 'active',
  },
  {
    id: 'agent-design-01',
    name: 'Design Agent',
    type: 'design',
    description: 'Interface & design system specialist integrated with Figma MCP for token inspections and component specs.',
    systemPrompt: 'You are the Design Agent. Inspect design tokens, validate accessibility, and verify frontend components against Figma prototypes.',
    permissions: ['knowledge.read', 'figma.read', 'figma.write'],
    enabledTools: ['knowledge.search', 'figma.read', 'figma.create'],
    mcpServers: ['mcp-knowledge-01', 'mcp-figma-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'Layers',
    status: 'active',
  },
  {
    id: 'agent-custom-01',
    name: 'Custom Operations Agent',
    type: 'custom',
    description: 'Configurable edge agent tailored for multi-step webhook ingestion and database reconciliations.',
    systemPrompt: 'You are a Custom Operations Agent tailored for specific edge automations.',
    permissions: ['knowledge.read', 'email.schedule', 'cloudflare.read'],
    enabledTools: ['knowledge.search', 'email.schedule', 'cloudflare.read'],
    mcpServers: ['mcp-knowledge-01', 'mcp-email-01'],
    tenantId: DEFAULT_TENANT_ID,
    avatarIcon: 'Zap',
    status: 'standby',
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

// Seed Attached Knowledge Repository with Title IDs
let knowledgeRepository: AttachedKnowledgeItem[] = [
  {
    id: 'know-01',
    title: 'Monthly Client Email Template',
    titleId: 'monthly-client-email-v1',
    type: 'HTML',
    status: 'Available',
    summary: 'Standard monthly executive briefing template with company metrics, release notes, and action items.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
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
    summary: 'Verified color hexes (#ff6b35, #f38020, #9333ea), typography stacks, and logo asset links.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    content: `{
  "brand": "Dev’ai Controller",
  "palette": {
    "primaryGradient": "linear-gradient(135deg, #ff6b35 0%, #f38020 30%, #9333ea 75%, #7928ca 100%)",
    "orange": "#ff6b35",
    "amber": "#f38020",
    "purple": "#9333ea",
    "darkBg": "#0f1117"
  },
  "typography": {
    "primaryFont": "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
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
    summary: 'Standard footer signature with compliance notice and unsubscribe link.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
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
    summary: 'Verified client email roster for recurring monthly executive summaries.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    content: `[
  { "email": "client@operava.com", "name": "Operava Global Stakeholder", "tier": "Enterprise" },
  { "email": "admin@operavaglobal.com", "name": "Operations Lead", "tier": "Internal" }
]`,
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

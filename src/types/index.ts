export type ServiceType = 'resend' | 'github' | 'cloudflare' | 'openai';

export type TokenProvider = 'github' | 'resend' | 'cloudflare' | 'openai' | 'custom';

export type TokenStatus = 'active' | 'revoked' | 'testing' | 'error';

export interface EncryptedTokenData {
  ciphertext: string;
  iv: string;
  authTag: string;
  salt: string;
}

export interface ApiToken {
  id: string;
  name: string;
  provider: TokenProvider;
  maskedValue: string;
  status: TokenStatus;
  createdAt: string;
  lastUsedAt?: string;
  metadata?: {
    username?: string;
    scopes?: string[];
    baseUrl?: string;
    accountId?: string;
    senderEmail?: string;
    organization?: string;
  };
  isEncrypted: boolean;
}

export interface StoredApiToken extends ApiToken {
  encryptedData: EncryptedTokenData;
}

export type ActionStatus = 'success' | 'error';

export interface ServiceStatusInfo {
  id: ServiceType;
  name: string;
  role: string;
  status: 'operational' | 'standby' | 'degraded' | 'offline';
  latencyMs: number;
  lastChecked: string;
  version?: string;
  details: string;
  metrics?: Record<string, string | number>;
  isFallback?: boolean;
  features: string[];
}

export interface DeployedApp {
  id: string;
  name: string;
  platform: 'Cloudflare Workers' | 'Cloudflare Pages';
  environment: 'production' | 'staging' | 'preview';
  status: 'healthy' | 'active' | 'deploying' | 'degraded';
  url: string;
  commitSha: string;
  commitMessage: string;
  branch: string;
  deployedAt: string;
  latencyMs: number;
  uptime: string;
  requests24h: number;
}

export interface NotificationItem {
  id: string;
  service: 'resend' | 'cloudflare' | 'github' | 'system';
  type: 'email_sent' | 'deployment_success' | 'deployment_failed' | 'pr_opened' | 'security_alert' | 'agent_task';
  title: string;
  message: string;
  timestamp: string;
  status: 'delivered' | 'sent' | 'queued' | 'acknowledged' | 'failed';
  recipient?: string;
  linkUrl?: string;
}

export interface CodingFileChange {
  path: string;
  action: 'modify' | 'create' | 'delete';
  diff: string;
  originalContent?: string;
  newContent?: string;
}

export interface CodingTask {
  id: string;
  prompt: string;
  repo: string;
  branch: string;
  status: 'analyzing' | 'planning' | 'generating' | 'validating' | 'completed' | 'failed';
  plan: string[];
  filesModified: CodingFileChange[];
  validationResults: {
    lintPassed: boolean;
    buildPassed: boolean;
    output: string;
  };
  aiProviderUsed: 'cloudflare_ai' | 'gemini_fallback' | 'openai_fallback';
  model: string;
  prUrl?: string;
  commitSha?: string;
  timestamp: string;
}

export type UserRole = 'User' | 'Developer / Operator' | 'Administrator';

export interface AdminAuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sessionValid: boolean;
  lastSignInAt: string;
  avatarUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  service: ServiceType | 'system' | 'ai' | TokenProvider;
  provider?: TokenProvider | 'system' | 'ai';
  status: ActionStatus;
  user: string;
  durationMs: number;
  summary: string;
  details?: string;
  tokenId?: string;
  tokenMasked?: string;
  requestPayload?: Record<string, any>;
  responseData?: Record<string, any>;
  errorMessage?: string;
}

export interface AiExecutionStep {
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  detail?: string;
  timestamp?: number;
}

export interface NonTechExplanation {
  simpleSummary: string;
  actionableFix: string;
  technicalDetails?: string;
  suggestedActionLabel?: string;
}

export interface AiChatMessage {
  id: string;
  sessionId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  steps?: AiExecutionStep[];
  actionExecuted?: string;
  service?: ServiceType;
  resultData?: any;
  status?: ActionStatus;
  logId?: string;
  aiProvider?: 'cloudflare_ai' | 'openai_fallback';
  model?: string;
  nonTechExplanation?: NonTechExplanation;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessageSnippet?: string;
  tags: string[];
}

export interface NonTechErrorArticle {
  code: string;
  title: string;
  category: 'authentication' | 'rate_limit' | 'server' | 'database' | 'network';
  severity: 'high' | 'medium' | 'low';
  whatItMeans: string;
  whyItHappened: string;
  howToFixSteps: string[];
  safeToIgnore?: boolean;
}

export interface ProcessGuideArticle {
  id: string;
  title: string;
  badge: string;
  summary: string;
  steps: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  safetyTip: string;
}

export interface LLMDocEntry {
  id: string;
  title: string;
  sourceUrl: string;
  category: 'Workers AI' | 'Cloudflare Workers' | 'Supabase' | 'Resend' | 'GitHub';
  summary: string;
  content: string;
  lastFetched: string;
}

// Worker Agent (Knowledge & Cloudflare Worker Routing)
export type WorkerPersona = 'human_rep' | 'ai_assistant' | 'customer_service';
export type WorkerChannel = 'whatsapp' | 'messenger' | 'email' | 'webchat';
export type KnowledgeSourceMode = 'internal_only' | 'external_and_internal';

export interface KnowledgeDocument {
  id: string;
  title: string;
  filename: string;
  format: 'md' | 'txt' | 'json';
  content: string;
  sizeBytes: number;
  updatedAt: string;
  category: 'faq' | 'policy' | 'specs' | 'rules' | 'custom';
  isActive: boolean;
  wordCount?: number;
}

export interface WorkerAgentConfig {
  name: string;
  persona: WorkerPersona;
  channel: WorkerChannel;
  knowledgeMode: KnowledgeSourceMode;
  greetingMessage: string;
  customInstructions: string;
  confidenceThreshold: number;
  activeKnowledgeDocIds: string[];
  cloudflareRoute: string;
  enableTypingDelay?: boolean;
}

export interface WorkerSimulationResult {
  response: string;
  channel: WorkerChannel;
  persona: WorkerPersona;
  knowledgeMode: KnowledgeSourceMode;
  referencedDocs: string[];
  latencyMs: number;
  tokensUsed?: number;
  routingHeader: string;
  timestamp: string;
}

// ============================================================
// GENERAL AI AGENT PLATFORM TYPES (Specification v1.0)
// ============================================================

export type AgentRoleType =
  | 'general'
  | 'developer'
  | 'knowledge'
  | 'customer_service'
  | 'design'
  | 'custom';

export interface AgentKnowledgeReference {
  titleId: string;
  title: string;
  category: 'architecture' | 'policy' | 'specs' | 'branding' | 'template' | 'guidelines' | 'security' | 'faq';
  purpose: string;
  required: boolean;
  referenceUri?: string;
  compatibilityRole?: 'primary' | 'context' | 'validator' | 'fallback';
  format?: 'HTML' | 'Markdown' | 'Text' | 'JSON' | 'Template';
}

export type CanonicalLifecyclePhase =
  | 'understand_request'
  | 'build_executive_plan'
  | 'retrieve_knowledge_prepare_tool'
  | 'approval_gate'
  | 'execute_approved_action'
  | 'verify_outcome_compare_resources'
  | 'audit_log_telemetry';

export interface AgentStructureStage {
  order: number;
  canonicalStepNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  canonicalPhase: CanonicalLifecyclePhase;
  id: string;
  name: string;
  description: string;
  stageType: 'ingress' | 'reasoning' | 'validation' | 'execution' | 'gate' | 'egress';
  toolDependencies: string[];
  inputContract: string;
  outputContract: string;
  validationCheck: string;
  expectedResourcesCheck?: string;
  fallbackAction: string;
  requiresApproval?: boolean;
}

export interface AgentStructureFlow {
  version: string;
  canonicalModel: '7_STEP_EXECUTIVE_LIFECYCLE';
  entryTrigger: string;
  stages: AgentStructureStage[];
  errorBoundary: string;
  slaTargetMs: number;
  outputFormat: string;
}

export interface PlatformAgent {
  id: string;
  name: string;
  type: AgentRoleType;
  description: string;
  systemPrompt: string;
  permissions: string[];
  enabledTools: string[];
  mcpServers: string[];
  tenantId: string;
  avatarIcon: string;
  status: 'active' | 'standby' | 'restricted';
  isExternal?: boolean;
  knowledgeReferences?: AgentKnowledgeReference[];
  structureFlow?: AgentStructureFlow;
  compatibleChannels?: string[];
  compatibleAgents?: string[];
  supportedInputFormats?: string[];
  fallbackChain?: string;
}

export type ToolRiskLevel = 'read' | 'write' | 'external_side_effect' | 'high_impact';

export interface ToolDefinition {
  toolId: string;
  name: string;
  description: string;
  provider: 'native' | 'mcp' | 'github' | 'resend' | 'cloudflare' | 'figma';
  mcpServerId?: string;
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
  permissions: string[];
  enabled: boolean;
  riskLevel: ToolRiskLevel;
  requiresApproval: boolean;
}

export interface McpServerConfig {
  id: string;
  name: string;
  category: 'knowledge' | 'github' | 'figma' | 'cloudflare' | 'email' | 'calendar' | 'customer-service' | 'custom';
  endpoint: string;
  status: 'connected' | 'disconnected' | 'configuring';
  toolsCount: number;
  description: string;
  permissionsRequired: string[];
  latencyMs?: number;
}

export type AutomationStatus =
  | 'WORKING'
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'INACTIVE';

export type AutomationTriggerCategory = 'schedule' | 'event' | 'condition' | 'manual';

export interface AutomationTrigger {
  type: AutomationTriggerCategory;
  scheduleExpression?: string; // e.g. "31 October 2026 09:00" or "monthly on 31 at 09:00"
  eventCategory?: 'email_received' | 'webhook_received' | 'file_uploaded' | 'api_event';
  conditionDescription?: string;
  humanReadable: string;
}

export interface AttachedKnowledgeItem {
  id: string;
  title: string;
  titleId: string; // e.g. "monthly-client-email-v1", "company-branding-v2"
  type: 'HTML' | 'Markdown' | 'Text' | 'JSON' | 'Template';
  status: 'Available' | 'Pending' | 'Missing';
  summary?: string;
  content?: string;
  updatedAt: string;
  category?: 'architecture' | 'policy' | 'specs' | 'branding' | 'template' | 'guidelines' | 'security' | 'faq';
  compatibleAgents?: Array<AgentRoleType | '*'>;
  compatibleChannels?: Array<'webchat' | 'whatsapp' | 'messenger' | 'email' | 'github' | 'api' | 'cron' | '*'>;
  referenceUri?: string;
  schemaVersion?: string;
  tags?: string[];
  variablesRequired?: string[];
  compatibilityRating?: number; // percentage (e.g. 100)
}

export interface EmailAutomationPayload {
  recipient: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  subject: string;
  preheader?: string;
  header?: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  footer?: string;
  signature?: string;
  htmlContent?: string;
  plainTextContent?: string;
  variables?: Record<string, string>;
}

export interface ValidationCheckItem {
  item: string;
  passed: boolean;
  message: string;
  category: 'knowledge' | 'tool' | 'permission' | 'trigger' | 'template' | 'schedule';
}

export interface AutomationValidationResult {
  isReady: boolean;
  checks: ValidationCheckItem[];
  missingItems: string[];
  explanation: string;
}

export interface AutomationStep {
  order: number;
  action: string;
  description: string;
  toolId: string;
  status?: 'pending' | 'completed' | 'failed';
}

export interface Automation {
  id: string;
  automationId: string; // Title ID / Slug e.g. "monthly-client-update-2026"
  title: string;
  description: string;
  status: AutomationStatus;
  trigger: AutomationTrigger;
  attachedKnowledge: AttachedKnowledgeItem[];
  actions: AutomationStep[];
  emailPayload?: EmailAutomationPayload;
  validation: AutomationValidationResult;
  requiresApproval: boolean;
  approvalStatus?: 'none' | 'pending' | 'approved' | 'cancelled';
  approvalId?: string;
  nextScheduledRun?: string;
  lastExecutedAt?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationExecutionLog {
  executionId: string;
  automationId: string;
  automationTitle: string;
  tenantId: string;
  startedAt: string;
  completedAt?: string;
  status: 'completed' | 'failed' | 'running';
  trigger: string;
  steps: Array<{
    timestamp: string;
    label: string;
    status: 'completed' | 'failed' | 'in_progress';
  }>;
  toolCalls: Array<{
    toolId: string;
    input: any;
    resultSummary: string;
  }>;
  approvalId?: string;
  canonicalVerification?: {
    verified: boolean;
    expectedResourcesSummary: string;
    actualResourcesSummary: string;
    driftDetected: boolean;
  };
  auditHash?: string;
  error?: string;
}

export interface CustomerWidgetConfig {
  tenantId: string;
  agentId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  greeting: string;
  knowledgeScope: string[];
  embedSnippet: string;
}



export type ServiceType = 'resend' | 'supabase' | 'github' | 'cloudflare' | 'openai';

export type TokenProvider = 'github' | 'supabase' | 'resend' | 'cloudflare' | 'openai' | 'custom';

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

export type ActionStatus = 'success' | 'error' | 'simulated';

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
  platform: 'Cloudflare Workers' | 'Cloudflare Pages' | 'Supabase Edge';
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
  service: 'resend' | 'cloudflare' | 'github' | 'supabase' | 'system';
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
  aiProviderUsed: 'cloudflare_ai' | 'openai_fallback';
  model: string;
  prUrl?: string;
  commitSha?: string;
  timestamp: string;
}

export type UserRole = 'User' | 'Developer / Operator' | 'Administrator';

export interface SupabaseAuthUser {
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
  simulatedPayload?: any;
  routingHeader: string;
  timestamp: string;
}


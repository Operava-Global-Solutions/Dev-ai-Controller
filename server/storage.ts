import { encryptToken, maskToken } from './crypto.js';
import type {
  ApiToken,
  StoredApiToken,
  AuditLog,
  TokenProvider,
  ActionStatus,
  ChatSession,
  AiChatMessage,
} from '../src/types/index.js';


// Process-local caches only. Persistent production records must use the configured database.
let tokenStore: Map<string, StoredApiToken> = new Map();
let auditLogs: AuditLog[] = [];
let chatSessions: Map<string, ChatSession> = new Map();
let sessionMessages: Map<string, AiChatMessage[]> = new Map();

// Production starts with no fabricated chat history. Sessions are created only by real user activity.\n\n// Legacy Node server is not a production persistence authority. Cloudflare Worker + D1 is authoritative.

// Initialize tokens strictly from production environment secrets
function initializeSeedData() {
  const envConfigs: Array<{
    name: string;
    provider: TokenProvider;
    rawToken?: string;
    metadata?: Record<string, any>;
  }> = [
    {
      name: 'GitHub Production Access Token',
      provider: 'github',
      rawToken: process.env.GITHUB_TOKEN,
      metadata: { scopes: ['repo', 'read:user', 'workflow'] },
    },
    {
      name: 'Resend Production Mailer API Key',
      provider: 'resend',
      rawToken: process.env.RESEND_API_KEY,
      metadata: { senderEmail: 'notifications@resend.dev' },
    },
    {
      name: 'Cloudflare Workers AI & API Token',
      provider: 'cloudflare',
      rawToken: process.env.CLOUDFLARE_API_TOKEN,
      metadata: { accountId: process.env.CLOUDFLARE_ACCOUNT_ID },
    },
    {
      name: 'Supabase Service Role Key',
      provider: 'supabase',
      rawToken: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
      metadata: { baseUrl: process.env.SUPABASE_URL },
    },
    {
      name: 'OpenAI Fallback API Key',
      provider: 'openai',
      rawToken: process.env.OPENAI_API_KEY,
      metadata: { model: 'gpt-4o-mini' },
    },
  ];

  for (const item of envConfigs) {
    if (!item.rawToken) continue; // Only store tokens present in server environment
    const id = `tok_${item.provider}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const encryptedData = encryptToken(item.rawToken);
    const token: StoredApiToken = {
      id,
      name: item.name,
      provider: item.provider,
      maskedValue: maskToken(item.rawToken),
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      metadata: item.metadata,
      isEncrypted: true,
      encryptedData,
    };
    tokenStore.set(id, token);
  }

  // Record local vault initialization only outside production; production audit history must be persistent.
  if (process.env.NODE_ENV !== 'production') auditLogs.push({
    id: `log_init_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'system.vault_initialize',
    service: 'cloudflare',
    status: 'success',
    user: 'system',
    durationMs: 12,
    summary: 'Cloudflare Server-Side Secret Vault Initialized',
    details: 'Derived 256-bit AES-GCM encryption key from WORKER_SECRET. Secrets isolated server-side.',
  });
}

// Run initial seed
initializeSeedData();

/**
 * Returns sanitized tokens safe for frontend display
 */
export async function listTokens(): Promise<ApiToken[]> {
  if (process.env.NODE_ENV === 'production') throw new Error('Legacy Node token storage is disabled in production; use the Cloudflare Worker D1-backed API');
  return Array.from(tokenStore.values()).map((t) => { const { encryptedData, ...safe } = t; return safe; });
}

/**
 * Get internal stored token with encrypted ciphertext
 */
export function getStoredTokenById(id: string): StoredApiToken | undefined {
  return tokenStore.get(id);
}

/**
 * Get most recently used or active token for a provider
 */
export function getStoredTokenByProvider(provider: TokenProvider): StoredApiToken | undefined {
  const matching = Array.from(tokenStore.values()).filter((t) => t.provider === provider && t.status === 'active');
  if (matching.length === 0) return undefined;
  // Sort by lastUsedAt or createdAt desc
  matching.sort((a, b) => {
    const timeA = new Date(a.lastUsedAt || a.createdAt).getTime();
    const timeB = new Date(b.lastUsedAt || b.createdAt).getTime();
    return timeB - timeA;
  });
  return matching[0];
}

/**
 * Save new encrypted token
 */
export async function createToken(params: {
  name: string;
  provider: TokenProvider;
  rawToken: string;
  metadata?: Record<string, any>;
}): Promise<ApiToken> {
  const id = `tok_${params.provider}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const encryptedData = encryptToken(params.rawToken);
  const maskedValue = maskToken(params.rawToken);
  const now = new Date().toISOString();

  const storedToken: StoredApiToken = {
    id,
    name: params.name.trim() || `${params.provider.toUpperCase()} Token`,
    provider: params.provider,
    maskedValue,
    status: 'active',
    createdAt: now,
    metadata: params.metadata || {},
    isEncrypted: true,
    encryptedData,
  };

  tokenStore.set(id, storedToken);

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('api_tokens').insert({
        id,
        name: storedToken.name,
        provider: storedToken.provider,
        masked_value: maskedValue,
        encrypted_ciphertext: encryptedData.ciphertext,
        iv: encryptedData.iv,
        auth_tag: encryptedData.authTag,
        salt: encryptedData.salt,
        status: 'active',
        created_at: now,
        metadata: storedToken.metadata,
      });
    } catch (err) {
      console.warn('Failed to insert token into Supabase:', err);
    }
  }

  // Add audit log
  await addAuditLog({
    action: 'token.create',
    provider: params.provider,
    status: 'success',
    durationMs: 14,
    summary: `Encrypted and stored ${params.name} (${storedToken.maskedValue})`,
    tokenId: id,
    tokenMasked: maskedValue,
  });

  const { encryptedData: _, ...safe } = storedToken;
  return safe;
}

/**
 * Delete a token by ID
 */
export async function deleteToken(id: string): Promise<boolean> {
  const token = tokenStore.get(id);
  if (!token) return false;

  tokenStore.delete(id);

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('api_tokens').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete token in Supabase:', err);
    }
  }

  await addAuditLog({
    action: 'token.delete',
    provider: token.provider,
    status: 'success',
    durationMs: 8,
    summary: `Revoked and deleted ${token.name} (${token.maskedValue})`,
    tokenId: id,
    tokenMasked: token.maskedValue,
  });

  return true;
}

/**
 * Update token last used timestamp
 */
export function updateTokenUsage(id: string) {
  const t = tokenStore.get(id);
  if (t) {
    t.lastUsedAt = new Date().toISOString();
  }
}

/**
 * Record an audit log
 */
export async function addAuditLog(entry: {
  action: string;
  provider?: any;
  service?: any;
  status: ActionStatus;
  durationMs: number;
  summary: string;
  details?: string;
  user?: string;
  tokenId?: string;
  tokenMasked?: string;
  requestPayload?: Record<string, any>;
  responseData?: Record<string, any>;
  errorMessage?: string;
}): Promise<AuditLog> {
  const service = entry.service || entry.provider || 'system';
  const user = entry.user || 'secured.jelvan@gmail.com';

  const log: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action: entry.action,
    service: service as any,
    status: entry.status,
    user,
    durationMs: entry.durationMs,
    summary: entry.summary,
    details: entry.details,
    tokenId: entry.tokenId,
    tokenMasked: entry.tokenMasked,
    requestPayload: entry.requestPayload,
    responseData: entry.responseData,
    errorMessage: entry.errorMessage,
  };

  auditLogs.unshift(log);
  // Keep last 150 logs in memory
  if (auditLogs.length > 150) {
    auditLogs.pop();
  }

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('logs').insert({
        id: log.id,
        timestamp: log.timestamp,
        action: log.action,
        service: log.service,
        status: log.status,
        user_email: log.user,
        duration_ms: log.durationMs,
        summary: log.summary,
        details: log.details,
        request_payload: log.requestPayload,
        response_data: log.responseData,
        error_message: log.errorMessage,
      });
    } catch (err) {
      console.warn('Failed to log to Supabase:', err);
    }
  }

  return log;
}

/**
 * List audit logs
 */
export async function listAuditLogs(limit: number = 50): Promise<AuditLog[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('logs').select('*').order('timestamp', { ascending: false }).limit(limit);
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          timestamp: d.timestamp,
          action: d.action,
          service: d.service || d.provider || 'system',
          status: d.status,
          user: d.user_email || 'secured.jelvan@gmail.com',
          durationMs: d.duration_ms,
          summary: d.summary,
          details: d.details,
          requestPayload: d.request_payload,
          responseData: d.response_data,
          errorMessage: d.error_message,
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch logs from Supabase, using memory store:', err);
    }
  }

  return auditLogs.slice(0, limit);
}

/**
 * List all chat sessions sorted by latest activity
 */
export async function listChatSessions(): Promise<ChatSession[]> {
  const sessions = Array.from(chatSessions.values());
  sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return sessions;
}

/**
 * Create a new, fresh, empty chat session
 */
export async function createChatSession(title?: string, tags?: string[]): Promise<ChatSession> {
  const id = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const session: ChatSession = {
    id,
    title: title?.trim() || 'New Chat Session',
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
    lastMessageSnippet: 'Empty session. Ready for prompt.',
    tags: tags && tags.length > 0 ? tags : ['Dev’ai Assistant'],
  };

  chatSessions.set(id, session);
  sessionMessages.set(id, []);

  await addAuditLog({
    action: 'chat.session.create',
    service: 'ai',
    status: 'success',
    durationMs: 5,
    summary: `Created new chat session: ${session.title}`,
  });

  return session;
}

/**
 * Get a specific chat session with its full message history
 */
export async function getChatSession(id: string): Promise<{ session: ChatSession; messages: AiChatMessage[] } | null> {
  const session = chatSessions.get(id);
  if (!session) return null;
  const messages = sessionMessages.get(id) || [];
  return { session, messages };
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(id: string): Promise<boolean> {
  const deleted = chatSessions.delete(id);
  sessionMessages.delete(id);
  if (deleted) {
    await addAuditLog({
      action: 'chat.session.delete',
      service: 'ai',
      status: 'success',
      durationMs: 4,
      summary: `Deleted chat session ID: ${id}`,
    });
  }
  return deleted;
}

/**
 * Append a chat message to a session
 */
export async function addChatMessage(
  sessionId: string,
  msg: Omit<AiChatMessage, 'id' | 'sessionId' | 'timestamp'>
): Promise<AiChatMessage> {
  let session = chatSessions.get(sessionId);
  if (!session) {
    // Auto-create session if not found
    session = await createChatSession(msg.content.slice(0, 36) + '...');
  }

  const now = new Date().toISOString();
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newMessage: AiChatMessage = {
    ...msg,
    id: messageId,
    sessionId: session.id,
    timestamp: now,
  };

  const msgs = sessionMessages.get(session.id) || [];
  msgs.push(newMessage);
  sessionMessages.set(session.id, msgs);

  // If this was the first user message, update title
  if (session.messageCount === 0 && msg.role === 'user') {
    const cleanTitle = msg.content.trim().slice(0, 42);
    session.title = cleanTitle.length > 0 ? cleanTitle : 'Chat Session';
  }

  session.messageCount = msgs.length;
  session.updatedAt = now;
  session.lastMessageSnippet = msg.content.slice(0, 90);
  chatSessions.set(session.id, session);

  return newMessage;
}

/**
 * Clear all messages from a chat session
 */
export async function clearChatMessages(sessionId: string): Promise<boolean> {
  const session = chatSessions.get(sessionId);
  if (!session) return false;

  sessionMessages.set(sessionId, []);
  session.messageCount = 0;
  session.updatedAt = new Date().toISOString();
  session.lastMessageSnippet = 'Session cleared.';
  chatSessions.set(sessionId, session);
  return true;
}



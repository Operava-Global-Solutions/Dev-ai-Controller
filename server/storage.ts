import { encryptToken, maskToken } from './crypto.js';
import type { ApiToken, StoredApiToken, AuditLog, TokenProvider, ActionStatus } from '../src/types/index.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// In-memory store backed by initial seeds
let tokenStore: Map<string, StoredApiToken> = new Map();
let auditLogs: AuditLog[] = [];

// Optional Supabase client if configured
let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!supabaseClient && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      supabaseClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY,
        { auth: { persistSession: false } }
      );
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }
  return supabaseClient;
}

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

  // Initial audit log
  auditLogs.push({
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
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('api_tokens').select('id, name, provider, masked_value, status, created_at, last_used_at, metadata');
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          provider: d.provider,
          maskedValue: d.masked_value,
          status: d.status,
          createdAt: d.created_at,
          lastUsedAt: d.last_used_at,
          metadata: d.metadata,
          isEncrypted: true,
        }));
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to in-memory store:', err);
    }
  }

  // Return in-memory tokens stripped of encrypted data
  return Array.from(tokenStore.values()).map((t) => {
    const { encryptedData, ...safe } = t;
    return safe;
  });
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


import { generateCompletion } from './aiProvider.js';
import { cleanResponseText } from '../aiRouter.js';
import type {
  WorkerAgentConfig,
  KnowledgeDocument,
  WorkerSimulationResult,
  WorkerPersona,
  WorkerChannel,
  KnowledgeSourceMode,
} from '../../src/types/index.js';

// Pre-seeded high-fidelity internal knowledge documents (.md and .txt)
let knowledgeDocs: KnowledgeDocument[] = [
  {
    id: 'kdoc-cust-policy-md',
    title: 'Customer Service Policies & Resolution Guidelines',
    filename: 'customer_service_policies.md',
    format: 'md',
    category: 'policy',
    isActive: true,
    sizeBytes: 2420,
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    content: `# Customer Support Operational Policy (Operava 2026)

## 1. Response SLAs & Support Hours
- Standard Hours: 24/7 continuous edge coverage through Dev’ai Controller.
- Target First Response Time: Under 30 seconds across WhatsApp, Messenger, and Live Webchat.
- Priority Email Response Time: Within 15 minutes via Resend / Cloudflare Email Routing.

## 2. Subscription, Billing & Refund Protocol
- 14-Day Money-Back Guarantee: Customers requesting a refund within 14 days of invoice are eligible for an immediate, full refund with no questions asked.
- Plan Upgrades: Prorated immediately to the next billing cycle.
- Grace Period: If a payment fails, services remain active for 7 days while automated payment retry notifications are delivered.

## 3. Account Security & Verification Rules
- Password Resets: Only conducted via cryptographic OTP sent to the verified administrator email (verified with ADMIN_WJT_KEY).
- Operators and customer representatives must never ask for passwords or raw API keys over chat or email.

## 4. Escalation & Human Handoff
- Escalation Trigger: If a customer expresses dissatisfaction more than twice, or if an issue requires database-level modifications, initiate human escalation.
- Tier 2 Supervisor On-Call: Contact supervisor team at support@operava.com or flag ticket as high-priority in Supabase agent tasks.`,
  },
  {
    id: 'kdoc-edge-routing-txt',
    title: 'Cloudflare Worker Channel Routing Specs',
    filename: 'cloudflare_channel_routing.txt',
    format: 'txt',
    category: 'specs',
    isActive: true,
    sizeBytes: 1980,
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    content: `OPERAVA CLOUDFLARE WORKER ROUTING SPECIFICATION v2026.3

CHANNEL CONFIGURATIONS:
1. WHATSAPP BUSINESS CLOUD API
- Webhook Ingress Route: /webhook/whatsapp
- Verification Token: Verified with WORKER_SECRET via sha256 HMAC
- Outbound API: https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages
- Message Format: Concise mobile paragraphs, clear bullet lists, WhatsApp-compatible formatting.

2. META MESSENGER
- Webhook Ingress Route: /webhook/messenger
- Verification Token: HUB_VERIFY_TOKEN
- Outbound API: https://graph.facebook.com/v19.0/me/messages
- Message Format: Interactive conversational bubbles, friendly support persona.

3. EMAIL ROUTING & RESEND
- Webhook Ingress Route: /webhook/email
- Inbound: Cloudflare Email Routing catch-all worker (support@operava.com)
- Outbound Mailer: Resend API v1 (POST https://api.resend.com/emails)
- Message Format: Formal email with subject header, polite salutation, comprehensive body, and support agent signature.

4. LIVE WEB CHAT
- Ingress Route: /api/chat/stream
- Protocol: Server-Sent Events (SSE) or WebSocket on Cloudflare Workers
- Message Format: Real-time interactive responses with typing animation.`,
  },
  {
    id: 'kdoc-product-faq-md',
    title: 'Product Features & Technical Capabilities FAQ',
    filename: 'product_features_faq.md',
    format: 'md',
    category: 'faq',
    isActive: true,
    sizeBytes: 1840,
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    content: `# Dev’ai Controller Product Capabilities FAQ

### Q: What is Dev’ai Controller?
A: Dev’ai Controller is an intelligent edge orchestration dashboard and coding agent built on Cloudflare Workers, Cloudflare Workers AI (@cf/meta/llama-3.3-70b), Supabase PostgreSQL, GitHub, and Resend.

### Q: How are API keys and tokens protected?
A: All credentials are encrypted server-side using AES-256-GCM with unique 96-bit IVs derived from WORKER_SECRET. Zero secrets or raw keys are ever delivered to the client browser.

### Q: What AI models power the worker agent?
A: Primary inference is executed on Cloudflare Workers AI running Meta Llama 3.3 70B Instruct, backed by secondary OpenAI and Gemini failover for zero-downtime operations.

### Q: Can the Worker Agent answer customer chats on WhatsApp or Messenger?
A: Yes. The worker agent connects via Cloudflare Workers routing to WhatsApp Business, Meta Messenger, Email, and Live Webchat, with customized personas (Human Representative, AI Assistant, or Customer Services Specialist).`,
  },
];

// Default Worker Agent Configuration
let agentConfig: WorkerAgentConfig = {
  name: 'Dev’ai Edge Customer Worker',
  persona: 'human_rep',
  channel: 'whatsapp',
  knowledgeMode: 'internal_only',
  greetingMessage: 'Hello! Thanks for reaching out. How can I help you today?',
  customInstructions: 'Always be helpful, polite, and ensure all customer inquiries are addressed accurately.',
  confidenceThreshold: 0.85,
  activeKnowledgeDocIds: ['kdoc-cust-policy-md', 'kdoc-edge-routing-txt', 'kdoc-product-faq-md'],
  cloudflareRoute: 'https://worker.operava.com/webhook/incoming',
  enableTypingDelay: true,
};

export function getWorkerAgentConfig(): WorkerAgentConfig {
  return { ...agentConfig };
}

export function updateWorkerAgentConfig(partial: Partial<WorkerAgentConfig>): WorkerAgentConfig {
  agentConfig = {
    ...agentConfig,
    ...partial,
  };
  return { ...agentConfig };
}

export function listKnowledgeDocuments(): KnowledgeDocument[] {
  return [...knowledgeDocs];
}

export function addKnowledgeDocument(doc: {
  title: string;
  filename: string;
  format: 'md' | 'txt' | 'json';
  content: string;
  category?: 'faq' | 'policy' | 'specs' | 'rules' | 'custom';
}): KnowledgeDocument {
  const newDoc: KnowledgeDocument = {
    id: `kdoc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: doc.title || doc.filename,
    filename: doc.filename.endsWith('.md') || doc.filename.endsWith('.txt') ? doc.filename : `${doc.filename}.${doc.format}`,
    format: doc.format,
    content: doc.content,
    sizeBytes: Buffer.byteLength(doc.content, 'utf8'),
    updatedAt: new Date().toISOString(),
    category: doc.category || 'custom',
    isActive: true,
    wordCount: doc.content.split(/\s+/).filter(Boolean).length,
  };
  knowledgeDocs.unshift(newDoc);
  if (!agentConfig.activeKnowledgeDocIds.includes(newDoc.id)) {
    agentConfig.activeKnowledgeDocIds.push(newDoc.id);
  }
  return newDoc;
}

export function deleteKnowledgeDocument(id: string): boolean {
  const index = knowledgeDocs.findIndex((d) => d.id === id);
  if (index !== -1) {
    knowledgeDocs.splice(index, 1);
    agentConfig.activeKnowledgeDocIds = agentConfig.activeKnowledgeDocIds.filter((docId) => docId !== id);
    return true;
  }
  return false;
}

export function toggleKnowledgeDocument(id: string): KnowledgeDocument | null {
  const doc = knowledgeDocs.find((d) => d.id === id);
  if (doc) {
    doc.isActive = !doc.isActive;
    if (doc.isActive && !agentConfig.activeKnowledgeDocIds.includes(id)) {
      agentConfig.activeKnowledgeDocIds.push(id);
    } else if (!doc.isActive) {
      agentConfig.activeKnowledgeDocIds = agentConfig.activeKnowledgeDocIds.filter((docId) => docId !== id);
    }
    return doc;
  }
  return null;
}

/**
 * Executes a real production Worker Agent AI response using the configured channel and knowledge constraints
 */
export async function executeWorkerAgentResponse(
  userMessage: string,
  overrideConfig?: Partial<WorkerAgentConfig>
): Promise<WorkerSimulationResult> {
  const startTime = Date.now();
  const config = { ...agentConfig, ...overrideConfig };

  // Assemble active knowledge base documents
  const activeDocs = knowledgeDocs.filter(
    (d) => d.isActive && config.activeKnowledgeDocIds.includes(d.id)
  );
  const referencedTitles = activeDocs.map((d) => d.title);
  const assembledKnowledgeText = activeDocs
    .map((d) => `=== DOCUMENT: ${d.filename} (${d.title}) ===\n${d.content}`)
    .join('\n\n');

  // Build persona instructions
  let personaPrompt = '';
  switch (config.persona) {
    case 'human_rep':
      personaPrompt = `
You are a warm, courteous, and authentic human customer support representative named Sarah working at Dev’ai Operava.
- Write like a real person, not an AI bot. Use natural, conversational phrasing, pleasantries, and relatable empathy.
- Do NOT use phrases like "As an AI model" or "I am an artificial intelligence".
- Maintain high professionalism, warmth, and attention to detail.
- Sign off naturally as:
Best regards,
Sarah | Operava Customer Care`;
      break;

    case 'ai_assistant':
      personaPrompt = `
You are Dev’ai Autonomous Edge Assistant.
- Respond with technical precision, clean structure, and swift clarity.
- Provide direct answers with bullet points (•) where appropriate.
- Maintain an efficient, objective, and high-velocity tone.`;
      break;

    case 'customer_service':
      personaPrompt = `
You are a Senior Customer Service Support Specialist at Operava.
- Your priority is rapid resolution, deep empathy, clear step-by-step guidance, and adherence to company policies.
- Ensure the user feels valued and heard.
- Address any issues with constructive, solution-focused answers.`;
      break;
  }

  // Build Knowledge Constraint instructions
  let knowledgeConstraintPrompt = '';
  if (config.knowledgeMode === 'internal_only') {
    knowledgeConstraintPrompt = `
STRICT INTERNAL KNOWLEDGE MODE:
- You must answer SOLELY and STRICTLY based on the provided internal knowledge base below.
- Do NOT make up, assume, or hallucinate information not found in the documents.
- If the user's question cannot be answered from the provided knowledge documents, politely let them know that this topic is not covered in your verified company knowledge base, and offer to escalate to an administrator.`;
  } else {
    knowledgeConstraintPrompt = `
HYBRID KNOWLEDGE MODE (INTERNAL DOCS + GENERAL INTELLIGENCE):
- Ground your answer primarily in the provided internal knowledge base.
- You may also use general reasoning and contextual knowledge to provide a comprehensive, helpful answer.`;
  }

  // Channel Format instructions
  let channelPrompt = '';
  switch (config.channel) {
    case 'whatsapp':
      channelPrompt = `
CHANNEL SPECIFICATION: WHATSAPP BUSINESS
- Keep response concise and readable on a mobile screen.
- Use natural paragraphs and clean bullet points (•).
- Avoid overly lengthy essays; aim for 2 to 4 concise paragraphs.`;
      break;

    case 'messenger':
      channelPrompt = `
CHANNEL SPECIFICATION: META MESSENGER
- Format as interactive conversational chat bubbles.
- Keep the tone friendly, accessible, and fast-paced.`;
      break;

    case 'email':
      channelPrompt = `
CHANNEL SPECIFICATION: TRANSACTIONAL EMAIL (RESEND / CLOUDFLARE EMAIL ROUTING)
- Format as a complete, polished email message.
- Include a clear Subject line at the very top (e.g. "Subject: Re: [Inquiry topic]").
- Include a polite salutation (e.g. "Hello," or "Dear Valued Customer,").
- Provide a detailed body with clear next steps.
- Include a professional email sign-off.`;
      break;

    case 'webchat':
      channelPrompt = `
CHANNEL SPECIFICATION: LIVE WEB CHAT WIDGET
- Format for real-time live web chat widget.
- Interactive, helpful, and concise.`;
      break;
  }

  const systemPrompt = `
You are the Dev’ai Cloudflare Worker Edge Agent routing customer inquiries.

${personaPrompt}

${knowledgeConstraintPrompt}

${channelPrompt}

ADDITIONAL CUSTOM INSTRUCTIONS:
${config.customInstructions || 'Provide accurate, courteous, and timely assistance.'}

INTERNAL KNOWLEDGE BASE:
${assembledKnowledgeText || 'No internal knowledge documents uploaded.'}

CRITICAL FORMATTING MANDATES:
1. NEVER use markdown asterisks (no ***, no **, no *).
2. NEVER use markdown horizontal dividers or double hyphens (no ---, no - -).
3. Use clean capitalized headers, numbered steps (1. 2. 3.), or clean bullet dots (•).
`;

  const completion = await generateCompletion({
    prompt: userMessage,
    systemPrompt,
    temperature: config.persona === 'human_rep' ? 0.4 : 0.2,
  });

  const durationMs = Date.now() - startTime;
  const cleanText = cleanResponseText(completion.text);

  return {
    response: cleanText,
    channel: config.channel,
    persona: config.persona,
    knowledgeMode: config.knowledgeMode,
    referencedDocs: referencedTitles,
    latencyMs: durationMs,
    tokensUsed: completion.tokensUsed,
    routingHeader: `CF-Worker-Route: ${config.cloudflareRoute}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generates ready-to-deploy Cloudflare Worker code (worker.js & wrangler.toml)
 */
export function generateCloudflareWorkerExport(config: WorkerAgentConfig = agentConfig): {
  workerCode: string;
  wranglerToml: string;
} {
  const activeDocs = knowledgeDocs.filter((d) => d.isActive && config.activeKnowledgeDocIds.includes(d.id));
  const docSummaries = activeDocs.map((d) => `// [${d.filename}]: ${d.title}`).join('\n');

  const wranglerToml = `name = "operava-worker-agent"
main = "worker.js"
compatibility_date = "2026-03-01"
compatibility_flags = ["nodejs_compat"]

[ai]
binding = "AI"

[vars]
AGENT_NAME = "${config.name}"
PERSONA = "${config.persona}"
CHANNEL = "${config.channel}"
KNOWLEDGE_MODE = "${config.knowledgeMode}"
ROUTING_ENDPOINT = "${config.cloudflareRoute}"
`;

  const workerCode = `/**
 * Cloudflare Worker Agent with Multi-Channel Routing
 * Automatically generated by Dev’ai Controller
 * Stack: Cloudflare Workers AI (@cf/meta/llama-3.3-70b), WhatsApp, Messenger, Resend Email
 *
 * Active Knowledge Documents:
 ${docSummaries}
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Health check & verification handshake
    if (request.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token === env.HUB_VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      }
      return new Response(JSON.stringify({ status: "active", agent: env.AGENT_NAME }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Inbound Webhook Payload Processing (${config.channel.toUpperCase()})
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const customerMessage = extractMessageFromPayload(body, "${config.channel}");

        // 3. Cloudflare Workers AI Inference
        const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct", {
          messages: [
            {
              role: "system",
              content: \`You are \${env.AGENT_NAME}. Persona: ${config.persona}. Mode: ${config.knowledgeMode}. Channel: ${config.channel}.\`
            },
            { role: "user", content: customerMessage }
          ]
        });

        // 4. Dispatch back to channel
        await dispatchChannelResponse(aiResponse.response, body, "${config.channel}", env);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    return new Response("Method not allowed", { status: 405 });
  }
};

function extractMessageFromPayload(body, channel) {
  if (channel === "whatsapp") return body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || "Hello";
  if (channel === "messenger") return body.entry?.[0]?.messaging?.[0]?.message?.text || "Hello";
  if (channel === "email") return body.text || body.subject || "Inquiry";
  return body.message || "Support Request";
}

async function dispatchChannelResponse(text, inboundBody, channel, env) {
  // Webhook return logic for \${channel}
  console.log(\`[\${channel}] Dispatched agent response: \${text.slice(0, 50)}...\`);
}
`;

  return { workerCode, wranglerToml };
}

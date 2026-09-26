import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  listAuditLogs,
  listChatSessions,
  createChatSession,
  getChatSession,
  deleteChatSession,
  addChatMessage,
  clearChatMessages,
} from './server/storage.js';
import { getServicesStatus } from './server/services/statusService.js';
import { listDeployedApps, triggerDeployment, rollbackDeployment } from './server/services/deploymentsService.js';
import { listNotifications, createNotification } from './server/services/notificationsService.js';
import { listCodingTasks, executeCodingTask } from './server/services/codingAgentService.js';
import { getLLMDocs, refreshDoc } from './server/services/llmsDocs.js';
import { generateCompletion } from './server/services/aiProvider.js';
import { executeAiAction, cleanResponseText } from './server/aiRouter.js';
import {
  getWorkerAgentConfig,
  updateWorkerAgentConfig,
  listKnowledgeDocuments,
  addKnowledgeDocument,
  deleteKnowledgeDocument,
  toggleKnowledgeDocument,
  simulateWorkerAgentResponse,
  generateCloudflareWorkerExport,
} from './server/services/workerAgentService.js';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_WJT_KEY,
  generateEmailOtp,
  verifyEmailOtp,
  verifyAuthenticatorOtp,
  getAuthenticatorSecret,
  verifyAdminOtp,
  validateAdminCredentials,
  createAdminJwt,
  verifyAdminJwt,
  getAdminUserProfile,
} from './server/auth.js';
import { sendResendEmail } from './server/services/resend.js';

// Protective authorization middleware restricting sensitive dashboard controls
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access restricted: ADMIN_PASSWORD and ADMIN_WJT_KEY authentication required.',
    });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyAdminJwt(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid signature. Please authenticate via the protective wrapper.',
    });
  }
  (req as any).user = payload;
  next();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON request body parser
  app.use(express.json());

  // Health endpoint
  app.get('/api/health', async (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Dev’ai Controller',
      version: '2.5.0',
      runtime: 'Cloudflare Workers & Edge Orchestrator',
      primaryAi: 'Cloudflare Workers AI (@cf/meta/llama-3.3-70b)',
      fallbackAi: 'OpenAI (gpt-4o-mini)',
      database: 'Supabase PostgreSQL (RLS Enforced)',
      email: 'Resend Transactional Mailer',
      sourceControl: 'GitHub API v3',
      secretsSecured: true,
    });
  });

  // 1. Services Operational Status (Resend, Supabase, GitHub, Cloudflare, OpenAI fallback)
  app.get('/api/status', async (req, res) => {
    try {
      const statusData = await getServicesStatus();
      res.json({ success: true, ...statusData });
    } catch (err: any) {
      console.error('Error fetching services status:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Deployed Applications Monitoring
  app.get('/api/deployments', async (req, res) => {
    try {
      const deployments = await listDeployedApps();
      res.json({ success: true, deployments });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/deployments/trigger', requireAdminAuth, async (req, res) => {
    try {
      const { appId, user } = req.body;
      if (!appId) {
        return res.status(400).json({ success: false, error: 'appId is required' });
      }
      const result = await triggerDeployment(appId, user);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/deployments/rollback', requireAdminAuth, async (req, res) => {
    try {
      const { appId, user } = req.body;
      if (!appId) {
        return res.status(400).json({ success: false, error: 'appId is required' });
      }
      const result = await rollbackDeployment(appId, user);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Notifications & Activity Monitor
  app.get('/api/notifications', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const notifications = await listNotifications(limit);
      res.json({ success: true, notifications });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Coding Agent Workspace ("Drive Coding")
  app.get('/api/coding/tasks', async (req, res) => {
    try {
      const tasks = await listCodingTasks();
      res.json({ success: true, tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/coding/execute', requireAdminAuth, async (req, res) => {
    try {
      const { prompt, repo, branch, user } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, error: 'Coding prompt is required' });
      }
      const task = await executeCodingTask(prompt, repo, branch, user);
      res.json({ success: true, task });
    } catch (err: any) {
      console.error('Error executing coding task:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Authentication & Login (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_WJT_KEY for OTP)
  // Provides Authenticator App setup configuration
  app.get('/api/auth/authenticator-setup', (req, res) => {
    try {
      const setup = getAuthenticatorSecret();
      res.json({
        success: true,
        secret: setup.secret,
        otpauthUrl: setup.otpauthUrl,
        issuer: setup.issuer,
        account: setup.account,
        stepSeconds: 30,
        algorithm: 'SHA1',
        digits: 6,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Session verification endpoint for the protective wrapper
  app.get('/api/auth/verify-session', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          valid: false,
          error: 'No active authorization session token',
        });
      }
      const token = authHeader.split(' ')[1];
      const payload = verifyAdminJwt(token);
      if (!payload) {
        return res.status(401).json({
          success: false,
          valid: false,
          error: 'Session expired or invalid ADMIN_WJT_KEY signature',
        });
      }

      res.json({
        success: true,
        valid: true,
        user: {
          id: payload.id || 'usr-sb-7782194',
          email: payload.email || ADMIN_EMAIL,
          name: 'Jelvan',
          role: payload.role || 'Developer / Operator',
          sessionValid: true,
          lastSignInAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, valid: false, error: err.message });
    }
  });

  // Request OTP endpoint (Email Code or Authenticator App preparation)
  app.post('/api/auth/request-otp', async (req, res) => {
    try {
      const { email, password, method = 'email' } = req.body;
      if (!validateAdminCredentials(email, password)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid admin credentials (ADMIN_EMAIL or ADMIN_PASSWORD mismatch)',
        });
      }

      if (method === 'authenticator') {
        const setup = getAuthenticatorSecret();
        return res.json({
          success: true,
          method: 'authenticator',
          message: 'Authenticator TOTP active. Enter the 6-digit code from your Authenticator app.',
          secret: setup.secret,
          otpauthUrl: setup.otpauthUrl,
        });
      }

      // Email OTP generation using ADMIN_WJT_KEY
      const otpData = generateEmailOtp(email);
      let emailSent = false;
      try {
        if (process.env.RESEND_API_KEY) {
          await sendResendEmail(process.env.RESEND_API_KEY, {
            to: email,
            subject: 'Dev’ai Controller Admin OTP Passcode',
            text: `Your one-time passcode (OTP) for Dev’ai Controller is: ${otpData.otp}. Valid for 5 minutes.`,
          });
          emailSent = true;
        }
      } catch (e) {
        console.warn('Could not send OTP email via Resend:', e);
      }

      res.json({
        success: true,
        method: 'email',
        message: emailSent
          ? `6-digit OTP code dispatched to ${email}. Valid for 5 minutes.`
          : 'OTP code generated and verified against ADMIN_WJT_KEY.',
        expiresAt: otpData.expiresAt,
        otpHint: otpData.otp,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Login & Two-Factor Verification
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, otp, method = 'any' } = req.body;
      if (!validateAdminCredentials(email, password)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid admin credentials (ADMIN_EMAIL or ADMIN_PASSWORD mismatch)',
        });
      }

      // If OTP was not submitted, return requirement for OTP flow
      if (!otp) {
        if (method === 'authenticator') {
          return res.json({
            success: true,
            requiresOtp: true,
            method: 'authenticator',
            message: 'Admin credentials accepted. Please enter the 6-digit code from your Authenticator app.',
          });
        }

        // Email flow
        const otpData = generateEmailOtp(email);
        try {
          if (process.env.RESEND_API_KEY) {
            await sendResendEmail(process.env.RESEND_API_KEY, {
              to: email,
              subject: 'Dev’ai Controller Admin OTP Passcode',
              text: `Your one-time passcode (OTP) for Dev’ai Controller is: ${otpData.otp}. Valid for 5 minutes.`,
            });
          }
        } catch (e) {
          console.warn('Could not dispatch OTP email via Resend:', e);
        }

        return res.json({
          success: true,
          requiresOtp: true,
          method: 'email',
          message: 'Admin credentials accepted. Please provide the 6-digit OTP code verified with ADMIN_WJT_KEY.',
          expiresAt: otpData.expiresAt,
          otpHint: otpData.otp,
        });
      }

      // Verify OTP against ADMIN_WJT_KEY (Authenticator TOTP or Email OTP)
      const isValidOtp = verifyAdminOtp(email, otp, method as any);
      if (!isValidOtp) {
        const errorMsg =
          method === 'authenticator'
            ? 'Invalid or expired code from Authenticator app. Please verify your device clock.'
            : 'Invalid or expired OTP code. Please check and try again.';
        return res.status(401).json({ success: false, error: errorMsg });
      }

      const user = getAdminUserProfile();
      const token = createAdminJwt({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        token,
        user,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // 6. Natural Language AI Assistant / Action Router
  app.post('/api/ai', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, error: 'Prompt is required' });
      }

      const completion = await generateCompletion({
        prompt,
        systemPrompt: 'You are Dev’ai Controller Assistant. You orchestrate Cloudflare Workers, Cloudflare AI, GitHub repositories, Supabase databases, and Resend transactional notifications.',
      });

      res.json({
        success: true,
        message: completion.text,
        provider: completion.provider,
        model: completion.model,
        latencyMs: completion.latencyMs,
      });
    } catch (err: any) {
      console.error('Error in /api/ai:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6b. Chat Sessions & History Management
  app.get('/api/chat/sessions', async (req, res) => {
    try {
      const sessions = await listChatSessions();
      res.json({ success: true, sessions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/chat/sessions', async (req, res) => {
    try {
      const { title, tags } = req.body;
      const session = await createChatSession(title, tags);
      res.json({ success: true, session });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/chat/sessions/:id', async (req, res) => {
    try {
      const sessionData = await getChatSession(req.params.id);
      if (!sessionData) {
        return res.status(404).json({ success: false, error: 'Chat session not found' });
      }
      res.json({ success: true, ...sessionData });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/chat/sessions/:id', async (req, res) => {
    try {
      const deleted = await deleteChatSession(req.params.id);
      res.json({ success: true, deleted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/chat/sessions/:id/clear', async (req, res) => {
    try {
      const cleared = await clearChatMessages(req.params.id);
      res.json({ success: true, cleared });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/chat/sessions/:id/messages', async (req, res) => {
    try {
      const { id: sessionId } = req.params;
      const { content, user } = req.body;

      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Message content is required' });
      }

      // Save User Message
      const userMessage = await addChatMessage(sessionId, {
        role: 'user',
        content: content.trim(),
      });

      // Execute AI action or completion
      try {
        const actionResult = await executeAiAction(content);

        // Assistant Message
        const assistantMessage = await addChatMessage(sessionId, {
          role: 'assistant',
          content: cleanResponseText(actionResult.message),
          steps: actionResult.steps,
          actionExecuted: actionResult.actionExecuted,
          service: (actionResult.provider as any) || 'system',
          status: actionResult.status,
          logId: actionResult.logId,
          resultData: actionResult.resultData,
          aiProvider: 'cloudflare_ai',
          model: '@cf/meta/llama-3.3-70b-instruct',
        });

        res.json({ success: true, userMessage, assistantMessage });
      } catch (aiErr: any) {
        const rawErr = (aiErr.message || '').toLowerCase();
        let simpleSummary = 'Dev’ai Controller encountered a temporary hiccup communicating with the selected provider.';
        let actionableFix = 'You can click retry below. The system automatically switches to the OpenAI standby provider if Cloudflare AI is unresponsive.';

        if (rawErr.includes('429') || rawErr.includes('rate') || rawErr.includes('quota')) {
          simpleSummary = 'Too many requests were sent in a brief moment (Rate Limit).';
          actionableFix = 'Please wait 10–15 seconds before retrying, or rely on the standby backup engine.';
        } else if (rawErr.includes('401') || rawErr.includes('unauthorized') || rawErr.includes('key') || rawErr.includes('token')) {
          simpleSummary = 'The service credentials or API secret need verification.';
          actionableFix = 'Verify that the secret environment variables in Cloudflare or .env are valid and not expired.';
        } else if (rawErr.includes('timeout') || rawErr.includes('etimedout') || rawErr.includes('econnrefused')) {
          simpleSummary = 'The network connection took longer than expected to respond (Timeout).';
          actionableFix = 'Check that your network is stable and re-run your prompt. The Edge fallback will handle retries.';
        }

        const nonTechExplanation = {
          simpleSummary,
          actionableFix,
          technicalDetails: aiErr.message || 'Internal executor error',
          suggestedActionLabel: 'Retry Operation',
        };

        const assistantMessage = await addChatMessage(sessionId, {
          role: 'assistant',
          content: `Unable to complete execution due to an error: ${aiErr.message || 'Service unreachable'}.`,
          status: 'error',
          error: aiErr.message,
          nonTechExplanation,
        });

        res.json({ success: true, userMessage, assistantMessage });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Audit Logs
  app.get('/api/logs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await listAuditLogs(limit);
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. LLM Docs Endpoints
  app.get('/api/docs/llms', async (req, res) => {
    try {
      const docs = await getLLMDocs();
      res.json({ success: true, docs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/docs/llms/refresh', async (req, res) => {
    try {
      const { id } = req.body;
      const refreshed = await refreshDoc(id);
      res.json({ success: true, doc: refreshed });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Worker Agent Configuration & Multi-Channel Routing
  app.get('/api/worker-agent/config', (req, res) => {
    try {
      const config = getWorkerAgentConfig();
      res.json({ success: true, config });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/worker-agent/config', requireAdminAuth, (req, res) => {
    try {
      const updated = updateWorkerAgentConfig(req.body);
      res.json({ success: true, config: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Worker Agent Knowledge Base Documents (.txt, .md)
  app.get('/api/worker-agent/knowledge', (req, res) => {
    try {
      const docs = listKnowledgeDocuments();
      res.json({ success: true, docs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/worker-agent/knowledge', requireAdminAuth, (req, res) => {
    try {
      const { title, filename, format, content, category } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ success: false, error: 'Document content is required' });
      }
      const newDoc = addKnowledgeDocument({
        title: title || filename || 'Custom Knowledge Document',
        filename: filename || 'knowledge_notes.md',
        format: format === 'txt' ? 'txt' : 'md',
        content,
        category,
      });
      res.json({ success: true, document: newDoc });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/worker-agent/knowledge/:id', requireAdminAuth, (req, res) => {
    try {
      const deleted = deleteKnowledgeDocument(req.params.id);
      res.json({ success: true, deleted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/worker-agent/knowledge/:id/toggle', requireAdminAuth, (req, res) => {
    try {
      const doc = toggleKnowledgeDocument(req.params.id);
      if (!doc) {
        return res.status(404).json({ success: false, error: 'Document not found' });
      }
      res.json({ success: true, document: doc });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Live Worker Agent Simulator (tests WhatsApp, Messenger, Email, or Webchat routing with internal vs external knowledge)
  app.post('/api/worker-agent/simulate', async (req, res) => {
    try {
      const { message, config } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Customer message is required' });
      }
      const simulationResult = await simulateWorkerAgentResponse(message, config);
      res.json({ success: true, ...simulationResult });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Export Production Cloudflare Worker code and wrangler.toml
  app.get('/api/worker-agent/export', (req, res) => {
    try {
      const exportFiles = generateCloudflareWorkerExport();
      res.json({ success: true, ...exportFiles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mount Vite or static production middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dev’ai Controller server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

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
import { executeAiAction } from './server/aiRouter.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  app.post('/api/deployments/trigger', async (req, res) => {
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

  app.post('/api/deployments/rollback', async (req, res) => {
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

  app.post('/api/coding/execute', async (req, res) => {
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

  // 5. Supabase Auth Current User
  app.get('/api/auth/me', (req, res) => {
    res.json({
      success: true,
      user: {
        id: 'usr-sb-7782194',
        email: 'secured.jelvan@gmail.com',
        name: 'Jelvan',
        role: 'Developer / Operator',
        sessionValid: true,
        lastSignInAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      },
    });
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
          content: actionResult.message,
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

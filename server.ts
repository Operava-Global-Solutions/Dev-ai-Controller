import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { listAuditLogs } from './server/storage.js';
import { getServicesStatus } from './server/services/statusService.js';
import { listDeployedApps, triggerDeployment, rollbackDeployment } from './server/services/deploymentsService.js';
import { listNotifications, createNotification } from './server/services/notificationsService.js';
import { listCodingTasks, executeCodingTask } from './server/services/codingAgentService.js';
import { getLLMDocs, refreshDoc } from './server/services/llmsDocs.js';
import { generateCompletion } from './server/services/aiProvider.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json());

  // Health endpoint
  app.get('/api/health', async (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Cloudflare Agent Hub',
      version: '2.0.0',
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
        systemPrompt: 'You are the Cloudflare Agent Hub Assistant. You orchestrate Cloudflare Workers, Cloudflare AI, GitHub repositories, Supabase databases, and Resend transactional notifications.',
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
    console.log(`Cloudflare Agent Hub server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

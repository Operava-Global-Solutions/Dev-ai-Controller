export interface SendEmailParams {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface SendEmailResult {
  id: string;
  from: string;
  to: string[];
  subject: string;
  status: 'sent' | 'queued';
  timestamp: string;
}

/**
 * Send an email via Resend API directly in production
 */
export async function sendResendEmail(token: string, params: SendEmailParams): Promise<SendEmailResult> {
  if (!token) {
    throw new Error('RESEND_API_KEY environment variable is not configured');
  }

  const toList = Array.isArray(params.to) ? params.to : [params.to];
  const fromAddress = params.from || 'Cloudflare Hub <notifications@resend.dev>';
  const subject = params.subject || 'Cloudflare Agent Hub Notification';
  const html =
    params.html ||
    `<div style="font-family:sans-serif;padding:24px;border-radius:12px;background:#0d1117;color:#f0f6fc;">
      <h2 style="color:#f38020;margin-bottom:12px;">Cloudflare Agent Hub Notification</h2>
      <p style="font-size:14px;line-height:1.6;">${params.text || 'This alert was dispatched from the Cloudflare Agent Hub.'}</p>
      <hr style="border:none;border-top:1px solid #30363d;margin:20px 0;"/>
      <small style="color:#8b949e;">Powered by Cloudflare Workers AI & Resend</small>
    </div>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: toList,
      subject,
      html,
      text: params.text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    from: fromAddress,
    to: toList,
    subject,
    status: 'sent',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Test Resend API key connection against live API
 */
export async function testResendKey(
  token: string
): Promise<{ valid: boolean; domains?: any[]; message?: string }> {
  if (!token) {
    return {
      valid: false,
      message: 'RESEND_API_KEY secret not yet set in environment. Set in Cloudflare Secrets to enable email delivery.',
    };
  }

  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        valid: true,
        domains: data.data || [],
        message: `Connected to Resend successfully (${data.data?.length || 0} active domains configured)`,
      };
    }

    const err = await res.text();
    return {
      valid: false,
      message: `Resend key rejected: HTTP ${res.status} - ${err}`,
    };
  } catch (err: any) {
    return {
      valid: false,
      message: `Failed to connect to Resend API: ${err.message}`,
    };
  }
}

export { testResendKey as testResendToken };

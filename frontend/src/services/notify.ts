import { useAppStore } from '../store/useAppStore';

// Real e-mail needs a mail service. This uses EmailJS (works from the browser, no server needed).
// Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY in a .env file.
// The EmailJS template should use the variables: {{to_email}}, {{subject}}, {{message}}.
// Without these keys every message is only recorded in the on-screen "Email outbox" (status: simulated).
const env = import.meta.env as Record<string, string | undefined>;
const SVC = env.VITE_EMAILJS_SERVICE_ID, TPL = env.VITE_EMAILJS_TEMPLATE_ID, KEY = env.VITE_EMAILJS_PUBLIC_KEY;

export async function notify(to: string, subject: string, body: string) {
  const { addMail } = useAppStore.getState();
  const base = { id: Math.random().toString(36).slice(2, 9), to, subject, body, at: new Date().toISOString() };
  if (!SVC || !TPL || !KEY || !to) { addMail({ ...base, status: 'simulated' }); return; }
  try {
    const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: SVC, template_id: TPL, user_id: KEY, template_params: { to_email: to, subject, message: body } }),
    });
    addMail({ ...base, status: r.ok ? 'sent' : 'failed' });
  } catch { addMail({ ...base, status: 'failed' }); }
}

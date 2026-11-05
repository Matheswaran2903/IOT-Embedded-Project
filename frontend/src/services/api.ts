// Copy to  src/services/api.ts  in the React project.
// Add to .env:  VITE_API_URL=http://localhost:8000
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';
const KEY = 'iot-explorer-token';

export const getToken = () => sessionStorage.getItem(KEY);
export const setToken = (t: string) => sessionStorage.setItem(KEY, t);

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? `Request failed (${res.status})`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export type Videos = Record<'tamil' | 'english', { label: string; channel: string; query: string; url: string }>;

export const api = {
  topicVideos: (id: number) => call<{ videos: Videos }>(`/api/topics/${id}/videos`),
  allVideos: () => call<{ id: number; title: string; videos: Videos }[]>('/api/videos'),
  register: async (b: { name: string; email: string; school: string; class_name: string; city?: string; parent_email?: string }) => {
    const r = await call<{ student_id: string; token: string }>('/api/students', { method: 'POST', body: JSON.stringify(b) });
    setToken(r.token); return r;
  },
  progress: () => call('/api/me/progress'),
  markLearned: (id: number) => call(`/api/me/topics/${id}/learned`, { method: 'POST' }),
  topicQuiz: (id: number) => call(`/api/topics/${id}/quiz`),
  gradeTopicQuiz: (id: number, answers: string[]) => call(`/api/topics/${id}/quiz`, { method: 'POST', body: JSON.stringify({ answers }) }),
};

export type AuthUser = { id: string; name: string; email: string; school: string; class_name: string; city: string; quiz_level: 'beginner' | 'intermediate' | 'advanced' };
export const authApi = {
  login: async (b: { email: string; password: string }) => {
    const r = await call<{ user: AuthUser; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify(b) });
    setToken(r.token); return r;
  },
  register: async (b: { name: string; email: string; password: string }) => {
    const r = await call<{ user: AuthUser; token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify(b) });
    setToken(r.token); return r;
  },
  me: () => call<AuthUser>('/api/me'),
  updateProfile: (b: { name: string; school: string; class_name: string; quiz_level: AuthUser['quiz_level'] }) => call<AuthUser>('/api/me', { method: 'PATCH', body: JSON.stringify(b) }),
  logout: () => sessionStorage.removeItem(KEY),
};

export const eventApi = {
  count: () => call<{count: number}>('/api/events/registration-count'),
  me: () => call<any>('/api/events/me'),
  mails: () => call<{id:string;to:string;subject:string;body:string;status:'sent'|'simulated'|'failed';at:string}[]>('/api/events/mails'),
  register: (body: {name?:string;school?:string;class_name?:string;parent_email:string;city:string;team:string}) => call<any>('/api/events/register',{method:'POST',body:JSON.stringify(body)}),
  slot: (body: {date:string;time:string;mode:string}) => call<any>('/api/events/slot',{method:'POST',body:JSON.stringify(body)}),
  project: (body: Record<string,unknown>) => call<any>('/api/events/project',{method:'PUT',body:JSON.stringify(body)}),
  submission: (file: File|null, link:string) => {
    const body = new FormData(); if(file) body.append('file',file); body.append('link',link);
    return call<any>('/api/events/submission',{method:'POST',body});
  },
};

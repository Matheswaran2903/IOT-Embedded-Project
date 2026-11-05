import { eventApi } from './api';
import { useAppStore, type EventState } from '../store/useAppStore';

/**
 * The SERVER is the source of truth for every event step.
 * This replaces the whole local event state with what the database says, so a step can never look
 * "done" on screen while the server has no record of it (that mismatch made the later steps fail).
 */
export async function syncEventFromServer(): Promise<EventState> {
  const r = await eventApi.me();
  const ev: EventState = {
    profile: r.profile ? { name: r.profile.name, email: r.profile.email, parentEmail: r.profile.parent_email ?? '', school: r.profile.school, className: r.profile.class_name, city: r.profile.city ?? '', team: r.profile.team ?? '', at: r.profile.at } : null,
    slot: r.slot ? { date: r.slot.date, time: r.slot.time, mode: r.slot.mode } : null,
    project: r.project ? { title: r.project.title, problem: r.project.problem ?? '', topics: r.project.topics ?? [], description: r.project.description ?? '', code: r.project.code ?? '', simId: r.project.sim_id ?? '' } : null,
    submission: r.submission ? { fileName: r.submission.file_name ?? '', fileSize: r.submission.file_size ?? 0, link: r.submission.link ?? '', at: r.submission.at } : null,
    evaluation: r.evaluation ? { scores: r.evaluation.scores, total: r.evaluation.total, remark: r.evaluation.remark ?? '', award: r.evaluation.award, at: r.evaluation.at } : null,
    certId: r.cert_id ?? null,
  };
  useAppStore.setState({ event: ev });
  return ev;
}

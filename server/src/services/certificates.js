import crypto from 'node:crypto';
import Certificate from '../models/Certificate.js';
import { HttpError } from '../utils/http.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** EIS-YYYYMMDD-XXXXXX (same shape as makeCertificateId() in the frontend), unique in the DB. */
export async function makeCertificateId() {
  const ymd = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  for (let i = 0; i < 20; i++) {
    const rand = Array.from({ length: 6 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('');
    const certId = `EIS-${ymd}-${rand}`;
    if (!(await Certificate.exists({ certId }))) return certId;
  }
  throw new HttpError(500, 'Could not create a certificate id.');
}

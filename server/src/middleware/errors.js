import multer from 'multer';
import { HttpError } from '../utils/http.js';

export const notFound = (_req, _res, next) => next(new HttpError(404, 'Route not found.'));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ detail: err.detail });
  if (err instanceof multer.MulterError) {
    return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 422).json({ detail: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large.' : err.message });
  }
  if (err?.code === 11000) return res.status(409).json({ detail: 'Duplicate value.' });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ detail: 'Invalid JSON body.' });
  if (err?.name === 'CastError') return res.status(404).json({ detail: 'Not found.' });
  console.error(err);                                   // details stay in the server log only
  res.status(500).json({ detail: 'Internal server error.' });
}

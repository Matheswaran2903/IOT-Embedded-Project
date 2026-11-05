import { HttpError } from '../utils/http.js';

/** validate(zodSchema) -> replaces req.body with the parsed (typed, trimmed) value or answers 422. */
export const validate = (schema) => (req, _res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) {
    const msg = r.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
    return next(new HttpError(422, msg));
  }
  req.body = r.data;
  next();
};

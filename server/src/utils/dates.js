/** Date helpers. Dates are ISO strings 'YYYY-MM-DD', so plain string comparison is correct. */
export const todayStr = (timeZone = 'Asia/Kolkata', now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

export function windowStatus(open, close, timeZone, now = new Date()) {
  const t = todayStr(timeZone, now);
  return t < open ? 'Not open yet' : t > close ? 'Closed' : 'Open now';
}

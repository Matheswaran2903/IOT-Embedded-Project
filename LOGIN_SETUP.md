# IoT Explorer login update

This update adds a centered, dark navy-and-electric-blue authentication screen to the existing frontend and adds compatible email/password authentication endpoints to the existing Express/MongoDB backend.

## What changed

- `/login` is the entry point. All other app routes require a valid session; guest exploration is disabled as requested.
- Sign in and Create account are presented in one centered card.
- Password visibility toggle, inline validation, and API error messages are included.
- Successful login/register stores the existing bearer-token format used by the rest of the project.
- A Sign out action is available in the main navigation.
- New backend endpoints: `POST /api/auth/register` and `POST /api/auth/login`.
- Passwords are stored as salted Node.js scrypt hashes. The original `/api/students` registration route and all existing API routes remain in place.

## Run locally

1. In `server`, install dependencies with `npm install`, configure `.env` using `.env.example`, then run `npm run dev`.
2. In `frontend`, install dependencies with `npm install`, configure `.env` using `.env.example` (set `VITE_API_URL` to your backend URL; default is `http://localhost:8000`), then run `npm run dev`.
3. Open the Vite URL and create an account, then sign in.

New accounts created through this login page are saved as general/independent learners. Existing token-only accounts created by the older registration endpoint continue to work with their previously stored bearer token, but they do not automatically have a password login until a password is set through a separate account-recovery process.

# Event and student progress update

- Event registration, presentation booking, project saving, and submissions now call the existing authenticated server endpoints. Server failures are displayed instead of silently marking steps complete.
- A database-backed registration counter was added at GET /api/events/registration-count. Requires a running MongoDB backend; no fabricated count is shown when unavailable.
- Events loads the signed-in student's backend event record when opened. Judge scoring must be performed through the existing protected backend endpoint; the demo frontend judge button no longer publishes scores.
- Learning progress is now isolated by authenticated student ID in this browser, preventing progress from being shared when accounts switch on the same device. **It is not yet synced across different browsers or devices**; that requires persisting all learning activities to the server and loading them at sign-in.
- A real email delivery provider must be configured on the server. Do not interpret browser notifications as confirmed delivery.
- Event registration dates, server setup and upload configuration must be valid. Build verification requires installing frontend npm dependencies.

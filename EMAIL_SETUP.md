# Email setup (emails go to the e-mail the student signed up / logged in with)

The server sends these mails automatically to **the account's own e-mail**:

| When | Mail |
|------|------|
| Create account | "Welcome to IoT Explorer - your account is ready" |
| Sign in | "New sign-in to your IoT Explorer account" |
| Register for the event | "Registration confirmed" (also to the parent/teacher e-mail if given) |
| Book slot / save project / submit / result | status mails to the same addresses |

## Switch real delivery ON (required - otherwise mails are only "simulated")
1. In `server/`, copy `.env.example` to `.env`.
2. Fill in (Gmail example):
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=youraddress@gmail.com
   SMTP_PASSWORD=your-16-letter-app-password
   MAIL_FROM=youraddress@gmail.com
   ```
   Gmail needs 2-Step Verification ON, then create an **App Password** (Google Account > Security > App passwords). Your normal Gmail password will NOT work.
3. Restart the server: `npm run dev`. The console must print `E-mail: SMTP ready ... Real mails will be delivered.` If it prints a warning/FAILED line, the settings are wrong.
4. Create a NEW account with an inbox you can open. Check Spam/Promotions too.

The Events page > "Email notifications" box shows each mail's status: `sent`, `simulated` (SMTP not configured) or `failed`.
Never commit the real `.env` file or share the App Password.

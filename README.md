# Shree Krishna EduTech - Real Registration + OTP Package

This package replaces the previous simulated OTP flow with a real backend-driven registration flow.

## Stack
- Node.js 20+
- Express
- MongoDB Atlas
- MSG91 V5 OTP
- Optional Google Apps Script -> Google Sheet
- JWT for future login/session handling

## Folder structure

backend/
  src/
  package.json
  .env.example

frontend/
  register.html

google-apps-script/
  Code.gs
  README.md

## 1. Backend setup locally

Open a terminal inside `backend`:

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

Then set:
- MONGODB_URI
- FRONTEND_ORIGIN
- MSG91_AUTHKEY
- MSG91_TEMPLATE_ID
- JWT_SECRET
- GOOGLE_APPS_SCRIPT_URL (optional)

Start:

```bash
npm start
```

Health check:

http://localhost:5000/health

## 2. MSG91 setup

MSG91 V5 SendOTP is used for sending OTPs. Verify OTP is called from the backend using the auth key in a server-side header. See the current MSG91 documentation before production activation.

For an Indian SMS setup, make sure the required sender/template/DLT configuration is completed in MSG91.

## 3. Frontend setup

The supplied `frontend/register.html` defaults to:

http://localhost:5000

After deploying the backend to Render, change:

```js
const API_BASE_URL = "http://localhost:5000";
```

to your Render backend URL, for example:

```js
const API_BASE_URL = "https://your-backend-name.onrender.com";
```

Also make sure `images/logo.png` is available at the relative path expected by the page, or change that path to your site's existing logo location.

## 4. Render deployment

Create a new Web Service on Render using the `backend` directory.

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Set all environment variables from `.env` in the Render Environment tab.

## 5. Google Sheets

The registration can optionally sync to your Google Sheet through the Apps Script URL in `GOOGLE_APPS_SCRIPT_URL`.

Follow `google-apps-script/README.md`.

## Important security notes

- Never put MSG91_AUTHKEY in browser code.
- Use HTTPS in production.
- Use a long random JWT_SECRET.
- Restrict FRONTEND_ORIGIN to your real site after testing.
- Keep MongoDB credentials only in environment variables.

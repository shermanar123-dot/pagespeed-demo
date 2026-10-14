# Website Speed Check — classroom demo

A one-page tool: type a website URL, click "Check Site," and it calls the real Google PageSpeed Insights API server-side, using a key stored in `.env` (never exposed to the browser).

## Setup (do this before class)

1. Make sure Node.js 18 or newer is installed: `node -v`
2. In this folder, install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to a new file named `.env`, then paste your real API key:
   ```
   PAGESPEED_API_KEY=your-real-key-here
   ```
4. Start the server:
   ```
   npm start
   ```
5. Open `http://localhost:3000` in your browser.

## Using it live in class

- The URL field defaults to `store.google.com` — just hit "Check Site."
- Toggle Mobile/Desktop before running.
- Each check takes 15–30 seconds (that's Google's Lighthouse actually running against the live page) — say something while it loads rather than standing in silence.
- The "Show raw API response" button reveals the full JSON payload — use it to make the "a human has to parse this" point, then collapse it back to the clean score cards.
- Students can type their own site's URL live if you want audience participation.

## Before demo day

- Test this on the actual wifi/network you'll be presenting on, not just at home — API calls need real internet access.
- Take a screenshot of a successful run as your backup slide in case the connection drops during class.
- Your `.env` file is never shared or committed anywhere — it's local to this folder only.

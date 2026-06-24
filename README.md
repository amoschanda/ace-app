# Ace AI Social Manager

The ultimate AI-powered dashboard to manage your social presence, audit your content, and automate workflows via Pipedream.

## Features
- **AI TikTok Auditor**: Automatically scan your TikTok profile (mocked) and get AI-driven recommendations on which videos to delete to improve engagement.
- **Pipedream Integration**: Easily connect your AI auditor to Pipedream webhooks to trigger downstream automations.
- **Modern Dashboard**: Track your social stats and recent AI activities in a sleek, user-friendly interface.
- **Secure Auth**: Powered by Clerk for a seamless sign-in experience.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS (v4)
- **Backend**: Node.js, Express, TypeScript
- **AI**: Google Gemini (AI content analysis)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Create a `.env` file with:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `RESEND_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`

3. **Run in Development**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Workflow
1. Sign in via Clerk.
2. Navigate to **AI TikTok Auditor** to run a content scan.
3. Review AI suggestions for video deletions.
4. Use the **Pipedream** tab to connect your audit results to other apps.

# Deploying UniqueWellness to Netlify

I cannot deploy to an external hosting account by myself because I don't have access to your Netlify/Vercel credentials or GitHub account. I can, however, add CI and deployment configuration so the site deploys automatically when you provide the necessary secrets.

Steps to deploy using Netlify (recommended, repo already contains `netlify.toml`):

1. Push this repository to GitHub (create a new repo and push `main`).

2. Create a Netlify site:
   - Sign in to Netlify and create a new site from Git.
   - Connect the GitHub repo you pushed.
   - For the build settings, use:
     - Build command: `npm run build`
     - Publish directory: `dist`
       - Branch to deploy: `main`
       - Base directory: `.` (root of repo)
       - Functions directory: `netlify/functions`

3. Add environment variables in Netlify Site settings → Build & deploy → Environment:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = your Supabase anon/public key
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_PUBLISHABLE_KEY` = your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key (secret; only on server)

4. (Optional / alternative) Use GitHub Actions auto-deploy: I added `.github/workflows/deploy-netlify.yml` which builds and uses `netlify-cli` to deploy. To use it, add the following GitHub repository secrets:
   - `NETLIFY_AUTH_TOKEN` — create a Personal Access Token in Netlify (User settings → Applications → Personal access tokens).
   - `NETLIFY_SITE_ID` — available from Netlify site settings (Site details).
   - The other Supabase envs also need to be set as GitHub secrets if you want the build to access them: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

5. Run the Supabase migration for the `password_reset_requests` table:
   - Open your Supabase project → SQL Editor → paste `supabase/migrations/20260517183000_1a9f3b-password-reset-requests.sql` and run it.

6. Trigger a deployment:
   - Push to `main` or go to GitHub Actions → run workflow manually (Workflow: Deploy to Netlify → Run workflow).
   - Or let Netlify build via its Git integration.

7. Verify:
   - Visit the deployed site URL from Netlify.
   - Log in and test the Forgot Password flow; check Admin → Password Requests.

If you want me to finish the last mile (create the GitHub repository and set up the deployment automatically), you'll need to provide either:
  - A GitHub access token with repo + workflow permissions and an existing Netlify token, or
  - Add me as a collaborator/CI bot (not possible from this environment).

Tell me which provider you prefer (Netlify or Vercel) and whether I should add a Vercel workflow as well. If you'd like, I can also prepare a small admin action to apply requests (approve + update user password) — but that requires careful handling of the service role key and extra auth checks.

## Environment variables

This project requires several environment variables for local development, CI builds, and server-side operations. Do NOT commit secret values to source control. Use Netlify's UI or GitHub repository secrets for deployment.

- `.env.example` (added to repo): copy it to `.env` for local development and replace placeholders with real values. Example file contains the required keys.

- Required variables (summary):
   - `VITE_SUPABASE_URL` (client build)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (client build)
   - `SUPABASE_URL` (server)
   - `SUPABASE_PUBLISHABLE_KEY` (server/client optional)
   - `SUPABASE_SERVICE_ROLE_KEY` (server **secret** — used by server functions)
   - `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` (only if using GitHub Actions auto-deploy)
   - `VERCEL_TOKEN` (only if deploying to Vercel via API)

### Netlify: add environment variables

1. Go to your Netlify site → Site settings → Build & deploy → Environment.
2. Add each variable using **Key** and **Value**. For secrets, set values in Netlify's UI; they will be masked.
3. Scopes / contexts: choose `All deploy contexts` to make a variable available during build, post-processing and functions. To limit a variable to serverless functions only, set the scope to `Functions` (or use different contexts like `production`).
4. Example (recommended): set `VITE_SUPABASE_*` and `SUPABASE_*` in `All deploy contexts`, and also set `SUPABASE_SERVICE_ROLE_KEY` in `All deploy contexts` if your server build needs it. Keep in mind client-side variables are visible in the built JS — do NOT put service role keys in client-exposed variables.

Netlify CLI alternative (set a variable for production):

```bash
netlify env:set VITE_SUPABASE_URL "https://your-project-ref.supabase.co" --context production
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-service-role-key" --context production
```

### GitHub Actions / GitHub Secrets

If using the provided GitHub Actions workflow, store secrets in your repository settings → Secrets and variables → Actions. Example using `gh`:

```bash
gh secret set NETLIFY_AUTH_TOKEN --body "YOUR_NETLIFY_TOKEN"
gh secret set NETLIFY_SITE_ID --body "YOUR_SITE_ID"
gh secret set VITE_SUPABASE_URL --body "https://your-project-ref.supabase.co"
gh secret set VITE_SUPABASE_PUBLISHABLE_KEY --body "PUBLIC_KEY"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "SERVICE_ROLE_KEY"
```

### Local development

1. Copy `.env.example` to `.env`.
2. Fill in values. Start dev server:

```bash
npm ci
npm run dev
```

### Security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. Keep it in server-side / CI secrets only.
- Use branch-specific contexts if you need different staging / production values.


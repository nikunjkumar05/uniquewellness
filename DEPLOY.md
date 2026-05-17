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

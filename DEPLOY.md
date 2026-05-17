# Deployment

This project no longer includes Netlify-specific deployment configuration.

Deployment providers you can use:

- Vercel: recommended for serverless hosting and easy Git integration. Vercel builds use Nitro output.
- Cloudflare Pages / Workers with the existing `wrangler.jsonc` configuration.

General steps:

1. Set required environment variables in your provider or CI secrets (see `.env.example`).
2. Build with `npm run build`.
3. On Vercel, keep the Framework Preset as TanStack Start or Nitro and do not override the output directory to `dist`. Nitro writes the Vercel Build Output API files to `.vercel/output`.
4. For Cloudflare, run the normal build without the Vercel environment and deploy with the existing `wrangler.jsonc` configuration.

If you'd like, I can add a GitHub Actions workflow for Vercel or update this guide for a specific provider.

### GitHub Actions / GitHub Secrets

If using the provided GitHub Actions workflow, store secrets in your repository settings → Secrets and variables → Actions. Example using `gh`:

```bash
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


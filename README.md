# Unique Wellness Institute

Unique Wellness Institute is a TanStack Start web application for a coaching and wellness platform. It includes public program pages, authentication, student/coach/admin dashboards, Supabase-backed data, and EnableX live-class room support.

## Features

- Public pages for chess coaching, career guidance, wellness programs, founder profile, demo booking, and contact.
- Email/password and Google-based auth flows with forgot/reset password screens.
- Protected dashboard shell with role-specific student, coach, admin, content, settings, and live-room pages.
- Supabase integration for auth, profiles, roles, enrollments, courses, live classes, content, and testimonials.
- EnableX server functions for creating rooms and generating live-class join tokens.
- Reusable Radix/shadcn-style UI components, Tailwind CSS styling, and Lucide icons.
- Vite/TanStack Start build configured for SSR and Cloudflare-style deployment.

## Tech Stack

- React 19
- TanStack Start, TanStack Router, TanStack Query
- TypeScript
- Vite
- Tailwind CSS 4
- Supabase
- EnableX video APIs
- Radix UI primitives
- ESLint

## Getting Started

### Prerequisites

- Node.js 22 or newer recommended
- npm
- A Supabase project
- EnableX app credentials, if live classes are enabled

### Install

```bash
npm install
```

### Environment

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Fill in the values:

```env
# Client-safe Supabase settings
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"

# Vite-exposed client variables
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
VITE_SUPABASE_PROJECT_ID="your-project-ref"

# Server-only Supabase secret for admin actions
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# EnableX live-class credentials
ENABLEX_APP_ID="your-enablex-app-id"
ENABLEX_APP_KEY="your-enablex-app-key"

# Optional Vite aliases for EnableX in local dev
# VITE_ENABLEX_APP_ID="your-enablex-app-id"
# VITE_ENABLEX_APP_KEY="your-enablex-app-key"
```

`SUPABASE_SERVICE_ROLE_KEY` is used by server-side admin functionality. Keep it only in trusted server/deployment environments and never expose it through `VITE_*` variables.

### Run Locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Scripts

| Command             | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the Vite dev server.                     |
| `npm run build`     | Build the production client and server output. |
| `npm run build:dev` | Build using development mode.                  |
| `npm run preview`   | Preview the production build locally.          |
| `npm run lint`      | Run ESLint.                                    |
| `npm run format`    | Auto-fix lint issues with ESLint.              |

## Project Structure

```text
src/
  assets/                 Static brand and program media
  components/site/        Site-specific layout and marketing components
  components/ui/          Reusable UI primitives
  hooks/                  Shared React hooks
  integrations/           Supabase integration code
  lib/                    Server functions, auth helpers, error handling, utilities
  routes/                 TanStack Router file-based routes
  router.tsx              Router creation
  server.ts               SSR server entry wrapper
  start.ts                Client entry
  styles.css              Global Tailwind/theme styles
supabase/
  migrations/             Database schema migrations
```

## Main Routes

- `/` - home page
- `/chess` - chess coaching
- `/career` - career guidance
- `/wellness` - wellness programs
- `/founder` - founder profile
- `/book-demo` - demo booking
- `/contact` - contact page
- `/login`, `/signup`, `/forgot-password`, `/reset-password` - auth flows
- `/_authenticated/student` - student dashboard
- `/_authenticated/coach` - coach dashboard
- `/_authenticated/admin` - admin dashboard
- `/_authenticated/content` - course/content management
- `/_authenticated/live-room` - live class room
- `/_authenticated/settings` - account settings

## Database

Supabase migrations live in `supabase/migrations`. Apply them to your Supabase project before using the authenticated dashboards.

The app expects tables and policies for profiles, user roles, courses, enrollments, live classes, content, demo bookings, contact messages, and testimonials.

## Deployment

The repository includes:

- `wrangler.jsonc` for Cloudflare-oriented runtime configuration.
- `vite.config.ts` using standard Vite, TanStack Start, Tailwind, and Cloudflare plugins.

Set all production environment variables in the deployment provider. Do not commit `.env`, `.dev.vars`, `dist`, `.wrangler`, or dependency/build cache directories.

## Quality Checks

Before pushing changes:

```bash
npm run format
npm run lint
npm run build
```

`npm run lint` may report React Fast Refresh or hook dependency warnings. Treat new warnings as review items before merging.

# Grantly deployment guide

## Runtime and data model

Grantly is a static React single-page application built with Vite. It has no backend, API keys, environment variables, or database migrations. Scholarship records are fictional sample data and browser state is stored in `localStorage` under `grantly:v1`; each browser/device has its own profile and tracker. Do not treat the sample listings as real scholarship opportunities or use this as a production application-processing system without adding a trusted data source, privacy review, and backend.

The project pins Node `22.23.4` in `.nvmrc`, declares Node `>=22.12.0`, and uses the committed `package-lock.json` with npm 10.

## Deploy to Vercel

1. Import the project repository in Vercel, or run `npx vercel` from the project root and follow Vercel's login/project prompts.
2. Use the settings already declared in `vercel.json`: install `npm ci`, build `npm run build`, and publish `dist`.
3. Deploy a preview first. Verify `/`, `/discover`, `/tracker`, `/calendar`, `/documents`, and `/profile` load directly (including after a hard refresh). Then promote/deploy to production from the Vercel project dashboard or CLI.
4. No environment variables are required for this demo.

The `vercel.json` rewrite serves the SPA entry for app paths, and `public/manus-routes.json` declares the page route inventory. If hosting somewhere else, configure the host to fall back to `/index.html` for these app routes while still serving static files normally.

## Local production build and smoke check

```bash
nvm use                 # if nvm is installed; .nvmrc selects 22.23.4
npm ci
npm run build
npm run preview -- --host 0.0.0.0
```

In a second terminal, check that the build output and route fallback are being served:

```bash
for path in / /discover /tracker /calendar /documents /profile; do
  printf '%-12s ' "$path"
  curl -s -o /dev/null -w '%{http_code} %{content_type}\n' "http://localhost:4173$path"
done
curl -fsS http://localhost:4173/manus-routes.json
```

Expected: each app path returns `200 text/html`; `/manus-routes.json` returns JSON. Vercel direct-route behavior should still be confirmed on a preview deployment.

## Manual product smoke checklist

- Search from the header (including Ctrl/Cmd+K), use query search, all five filters/sorts, eligible-only, clear filters, and an empty result.
- Save an opportunity; open details; verify eligibility breakdown and document status; start an application and confirm it appears in Drafting.
- Move a tracked item through stages, edit notes and blur the field, remove an item, and refresh to confirm profile/tracker/document changes persist.
- Browse calendar months, select a day with a deadline, open details, and toggle tracked-only mode.
- Mark a required document ready and confirm the application progress indicator changes; verify the all-ready state.
- Edit profile fields/categories and GPA, confirm match/eligible counts update, then test Reset demo data and cancel/confirm behavior.
- Test keyboard-only navigation, Escape and focus return for dialogs, and narrow viewport layouts at 360px, 768px, and 1440px.

## Current constraints

Only the production build and static route/asset checks are automated in this archive; interactive browser checks must be completed against a Vercel preview. The experience is client-only and stores state per browser, with no account synchronization, real scholarship provider integrations, submission workflow, or cross-device backup.

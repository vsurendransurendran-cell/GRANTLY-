# GRANTLY implementation plan

## Scope and architecture

Deliver the requested scholarship command center as a client-only React + Vite single-page app. Use JavaScript, Tailwind CSS v4 through `@tailwindcss/vite`, Lucide React, Framer Motion, and React Router. Keep scholarship data and eligibility evaluation local and deterministic; persist the profile, applications, and document readiness in safe `localStorage` under `grantly:v1`. There is no backend or external API. Use self-contained CSS illustration art rather than project-external storage URLs so the archive and Vercel build are portable. Use the `vercel.json` SPA rewrite for direct route visits.

The implementation proceeds in the user's five batches: (1) Vite foundation, sample data, date/format/match utilities, reducer/context, and a small proof screen; (2) layout, routing, reusable UI, discovery and detail drawer; (3) tracker, calendar, and documents; (4) home, profile, and navigation extras; (5) code-review fixes, manual checklist, and Vercel steps. Keep the route manifest synchronized with implemented routes and use complete, independently usable source files for each batch.

## Design direction

- **Design movement:** Premium dark “dream path,” following the supplied art direction.
- **Core principles:** Explainable before persuasive; calm and legible; deadline states use text and icons as well as color; touch and keyboard interactions share equal capability.
- **Color philosophy:** Deep ink establishes focus, warm gold marks aspiration and primary actions, and teal signals clarity and progress. Urgent, soon, and violet tokens are reserved for semantic states and accents.
- **Layout paradigm:** A floating navigation shell and editorial hero lead into compact operational views; desktop boards can spread horizontally while small screens use stacked cards or scroll-snap columns.
- **Signature elements:** A CSS-illustrated castle-and-luminous-path hero scene with four related feature-card motifs; restrained translucent glass surfaces; a small gold star in the GRANTLY wordmark.
- **Interaction philosophy:** Every control has a real state transition or destination; match explanations and document readiness are visible at the point of decision.
- **Animation:** Use Framer Motion for restrained page/card/modal transitions; honor `prefers-reduced-motion` in JavaScript and CSS.
- **Typography:** Cormorant Garamond for large display headlines and italic gold accent words; Inter for interface copy, with system fallbacks.
- **Brand essence:** A personal scholarship command center that makes discovery, eligibility, and follow-through understandable; clear, encouraging, dependable.
- **Brand voice:** Direct, warm, and specific. Example: “See why this scholarship fits.” “Your next step, made clear.”
- **Wordmark and color:** Custom-feeling GRANTLY letter spacing paired with a gold star; signature gold `#F2C879` against ink.

## Project structure

- `src/data/`: option lists and the 16 fictional, relative-deadline scholarship records.
- `src/lib/`: weighted rule-based matching, local-date and urgency helpers, and currency formatting.
- `src/context/`: safe persisted reducer state and shared toast support.
- `src/components/`: reusable UI, layout, home, discover, tracker, and calendar views.
- `src/pages/`: route-level pages.
- `src/App.jsx` and `src/main.jsx`: router shell and application bootstrap.
- `src/index.css`: Tailwind import, `@theme` tokens, shared styles, and motion preferences.
- `public/manus-routes.json`: current implemented page-route manifest.

# Auto Nirman Current Context

Last updated: 21 May 2026

Auto Nirman is an AI-powered construction intelligence platform for India. The product is moving from simple construction utilities into a premium AI-assisted construction planning suite where users can upload project inputs, estimate costs, analyze BOQs, generate floor plans, ask construction questions, and eventually experience a realistic virtual house tour.

The core product direction is: make construction planning feel trustworthy, visual, intelligent, and emotionally engaging enough that homeowners, developers, and project teams would pay for it.

## Product Vision

Auto Nirman should feel like a premium construction command center, not a static website or a colored PDF. The desired experience is futuristic, interactive, high-trust, and practical for Indian construction users.

Important product principles:

- Every feature should connect back to real construction decisions, cost, planning, quality, and execution.
- AI output should not feel random or decorative.
- Visual planning should look closer to professional architecture/civil engineering output than a simple diagram.
- The UI should feel alive through hover, tap, motion, responsive panels, active cards, command-style headers, and useful state.
- Mobile should feel intentionally designed, not just squeezed desktop UI.
- The long-term direction includes realistic 3D house walkthroughs where users can virtually visit every room and emotionally connect with the design.

## Tech Stack

- Framework: Next.js App Router
- Frontend: React, TypeScript
- Styling: Tailwind CSS and global custom CSS utilities
- Animation/UI: Framer Motion, React Icons, Lucide, Lottie
- AI: Groq API using OpenAI-compatible chat completions
- 2D map rendering: SVG and canvas export
- Boundary detection: OpenCV.js backend route
- 3D prototype: Three.js
- Auth dependency present: NextAuth

Package highlights:

- `next`: 16.2.4
- `react`: 19.0.0
- `typescript`: 5.x
- `three`: 0.184.0
- `@techstark/opencv-js`: 4.12.0
- `framer-motion`: 12.23.0

## Current Main Routes

- `/` - Home page with interactive product positioning and premium hero UI.
- `/login` - Strongest visual reference page; high-quality dark futuristic login UI.
- `/signup` - Signup page.
- `/dashboard` - Main command dashboard and tool hub.
- `/dashboard/2d-map-generator` - 2D floor-plan input flow.
- `/dashboard/2d-map-generator/result` - SVG/JPEG-ready generated floor-plan output.
- `/dashboard/cost-estimator` - Indian construction cost estimator.
- `/dashboard/cost-estimator/result` - Estimator result page.
- `/chatbot` - Auto Nirman AI chatbot.
- `/dashboard/boq-upload` - BOQ upload entry.
- `/dashboard/boq-result` - BOQ analysis result/demo experience.
- `/dashboard/future-home-walkthrough` - Realistic room tour prototype route.
- `/dashboard/smart-construction-planner` - Smart planner route.
- `/dashboard/smart-construction-output` - Smart planner output route.

## Current Major Modules

### 1. Dashboard

The dashboard is the central premium tool hub. It links users to BOQ analysis, cost estimation, AI chatbot, 2D map generation, and other planning tools.

Recent improvements:

- More interactive command-center style.
- Live focus/search panel.
- Recent activity style sections.
- Continue-work style panels based on local session data.
- Premium dark/futuristic cards and hover/tap effects.
- Mobile touch feedback added without disturbing desktop hover behavior.

Key files:

- `src/app/dashboard/page.tsx`
- `src/app/globals.css`
- `src/components/Navbar.tsx`

### 2. BOQ Analysis

The BOQ module is intended to let users upload BOQ/project data and get construction intelligence around cost leakage, quantity anomalies, contractor risk, and project-level insights.

Current state:

- BOQ upload and BOQ result pages exist.
- BOQ result is currently more of a premium/demo-style output experience than a fully connected production analyzer.
- There are utilities for readable JSON and BOQ PDF/report handling.

Key files:

- `src/app/dashboard/boq-upload/page.tsx`
- `src/app/dashboard/boq-result/page.tsx`
- `src/utils/boqPdfReport.ts`
- `src/utils/jsonToReadableLines.ts`
- `src/utils/cleanSmartLayoutResponse.ts`

### 3. Cost Estimator

The cost estimator is a rule-based Indian construction cost estimation tool.

Inputs include:

- Plot or built-up area
- City tier
- Quality level
- Number of floors
- House type
- Add-ons

Outputs include:

- Estimated construction cost
- Cost range
- Timeline
- Breakdown

Recent improvements:

- More premium header section.
- Live estimate signal.
- Mobile progress strip.
- Sticky mobile CTA.
- Better interactive feel.

Key files:

- `src/components/CostEstimator.tsx`
- `src/lib/estimator.ts`
- `src/lib/pricingDb.ts`
- `src/lib/useEstimator.ts`
- `src/types/estimator.ts`
- `src/app/api/estimate/route.ts`
- `src/app/dashboard/cost-estimator/page.tsx`
- `src/app/dashboard/cost-estimator/result/page.tsx`

### 4. AI Chatbot

The chatbot is a construction-focused assistant powered by Groq. It handles BOQ, cost, planning, vendor, and project guidance.

Current AI behavior:

- Uses a stable Auto Nirman system prompt.
- Focuses on Indian construction planning and practical recommendations.
- Avoids generic encyclopedia-style answers.
- Encourages professional verification for structural/legal approvals.

Recent Groq prompt-cache work:

- Static prompts moved into shared constants.
- Default model configured as `openai/gpt-oss-120b` through `GROQ_CACHE_MODEL`.
- Environment override available using `GROQ_MODEL`.
- Cache stats are extracted from `usage.prompt_tokens_details.cached_tokens`.
- Returned/logged cache fields:
  - `promptTokens`
  - `cachedTokens`
  - `cacheHitRate`

Key files:

- `src/app/api/chat/route.ts`
- `src/lib/groqPrompts.ts`
- `src/components/chat/ChatWindow.tsx`
- `src/components/Chatbot.tsx`
- `src/app/chatbot/page.tsx`

### 5. 2D Map Generator

The 2D map generator creates JPEG-ready architectural floor-plan outputs. It supports rectangular plots and irregular traced plots.

Capabilities:

- User can enter plot dimensions and planning preferences.
- User can upload a plot boundary image.
- Backend OpenCV route detects boundary from image.
- AI route can generate planning suggestions.
- Layout engine generates rooms, doors, windows, scores, and notes.
- Result page renders a premium SVG floor plan.
- JPEG export/download flow exists.

Recent major upgrade:

- Replaced simple rectangular layout feeling with polygon-based SVG floor-plan rendering.
- Rooms can use polygon points.
- Irregular plot polygon is the main visual container.
- SVG uses auto-fit viewBox logic.
- Rooms have gradients, translucent colors, glows, hover/selection states, schedule, and metrics.
- Labels were refined to reduce overlap, auto-scale, and keep small rooms readable.
- Removed ugly badges such as `P1`, `DN3`, etc.
- Added creator branding inside SVG, top-right, with Auto Nirman logo treatment.
- Download button simplified to `Download`.
- Removed extra/cringey result page tab/header language.
- Reduced vacant space between plot outline and generated room layout.

Current goal for this module:

- Output should look like professional architectural SaaS output.
- It should feel accurate, clean, spacious, and premium.
- No room should visually overflow outside plot boundary.
- The map should use as much plot area as possible without clutter.

Key files:

- `src/components/Map2DGenerator.tsx`
- `src/components/Map2DResult.tsx`
- `src/components/Map2DCanvas.tsx`
- `src/lib/map2d/generateLayout.ts`
- `src/types/map2d.ts`
- `src/app/api/map2d/ai-plan/route.ts`
- `src/app/api/map2d/detect-boundary/route.ts`
- `src/app/dashboard/2d-map-generator/page.tsx`
- `src/app/dashboard/2d-map-generator/result/page.tsx`

### 6. Realistic Room Tour / Future Home Walkthrough

This is the newest experimental module. The long-term goal is to move from cartoon-like 3D output to a realistic interior room tour where users can emotionally experience their future home.

Current implementation:

- Route exists at `/dashboard/future-home-walkthrough`.
- Three.js-based prototype exists.
- Tier-based interior system exists.
- User can select a room and interior tier.
- Visuals, materials, furniture quality, lighting, and estimated cost are linked to the selected tier.
- The module can use generated 2D layout rooms from local storage where available, otherwise falls back to sample rooms.

Interior tiers:

- Basic - Rs 950/sq ft
- Standard - Rs 1,450/sq ft
- Premium - Rs 2,350/sq ft
- Luxury - Rs 3,800/sq ft
- Super Luxury - Rs 6,200/sq ft

Each tier controls:

- Flooring
- Wall finish
- Ceiling
- Lighting
- Furniture level
- Kitchen/bath fittings
- Decor density
- Cost per sq ft
- Render colors/material style

Known quality issue:

- The first realistic tour output still looked too blocky/cartoonish and not emotionally convincing.
- A later pass started reframing the scene to show one selected room at a time instead of cramming all rooms together.
- The next design push should focus on true interior realism: better furniture shapes, proportions, camera framing, texture detail, lighting softness, decor, wall treatment, rugs, curtains, fixtures, and believable scale.

Key files:

- `src/app/dashboard/future-home-walkthrough/page.tsx`
- `src/components/tour/RealisticRoomTour.tsx`
- `src/components/tour/TierSelector.tsx`
- `src/components/tour/RoomCostPanel.tsx`
- `src/components/tour/MaterialBreakdown.tsx`
- `src/data/interiorTiers.ts`
- `src/components/FutureHomeWalkthrough.tsx`

## UI Direction

The visual target is dark futuristic premium SaaS with a construction intelligence identity.

Current desired feel:

- Login page quality should be the benchmark for every major page.
- Headers should not feel like plain bold text.
- Pages should not feel static.
- Desktop should have hover glows, depth, and responsive panels.
- Mobile should have tap feedback, sticky CTAs, progress strips, and touch-first polish.
- Copy should be sharp and short, not overly descriptive headers like "Generate a futuristic 2D floor map as JPEG."

Global UI helpers added:

- `living-surface`
- `live-grid`
- `signal-sweep`
- `pulse-dot`
- `command-header-card`
- `premium-console-card`
- Mobile touch feedback under coarse pointer media query

Key file:

- `src/app/globals.css`

## Current Repository State

Latest known committed work:

- `e34fb5f` - Upgrade AI map result experience
- `87f57d5` - Make dashboard and tools feel alive

Currently uncommitted changes exist:

- `src/app/api/chat/route.ts`
- `src/app/api/map2d/ai-plan/route.ts`
- `src/app/dashboard/future-home-walkthrough/page.tsx`
- `src/components/tour/`
- `src/data/`
- `src/lib/groqPrompts.ts`

Meaning:

- The 2D map result upgrades and interactive dashboard/tool UI were pushed previously.
- The realistic room tour prototype and Groq prompt-cache changes are present locally but should be reviewed and committed when ready.

## Latest Validation

After Groq prompt-cache changes:

- `npx tsc --noEmit` passed.
- `npm run build` passed.

Build warning:

- Next.js detects multiple `package-lock.json` files and infers workspace root from `C:\Users\snigd\package-lock.json`.
- Build still succeeds.
- This can be cleaned later by setting `turbopack.root` in Next config or removing unnecessary higher-level lockfiles.

## Environment Variables

Expected important environment variables:

- `GROQ_API_KEY`
- `GROQ_MODEL` optional override

Default Groq model in code:

- `openai/gpt-oss-120b`

## Important Product Taste Notes

The founder/user preference is very clear:

- Avoid the word and mindset of "MVP."
- Do future-critical things early if they define the quality bar.
- Do not ship random-looking AI outputs.
- The product should feel worth paying for.
- Auto Nirman should not feel like a static PDF with colors.
- The 2D plan should feel like professional architecture/civil engineering output.
- The 3D tour should become as realistic as possible, not a toy scene.
- The product should build emotional attachment, especially in future home visualization.

## Current Weaknesses / Risks

- BOQ analysis appears partly demo/static and needs stronger real upload-to-analysis production logic.
- 3D room tour is not yet at the desired realism level.
- 2D layout generation has improved, but true architectural optimization is still a hard problem and needs deeper geometry/planning intelligence.
- AI floor-plan suggestions are schema-limited and currently produce rectangular room suggestions before local layout refinement.
- No robust backend database layer is visible in the current frontend repo.
- Auth exists through dependencies/routes, but production user/account flows need review.
- Multiple package lockfiles cause a workspace-root warning during build.
- Some older components still exist alongside newer upgraded ones, so cleanup/refactor will be needed.

## Suggested Next Development Priorities

1. Realistic 3D Tour Quality Jump

   Focus on one room at a time and make it beautiful before expanding. Improve camera framing, furniture, walls, ceiling, lighting, rug, curtains, windows, decor, materials, and proportions. Avoid blocky placeholder visuals.

2. 2D Plan Intelligence

   Improve polygon subdivision, room adjacency, circulation, bathroom placement, kitchen/dining logic, daylight, ventilation, and dead-space reduction.

3. BOQ Production Pipeline

   Move beyond demo result pages into real upload parsing, line-item classification, rate comparison, anomaly detection, and exportable reports.

4. Premium Mobile Experience

   Continue mobile-first improvements: bottom action bars, compact cards, smooth state transitions, touch feedback, and fewer text-heavy sections.

5. Data Persistence

   Add proper project saving, user history, stored estimates, saved layouts, and saved tour configs.

6. Pricing/Plan Layer

   Since the product is moving toward paid quality, define free vs premium limits, export restrictions, saved projects, and advanced AI generation features.

## Best Prompt To Give A New LLM

Use this if handing the project to another LLM:

`You are working on Auto Nirman, a Next.js/React/TypeScript/Tailwind AI construction intelligence platform for India. Read AUTONIRMAN_CURRENT_CONTEXT.md first. The product must feel like premium construction SaaS, not a static website. Preserve the dark futuristic Auto Nirman identity, improve practical construction intelligence, and avoid random or toy-like AI visuals. The strongest visual benchmark is the login page. Current priorities are realistic 3D room tour quality, stronger 2D architectural floor-plan intelligence, and production-grade BOQ/cost workflows. Before changing code, inspect existing components and follow current patterns.`


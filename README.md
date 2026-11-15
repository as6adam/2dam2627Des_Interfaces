# Tempora

## Current delivery status (15 November 2026)

- Landing: https://as6adam.github.io/2dam2627Des_Interfaces/
- App: https://as6adam.github.io/2dam2627Des_Interfaces/app/index.html
- Publishing branch: `Pomodoro_Tempora`; pushes trigger GitHub Actions. Pages uses the `github-pages` environment, which permits this branch.
- Adam confirmed the live deployment and supplied real Chrome desktop and iPhone Safari screenshots. The landing gallery contains all ten screenshots, with English and Spanish captions.
- Adam reports that the app works on his iPhone. This is a basic user check, not a complete device/accessibility test suite; Tauri and specific virtual-keyboard checks remain pending.
- The study-session date picker is bounded by its parent exam/assignment date. New events and rescheduling support future years, including 2027 and 2028. Passed deadlines offer rescheduling instead of suggesting a new preparation session after the deadline.
- Calendar cards preserve duration proportions and adapt their text to their own width. The full 24-hour calendar is available.

The numbered sections below describe the historical iterations. Statements such as "not published" refer to the state at that iteration, not the current delivery. The original prompt transcripts remain unchanged.


Study planner with a weekly/daily calendar, exam & assignment tracking, Pomodoro timer and focus audio.
Tauri 2 · React 18 · TypeScript · Tailwind 3 · Framer Motion · Zustand.

## Build a Windows `.exe`

1. **Prerequisites (once)**
   - Node.js 18+ (https://nodejs.org)
   - Rust via rustup (https://rustup.rs) — choose the default `x86_64-pc-windows-msvc` toolchain
   - Visual Studio Build Tools 2022 with the **Desktop development with C++** workload
   - WebView2 runtime (already included in Windows 10 21H2+ / Windows 11)
2. **Install & run in dev**
   ```powershell
   npm install
   npm run tauri dev
   ```
3. **Compile for release**
   ```powershell
   npm run tauri build
   ```
   Output:
   - Installer: `src-tauri\target\release\bundle\nsis\Tempora_1.0.0_x64-setup.exe`
   - MSI: `src-tauri\target\release\bundle\msi\Tempora_1.0.0_x64_en-US.msi`
   - Portable binary: `src-tauri\target\release\tempora.exe`

The first Rust build takes several minutes; later builds are incremental.
To regenerate icons from another image: `npm run tauri icon path\to\icon.png`.

## iOS / cross-platform notes
- Tauri 2 targets iOS: on a Mac with Xcode run `npm run tauri ios init`, then `npm run tauri ios dev`.
- Already portable: Pointer Events (touch + mouse), `viewport-fit=cover`, the notification plugin, no desktop-only Rust code.
- Still needed for phones: the three-column layout is desktop-first. Collapse the sidebars into sheets below ~900px and
  pad with `env(safe-area-inset-*)`.

## Preferences (TEMPORA-WEB-001)
- `purpose` (`academic` | `productivity`, initially `null`) and `language` (`es` | `en`, initially `es`) live in `useApp`, persisted under the existing `tempora-v1` key (persist **version 1**; v0 → v1 migration in `src/lib/preferences.ts`).
- First launch with `purpose === null` shows the purpose picker; the welcome summary runs once afterwards. Change it later from the sidebar or Settings.
- Translations live in `src/lib/i18n.ts` (pure, exhaustive `Record<Language, …>`; no store import, so the store can use it later). Hooks that read Zustand are in `src/lib/vocab.ts`.
- TEMPORA-WEB-002A: `es`/`en` vocabulary for both purposes, a language selector in Settings (`useApp.language`, same `tempora-v1` key, no schema change) and `document.documentElement.lang` sync. Translated: Settings, purpose dialog, purpose names, sidebar purpose control and everything already using `useVocab`. **Not yet translated** (002B/002C): see the inventory in the iteration notes.
- TEMPORA-WEB-002B: visible and accessible UI strings (sidebar, calendar, mini-calendar, popover, item modal, welcome/theme dialogs, Pomodoro, audio) resolved from `lib/i18n.ts`; form errors are stored as typed codes (`FormError`) and resolved at render, so switching language updates them instantly.
- TEMPORA-WEB-002C: all dates go through `lib/dates.ts` (explicit `language` argument, `es`/`en-GB` locales, Monday-first, 24 h). Relative labels (`relativeDayLabel`) count local calendar days and are independent of the exact `hasPassed` check. Welcome and Pomodoro notifications are built by pure functions in `lib/i18n.ts` (`welcomeNotice`, `timerNotice`) using the language/purpose in force when they are emitted. Sample data is generated in the current language. Remaining static strings: the Tauri window title and `<title>` ("Tempora", proper name).
- Tests: `npm test`.

## Behaviour
- **Launch alerts:** exams within 15 days and assignments within 30 days open a summary modal (plus a native notification). Items further out or already past are ignored.
- **Schedule prep:** click any exam/assignment → "Would you like to add a study session…?" → set date/time/duration, or **Pick** a slot directly on the calendar.
- **Calendar:** drag cards to move them (15-min snapping, day-to-day), click an empty slot to add, rubber-band at edges.
- **Data** is stored locally (localStorage) and persists between launches.

## Audio caveat
Presets use the YouTube IFrame API. YouTube can refuse some embeds (error 101/150/153), and some live streams
change IDs over time — the player shows "Can't play this source" and you can paste another URL under **Custom**
(YouTube links or direct `.mp3` / stream URLs).

## Structure
```
src/store.ts          Zustand stores: app data, UI, pomodoro, audio
src/lib/              dates, springs, notifications, startup/ticker hooks
src/components/       Sidebar, MiniCalendar, CalendarView, EventCard, ItemPopover,
                      ItemModal, Overlays (startup/theme/settings), RightPanel, AudioEngine
src-tauri/            Rust shell + tauri.conf.json (NSIS + MSI targets)
```

## Running the frontend without Tauri (TEMPORA-WEB-003A)

No Rust is needed to work on the frontend:

```bash
npm install
npm run dev       # http://localhost:1420 in a normal browser (port fixed because Tauri's devUrl points at it)
npm run build     # tsc + vite build → static files in dist/ (same output Tauri bundles via frontendDist)
npm run preview   # serves dist/ locally to check the production build (http://localhost:4173)
npm test
```

Desktop (requires Rust + the Tauri prerequisites for your OS): `npm run tauri dev` / `npm run tauri build`.
Tauri's configuration is unchanged: `beforeDevCommand: npm run dev`, `devUrl: http://localhost:1420`, `beforeBuildCommand: npm run build`, `frontendDist: ../dist`. `index.html` + `src/main.tsx` remain the single entry for both.

**Environment detection** lives in `src/lib/platform.ts` (`globalThis.isTauri`, the same signal as `isTauri()` in `@tauri-apps/api` 2.x; no user-agent sniffing). `@tauri-apps/plugin-notification` is only loaded with a dynamic `import()` from the desktop adapter in `src/lib/notify.ts`, so it never runs in the browser (it ends up in a separate lazy chunk).

**Notifications** keep three things apart: Tempora's own preference (the Settings switch), the real permission (`unsupported | default | granted | denied`) and API availability. In the browser Tempora never asks for permission on its own (not at startup, not on the welcome summary, not when a Pomodoro ends): only the **Allow** button in Settings does. If a system notification cannot be shown and alerts are enabled, an in-app, non-blocking alert is used instead (never both). The welcome summary already is an in-app dialog, so it creates no extra alert.

**Local data belongs to the origin and browser profile where the app runs** (`localStorage` keys `tempora-v1` and `tempora-audio`). The Tauri app, `localhost:1420`, `localhost:4173` and any future published site are different origins: this adaptation does not sync data between them.

## Audio and persistence (TEMPORA-WEB-003B)

**Audio.** Nothing plays by itself: playback starts only from the Play/Retry buttons and is never persisted. YouTube is not contacted until the user presses play on a YouTube source (the IFrame API script loads once, with a 10 s limit). When a YouTube source is active the player is shown **visible** in the audio card (≥ 200×200, nothing overlaid), as YouTube's [Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality) asks of embedded players. Logic lives in `src/lib/audioController.ts` (no React, injectable dependencies, unit-tested); `AudioEngine` only mounts it once. Custom URLs must be http(s); a valid URL does not guarantee playable audio. Failures are classified (`blocked`, `source`, `unavailable`, `network`) and shown with a Retry button; there are no automatic retries.

**Storage** (per origin and browser profile; nothing is synced): 

| Key | Kept after reload | Reset on reload |
|---|---|---|
| `tempora-v1` | events (and `linkedTo`), mode, theme, purpose, language, alerts preference | — |
| `tempora-audio` | audio source (preset or valid custom URL) and volume | `playing`, `status`, `problem`, `attempt` |
| Not stored | — | Pomodoro (phase, remaining time, `endAt`, session count), calendar view/cursor/filter, open dialogs, notification permission (the browser keeps it) |

Unreadable JSON is never deleted: the original text is copied to `<key>.unreadable` (first copy only) before defaults are used. If writing fails (quota, blocked storage, private mode) the app keeps working in memory and shows one discreet alert saying changes can be lost on close/reload. Alerts are never reported as "saved" unless the write succeeded.

**Pomodoro** uses wall-clock `endAt`; when the tab becomes visible/focused again it reconciles immediately. A closed or suspended browser cannot fire an alarm at the exact moment: the end is detected the next time the page runs. Changing language, purpose or audio source never touches `endAt`.

## Responsive layout (TEMPORA-WEB-003C)

One DOM structure at every size: `AudioEngine`, sidebar, calendar, focus panel and mobile bar are rendered once; only classes and the presentation-only `useUI.panel` state change, so resizing never remounts audio nor resets the Pomodoro, forms, filters or dates.

| Width | Layout |
|---|---|
| ≥ 1200 px | Three fixed areas (navigation · calendar · focus). Tauri's min window (1120) is below this, see limitations. |
| 1024–1199 px | Focus docked; navigation foldable from the header. |
| 768–1023 px | Both panels foldable (header buttons with `aria-expanded`). |
| < 768 px | Bottom bar Menu · Add · Focus (in flow, not floating), panels as drawers, event detail as a bottom sheet, day view by default. |

Breakpoints live in `src/lib/layout.ts` (mirrored in `tailwind.config.js`; a test checks they match).

- **Week view on small screens**: columns have a minimum width; only the calendar scrolls horizontally (sticky day header and hour column, edge fades, hint until the first scroll). The page never scrolls sideways.
- **Moving events**: mouse/pen drag after 4 px; touch needs a 380 ms long-press (a swipe scrolls). Drops use the same validation as the form.
- **Form alternative**: "Change date and time" in the event detail (also Enter/Space on a card to open it) edits only `start`; id, type, duration, notes and links are preserved.
- **Dialogs**: Escape, focus trap and focus restore are shared (`useDialogBehavior`). Viewport units use `dvh` with fallback, `env(safe-area-inset-*)` and `visualViewport`; zoom is never blocked.

Verified only in Chromium emulation (Playwright/CDP touch). Not verified: physical devices, the virtual keyboard, real notch safe areas, real browser zoom, screen readers, real YouTube playback when a panel closes, and the Tauri window.

## Landing and two entries (TEMPORA-WEB-004A)

| URL (relative to the deployment base) | Entry | React entry |
|---|---|---|
| `/index.html` | Landing (presentation page) | `src/landing/main.tsx` |
| `/app/index.html` | Tempora application | `src/main.tsx` |

Both are plain static HTML files (no router, no server redirects, no 404 fallback): opening or reloading `/app/index.html` directly works. The landing never imports `App`, the store, `AudioEngine`, the Pomodoro, startup alerts or the purpose picker (a test guards the imports).

**Run**
- Browser, development: `npm run dev` → landing at `http://localhost:1420/`, app at `http://localhost:1420/app/index.html`.
- Browser, production build: `npm run build && npm run preview` → `http://localhost:4173/` and `/app/index.html`.
- Desktop (Tauri): `npm run tauri dev` / `npm run tauri build`. **The window opens the app directly**: `src-tauri/tauri.conf.json` sets the window `url` to `app/index.html` (a Tauri "app URL": resolved against `devUrl` in development and against `frontendDist` in production). As a safety net, if the landing is ever loaded inside Tauri it jumps to `app/index.html` (`src/landing/guard.ts`). The Tauri window itself has **not** been run in this environment.

**Deployment base (GitHub Pages later)**
- Default `base` is `'./'`: every URL in the built HTML is relative to its own document (`./assets/…` from `/index.html`, `../assets/…` from `/app/index.html`), so the same `dist/` works at a domain root, under a repository sub-path (served over HTTP) and in Tauri. Opening `dist/index.html` through `file://` is not guaranteed (browsers restrict ES modules there): use an HTTP server such as `npm run serve:dist`. No repository name is hard-coded anywhere.
- To force an absolute sub-path: `TEMPORA_BASE=/your-repo/ npm run build` (PowerShell: `$env:TEMPORA_BASE='/your-repo/'; npm run build`). It is normalised by `config/base.ts`. The landing's "Open Tempora" link is built from `import.meta.env.BASE_URL`, never from a fixed `/app/`.
- The GitHub Pages workflow is prepared in 004B (see below); nothing has been published.

**Shared preferences (no second key)**
- The landing reads/writes the same `tempora-v1` value as the app (`language`, `mode`, `theme`) through `src/lib/sharedPrefs.ts`, **without importing the store**. Saving the language (or mode) changes only that field; events, purpose, notifications and unknown fields are kept, the version is kept, and an unreadable value is never overwritten.
- No saved choice → Spanish. Mode: saved mode, otherwise the system's `prefers-color-scheme` (not persisted until the visitor uses the toggle). Theme: saved theme (violet "agate" by default).

**Styles**
- `src/styles/shared.css`: tokens, background, focus ring and materials shared by both entries. `src/index.css`: app only (fixed-height `#root`, internal scroll, `user-select: none`, drawers). `src/landing/landing.css`: landing only (natural height, selectable text, anchor offsets, reduced motion). Tailwind `content` covers both HTML files and `src/**`.

**Landing content**: `src/landing/content.ts` (typed, es/en). Phase and item statuses come only from what exists in the repository; review them before publishing. The "Prompts used and responses obtained" record is described in the 005 section below.

## Deployment to GitHub Pages (TEMPORA-WEB-004B) — prepared, NOT published

Status: `.github/workflows/deploy-pages.yml` is written and its YAML parses, and every command it runs has been run locally. **It has not been run on GitHub** (no repository, remote or push exists in this working copy). Nothing is published.

**Local reproduction (same steps as the workflow)**
```
npm ci && npm test && npm run build && npm run verify:dist
```
- `npm run verify:dist` checks `dist/` statically (both entries are the right page, every local URL in HTML/CSS/JS exists and is relative, no dev references, the landing does not pull the YouTube player) and then crawls it over a static server **without SPA fallback**, both at `/` and under a sub-path, requiring 200 with the right content type (a 200 that returns the landing instead of the requested file is an error).
- `npm run serve:dist` (or `-- --prefix /my-repo/`) serves `dist/` the same way for manual checks. `npm run preview` has an SPA fallback and is not a valid path test.
- Node version: `.nvmrc` (22). `npm ci` is never replaced by `npm install`.

**Before the first deploy (the owner does this on GitHub)**
1. Push this folder to the chosen repository (owner/repo and branch are not decided here).
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Run it: Actions → "Deploy to GitHub Pages" → Run workflow (`workflow_dispatch`). The job `deploy` publishes to the `github-pages` environment; the URL appears in the run summary (`page_url`).
4. Landing: `<page_url>`, app: `<page_url>app/index.html`.

**Publishing branch.** The workflow only has a manual trigger so no branch name is invented. To deploy on every push to the chosen branch, add under `on:`:
```
  push:
    branches: [<chosen-branch>]
```
Also check Settings → Environments → `github-pages` → deployment branches allows that branch. Never deploy from pull requests and never use `pull_request_target`. Only `GITHUB_TOKEN` is used (no personal token).

**Logs and diagnostics.** Actions → the run → job `build` (install, tests, build, `verify:dist`) or `deploy`. If the site shows 404: Pages Source is not "GitHub Actions", the `deploy` job did not run, or the environment blocks the branch. If assets 404 under `/<repo>/`: the build must use the default base `./` (do not set `TEMPORA_BASE` in the workflow); reproduce locally with `npm run serve:dist -- --prefix /<repo>/`. Never set `TEMPORA_BASE` for `tauri build`.

**Redeploying a previous revision without force-push.** Run the workflow manually with the `ref` input set to the old tag/branch/SHA, or `git revert` the bad commit and push.

**Data.** `localStorage` is per origin: data from `localhost` or the Tauri app does not transfer to the published site.

**Action versions** (taken from the official GitHub docs/READMEs at the time of writing; Dependabot is configured to propose updates): `actions/checkout@v6`, `actions/setup-node@v7`, `actions/upload-pages-artifact@v4`, `actions/deploy-pages@v4`. The landing keeps deployment as "pending": setup prepared, publication not verified.

## Development record on the landing (TEMPORA-WEB-005)

The "Prompts used and responses obtained" phase now shows the real development record from `tempora-bitacora-estructurada.docx` instead of the pending notice. **Nothing has been published or pushed**; the GitHub Pages deployment is still pending (see the 004B section).

**What is shown.** 11 blocks, in document order: the initial analysis plus iterations 001, 002A–C, 003A–C and 004A–C (150 076 characters of transcription, 823 non-empty paragraphs). Each block has four parts, collapsible: 1 phase and goal (editorial), 2 user prompt, progress messages and GPT's response, 3 exact prompt written by GPT for Claude (with *Copy prompt*), 4 Claude's response. The initial analysis has no Claude prompt or response in the source and says so. PDF page references and the document's traceability notes (including the ordinal-numbering discrepancy) are kept. This 005 iteration is **not** part of the record (the DOCX ends at 004C).

**Fidelity.** Prompts and responses are stored verbatim (no summarising, correcting or translating) and rendered as text (React text nodes, never HTML). They stay in their original language (Spanish) whatever the interface language; they are marked `lang="es"`. Only the navigation, labels, titles and goals (editorial additions of the document, translated to English) change with the language. Editorial notes are labelled as such; progress messages are shown as recorded messages; tests quoted in Claude's responses are Claude's statements, not re-run by this page. The document's last note (an instruction for implementing the landing) is not content and is not shown.

**Layout of the data** (`src/landing/log/`)
- `manifest.json`: small index shipped with the page (titles source, page references, per-section counts, hashes, traceability notes).
- `blocks/<id>.json`: one transcription per block, built by Vite as a hashed static asset and fetched only when a block is opened or reached through its anchor.
- `text.ts`: translatable labels/titles/goals (es/en). `index.ts`: loader, anchors, prompt text. `clipboard.ts`: copy with fallback. `src/landing/Log.tsx`: the UI (native `details`/`summary`, no animations).
- Anchors are stable and language-independent: `#log-analysis`, `#log-001`, `#log-002a`, … `#log-004c`.

**Regenerating / checking the data (development only; the browser never sees the DOCX)**
```
pip install python-docx
python3 scripts/extract-bitacora.py path/to/tempora-bitacora-estructurada.docx
python3 scripts/verify-bitacora.py  path/to/tempora-bitacora-estructurada.docx
```
`verify-bitacora.py` re-reads the DOCX XML independently (no python-docx) and compares every paragraph with the JSON (only whitespace is normalised) and each block's hash with the manifest. The DOCX itself is not included in the repository.

**Status wording.** The record phase is now "partial": incorporated up to 004C, later iterations are not in the document. Still pending: publication and verification on GitHub Pages, tests on physical devices and in Tauri, and features that do not exist yet.

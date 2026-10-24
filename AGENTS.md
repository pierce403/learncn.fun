# learncn.fun – agent notes

## Stack + commands

- React + TypeScript + Vite, compiled to static `dist/`
- Tailwind CSS v4 via `@tailwindcss/vite` (see `vite.config.ts`)
- Local:
  - `npm install`
  - `npm run dev`
  - `npm test`
  - `npm run build` (runs `tsc -b` then `vite build`)

## App structure

- `src/App.tsx` is the learncn.fun home screen and app switcher.
- Apps live under `src/apps/*`:
  - `src/apps/read/ReadApp.tsx`
  - `src/apps/read-out-loud/ReadOutLoudApp.tsx`
  - `src/apps/write/WriteApp.tsx`
- Each app supports an optional `onHome` callback and renders an “Apps” button in the header when provided.

## Read app

- Shows one Chinese character (`hanzi`) and 3 choices.
- Curriculum: one persisted book level shared across apps, with `All through level` and `New in level` scopes.
- Available vocabulary currently covers Levels 1–6. Levels 7–14 remain metadata-only until exact lists exist.
- Answer modes:
  - `Answers CN`: choices are **Pinyin**
  - `Answers EN`: choices are **English**
- Tap a choice:
  - Wrong: button turns red; streak resets to `0`; plays “pop”.
  - Correct: button turns green; speaks the character; advances to the next card; plays “ding”.
- Prompt audio:
  - Auto prompt says `这是什么字？` after each new card.
  - “Play audio” speaks the English word in CN mode, or the Mandarin character in EN mode.
- Audio requires a user gesture (the tap that opens the app is usually enough).

## Character dataset

- Source rows: `src/data/level-character-seeds.ts`
- Level model and computed catalogs: `src/data/words.ts`
- Level picker: `src/components/LevelSelector.tsx`
- Persisted selection: `src/hooks/useVocabularySelection.ts`
- Each entry must have:
  - `id` unique + stable (used for options / deck)
  - `hanzi`, `pinyin`, `english`
- Each source row is one newly introduced core Han character. Cumulative practice sets are computed.
- Expected new-character counts for Levels 1–6: `60, 60, 60, 60, 70, 80`.
- Speak character prompts directly and trust the selected Mandarin voice to choose the reading.
  Do not add words to steer pronunciation (for example, 了 must not become 好了).
  Archived Grade 1C syllable examples and complete sentences are lesson content, not pronunciation overrides.
- Run `npm test` after any curriculum edit. See `docs/curriculum.md` for provenance and verification status.

## Write app

- Guided stroke-order practice using `hanzi-writer` (see `package.json`).
- Dataset: the selected level/scope from `src/data/words.ts`.
- Book levels never change automatically based on streak.
- Any mistake during the word resets the “perfect streak” to `0`.
- Multi-character prompts (e.g. 爸爸/妈妈) advance character-by-character.
- Audio requires a user gesture (the tap that opens the app is usually enough).

## Grade 1C

- `weekly-curriculum.ts` and `character-lists.json` define the full 19-week PDF syllabus.
- One chapter maps to one week, anchored to September 1, 2026, with later releases each Monday in Pacific time.
- Future weeks stay locked in the UI, start handlers, navigation, and continuous practice pool.
- Start directly in Read or Write; do not reintroduce teaching-card introductions.
- Penguin Read supports Answers CN (pinyin) and EN, sharing the main Read preference. Keep choices unique in both languages and preserve mistakes when toggling.
- Penguin Read audio: a short 这是什么字？ cue for each reading question, direct Mandarin Hanzi through Listen in both answer modes, a pop on mistakes, and a ding plus direct Hanzi speech on success. Respect Sound off. Keep only the Listen control in 1C reading and writing.
- Continuous play requires all currently available Read/Write activities to be complete.
- Writing starts with tracing, then requires a clean whole-character attempt without hints. Mistakes or hints require a fresh unassisted retry; no tap/skip fallback may earn a writing star.
- Only writing completions with `handwritingVerified: true` count as stars or unlock continuous play. Keep earlier tracing records.
- Keep word difficulty per character and per skill, persist the first outcome immediately, and preserve legacy saves.
- The round trophy button opens all available characters: strengths first, untried in the middle, and practice needs at the bottom. Keep reading/writing results separate and use saved recent difficulty for ranking.
- Keep the writing completion action fixed and visible on phones. Use only the ice path for week selection; do not restore the horizontal week slider.
- The old newsletter `curriculum.ts` remains for migration. See `docs/grade-1c.md`.

## Celebration (both apps)

- Wrong answers / mistakes reset streak to `0`.
- Every streak milestone triggers confetti + “tada” + a big number flash:
  - `10`: 1 burst
  - `20`: 2 bursts
  - `30`: 3 bursts
  - etc.
- Flash animation lives in `src/index.css` (`@keyframes streak-flash`).

## GitHub Pages deploy

- Workflow: `.github/workflows/deploy.yml`
  - Builds on pushes to `main` or `master`
  - Uploads `dist/` as a Pages artifact and deploys via `actions/deploy-pages`
- Repo setting required:
  - GitHub **Settings → Pages → Source = GitHub Actions**
- Vite config sets `base: "./"` so assets work on Pages (see `vite.config.ts`).
- Custom domain is configured via `public/CNAME`.

## Git workflow (agent)

- The owner's standing instruction is to **always push completed work straight to `main`**.
  Do not open a pull request unless the user explicitly requests one.
- After completing each task that changes repository files:
  - Run the relevant checks and inspect `git status` and the diff.
  - Stage only the task's files and commit with a concise message.
  - Publish to `main` with `git push origin HEAD:main`, preserving unrelated work.
  - Use a non-forced GitHub connector update if shell GitHub credentials are unavailable.
- Never force-push or overwrite concurrent changes. Fetch and reconcile changes before publishing.
- After pushing, verify the GitHub Pages deploy. If `gh` is available:
  - Wait for the latest run of **Deploy to GitHub Pages** to finish: `gh run list --workflow \"Deploy to GitHub Pages\" --limit 1` then `gh run watch <run-id> --exit-status`
  - If it fails, surface the failure summary/logs (`gh run view <run-id> --log-failed`)

## TypeScript gotcha we hit

- `tsc` can accidentally pick up global `@types/*` from parent directories.
- Fix is already applied: `typeRoots: ["./node_modules/@types"]` in:
  - `tsconfig.app.json`
  - `tsconfig.node.json`

## Native static hosting

Publish main through Cloudflare native Git builds, with credentials kept in
Cloudflare and previews off. Preserve the existing frontend, public paths and
Pages recovery. Use npm ci, npm run check:deploy and npm run test:hosting.
The large-file router must preserve canonical bytes, MIME, HEAD and Range behavior.
Generated chunks, mapping and Worker types stay ignored. Keep no-transform and
zone-only request metrics; do not introduce browser analytics.

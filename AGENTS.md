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
- Polyphonic characters may need a contextual speech override in `src/data/words.ts` so browser audio
  matches the catalog pinyin.
- Run `npm test` after any curriculum edit. See `docs/curriculum.md` for provenance and verification status.

## Write app

- Guided stroke-order practice using `hanzi-writer` (see `package.json`).
- Dataset: the selected level/scope from `src/data/words.ts`.
- Book levels never change automatically based on streak.
- Any mistake during the word resets the “perfect streak” to `0`.
- Multi-character prompts (e.g. 爸爸/妈妈) advance character-by-character.
- Audio requires a user gesture (the tap that opens the app is usually enough).

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

- After completing each task that changes repository files, **always**:
  - `git status` (sanity check) then `git add -A`
  - `git commit -m "<message>"` (pick a concise message if the user didn’t specify one)
  - `git push` (push the current branch to its upstream)
- After pushing, **always** open or update a pull request into `main`, merge it once required checks
  pass, and treat the merge as part of completing the task. Prefer squash merge unless the repository
  or user specifies another method.
- Leave a pull request unmerged only when the user explicitly asks for a draft/review handoff or a
  higher-priority safety rule requires confirmation.
- After merging, verify the GitHub Pages deploy. If `gh` is available:
  - Wait for the latest run of **Deploy to GitHub Pages** to finish: `gh run list --workflow \"Deploy to GitHub Pages\" --limit 1` then `gh run watch <run-id> --exit-status`
  - If it fails, surface the failure summary/logs (`gh run view <run-id> --log-failed`)

## TypeScript gotcha we hit

- `tsc` can accidentally pick up global `@types/*` from parent directories.
- Fix is already applied: `typeRoots: ["./node_modules/@types"]` in:
  - `tsconfig.app.json`
  - `tsconfig.node.json`

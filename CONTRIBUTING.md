# Development notes

Use Node.js 24 and install the lockfile with `npm ci`. Run `npm run check` and `npm run test:production` before submitting a change. CI runs these checks without provider credentials.

Keep deterministic game rules in `src/train-game.ts` and semantic questions in `server/train-judge.ts`. A model result must never manufacture evidence, grant missing prerequisites, or mutate state before validation. Add representative state-transition tests when changing game rules; use the optional live test for prompt changes.

Use `npm run format` for formatting. Avoid mixing generated screenshots, local recordings, environment files, or provider traces into source commits. The existing `artifacts/` directory is intentionally ignored.

Preserve the distinction between authored dialogue, actual model judgments, and scripted hotel rehearsal mode in both the UI and documentation.

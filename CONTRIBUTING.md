# Development notes

Use Node.js 24 and install the lockfile with `pnpm install --frozen-lockfile`. Run `pnpm check` and `pnpm test:production` before submitting a change. CI runs these checks without provider credentials.

Keep deterministic game rules in `shared/train-game.ts` and semantic questions in `backend/train-judge.ts`. A model result must never manufacture evidence, grant missing prerequisites, or mutate state before validation. Add representative state-transition tests when changing game rules; use the optional live test for prompt changes.

Use `pnpm format` for formatting. Avoid mixing generated screenshots, local recordings, environment files, or provider traces into source commits. The existing `artifacts/` directory is intentionally ignored.

Preserve the distinction between authored dialogue and actual model judgments in both the UI and documentation.

# Please Return the Key

A playful, top-down pixel escape room at **Hotel Elsewhere**. Inspect six objects, claim your suitcase, befriend Pip, obtain permission for a willing departure, and return your borrowed key. The full game fits in one viewport. Narrow screens have Room / Jev tabs.

## Run locally

Requires Node 22.16+ (tested here with Node 26) and npm.

```sh
npm install
cp .env.example .env  # only if you do not already have .env
# Set TYPESAFE_API_KEY in .env. Never prefix it with VITE_.
npm run dev
```

Open **http://127.0.0.1:4317/hotel**.

The server reads `.env` at startup. Restart it after changing the key. Without a key, the app clearly labels itself **Rehearsal mode** and uses only the fixed suggested actions. It does not invent model timings or probabilities. Provider errors never silently switch a live session to rehearsal.

## What Jev does

One request contains the current discovered facts, selected object, player action, and four independent questions:

- **Choice:** route the attempted action into a supported game operation, or `other`.
- **Noul / ownership:** does a suitcase claim connect to real, discovered evidence?
- **Noul / kindness:** is a gesture toward Pip non-coercive?
- **Noul / consent:** does an invitation preserve Pip's choice?

Only judgments relevant to the selected operation are applied. The game owns physical state, inventory, permission, and checkout prerequisites. A model answer cannot create an item, skip evidence, or invent management permission. The initial thresholds (Choice confidence 0.45, relevant Noul 0.72) are provisional game design choices, not universal calibrated cutoffs.

The mind panel shows actual returned probabilities, the chosen operation, the questions used by code, API round-trip time, model identity, and the exact request/response. Replay animates the recorded decision and **does not make another API call**. Narration is authored game copy; it is not model-generated reasoning.

The first room has bounded supported mechanics, including biscuit and patient-company routes to trust. Free-form text lets players express those mechanics in unfamiliar ways; this is not an unlimited action or physics engine.

## Validation

```sh
npm run build
npm test
# With the live local server running and a configured key:
node --import tsx tests/live-smoke.ts
```

The live smoke test uses synthetic game text, makes 11 model requests, and writes a credential-free evidence record to ignored `artifacts/live-verification.json`. It checks a complete escape, novel ownership and kindness wording, rejection of coercion, mandatory key return, isolated sessions, and stale revisions. The unit tests additionally cover uncertain judgments, malformed responses, wrong-target actions, rehearsal boundaries, and both completion paths.

## Notes

- Credentials are server-only and `.env` is ignored.
- Sessions live in server memory and expire after six hours without activity; restarting the server clears them.
- Requests have input bounds, one in-flight action per session, revision checks, an 18-second provider timeout, and same-origin checks. This local demo is not a hardened public multi-user service.
- The art is editable, integer-grid SVG in `src/PixelRoom.tsx`; no raster-generation dependency.
- The TypeSafe skill lives in `.agents/skills/typesafe-ai/SKILL.md`.
- Current contract references: https://docs.typesafe.ai/api, https://docs.typesafe.ai/primitives/choice, https://docs.typesafe.ai/primitives/noul, https://docs.typesafe.ai/cookbooks/function_calling.

Production build: `npm run build`, then `npm start`.

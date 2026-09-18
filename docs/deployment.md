# Deployment

## Runtime

Build with `npm ci && npm run build`, then start with `npm start`. The application serves the compiled React app and the API from the same origin. Deploy one Node.js process, or use the supplied multi-stage Dockerfile.

`npm start` needs `server/`, the shared modules in `src/`, `dist/`, and production dependencies. The container copies these explicitly and runs as the non-root `node` user. No key is needed during the build.

## Environment

Use `.env.example` as the configuration reference. Supply `TYPESAFE_API_KEY` through the hosting platform's secret manager; never prefix it with `VITE_` or add it to the repository.

- `TYPESAFE_MODEL`: `jev-latest` by default.
- `PORT`: `4317` by default; accepts a platform-assigned port.
- `HOST`: `127.0.0.1` in development, `0.0.0.0` in production.
- `TRUST_PROXY_HOPS`: `0` by default. Set it only when the platform has a known, fixed number of trusted reverse proxies. Incorrect trust settings allow forged client addresses or accidentally group all visitors under one address.
- `API_RATE_LIMIT`: 120 API attempts per client per ten-minute window.
- `MODEL_RATE_LIMIT`: 30 action-endpoint attempts per client per ten-minute window, shared by both games.
- `MODEL_GLOBAL_LIMIT`: 300 action-endpoint attempts per server per hour, shared by both games.

Limits count attempts, including invalid actions. Responses include HTTP 429 and `Retry-After` when exhausted. `/api/health` does not consume the gameplay budget. Both games enforce optimistic session revisions and one action in flight per session.

## Operational boundaries

The demo uses in-memory sessions with a six-hour idle lifetime and a bounded session count. Restarting clears sessions and request budgets. Do not run multiple replicas without replacing these stores. Serve through HTTPS at the platform's reverse proxy. The origin check protects browser requests; it does not authenticate clients or prevent direct API use.

Configure a TypeSafe spending limit or upstream access control for an unrestricted public launch. Application request limits are not a financial guarantee, especially across restarts or replicas.

`SIGTERM` and `SIGINT` stop new connections and allow up to ten seconds for shutdown. Health checks verify the web process, not provider availability. Invalid provider responses and provider failures leave game state unchanged.

## Verification

```sh
npm run check
npm run test:production
```

The production smoke check starts an isolated server on an ephemeral loopback port, deliberately removes the TypeSafe key from its own process, and verifies page routes, API errors, session isolation, stale revisions, body limits, origin checks, and rate limiting. It makes no model calls.

The optional `npm run test:live` checks real deductions through the running development server. It incurs TypeSafe usage. Never add live credentials to CI just to run the default checks.

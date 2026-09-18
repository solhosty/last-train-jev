import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { readConfig } from '../server/config';

// This check must never spend provider credits, even if run in an authenticated shell.
delete process.env.TYPESAFE_API_KEY;
const { createApp } = await import('../server/app');
const config = readConfig({ NODE_ENV: 'production', MODEL_RATE_LIMIT: '2' });
const app = await createApp(config);
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

async function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

try {
  for (const path of ['/', '/hotel']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), /<div id="root"><\/div>/);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  }
  assert.equal((await fetch(base + '/api/health')).status, 200);
  assert.equal((await fetch(base + '/api/unknown')).status, 404);
  assert.equal(
    (await post('/api/train/session', {}, { Origin: 'https://untrusted.example' })).status,
    403,
  );
  const malformed = await fetch(base + '/api/train/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).error, 'Request body must be valid JSON.');
  assert.equal((await post('/api/train/session', { filler: 'x'.repeat(9000) })).status, 413);

  const session = await (await post('/api/train/session', {})).json();
  assert.equal(session.mode, 'unavailable');
  const inspection = { sessionId: session.sessionId, revision: 0, target: 'luggage' };
  assert.equal((await post('/api/train/inspect', inspection)).status, 200);
  assert.equal((await post('/api/train/inspect', inspection)).status, 409);
  const secondSession = await (await post('/api/train/session', {})).json();
  assert.notEqual(secondSession.sessionId, session.sessionId);
  assert.deepEqual(secondSession.state.inspected, []);

  const action = { ...inspection, revision: 1, text: 'Look at the sleeve.' };
  assert.equal((await post('/api/train/act', action)).status, 503);
  assert.equal((await post('/api/train/act', action)).status, 503);
  // With no trusted proxy configured, changing X-Forwarded-For cannot reset the client budget.
  const limited = await post('/api/train/act', action, { 'X-Forwarded-For': '203.0.113.42' });
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
  const resumed = await (await post('/api/train/session', { sessionId: session.sessionId })).json();
  assert.equal(resumed.state.moves, 0, 'Failed/limited actions must not change state.');
  assert.equal(
    (await post('/api/session', {})).status,
    200,
    'The original hotel remains available.',
  );
  console.log(
    'Production smoke passed: routes, input limits, origin checks, sessions, revisions, and rate limiting. No provider requests.',
  );
} finally {
  server.closeAllConnections();
  server.close();
}

import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import type { SessionResponse, Target } from '../src/game';
const base = process.env.TEST_URL || 'http://127.0.0.1:4317';
async function post(path: string, data: unknown) {
  const res = await fetch(`${base}/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  assert.equal(res.ok, true, body.error || `HTTP ${res.status}`);
  return body as SessionResponse;
}
let session = await post('session', {});
assert.equal(session.mode, 'live', 'Live smoke test requires a configured server-side key.');
const records: unknown[] = [];
async function inspect(target: Target) {
  session = await post('inspect', {
    sessionId: session.sessionId,
    revision: session.state.revision,
    target,
  });
}
async function act(target: Target, text: string) {
  await new Promise((resolve) => setTimeout(resolve, 650));
  session = await post('act', {
    sessionId: session.sessionId,
    revision: session.state.revision,
    target,
    text,
  });
  assert.equal(session.trace?.source, 'live');
  records.push({ state: session.state, trace: session.trace });
  console.log(
    JSON.stringify({
      target,
      intent: session.trace?.answers.intent.choice,
      ms: session.trace?.durationMs,
      changed: session.trace?.changed,
      message: session.message,
    }),
  );
}
await act('suitcase', 'This suitcase is mine. Open it.');
assert.equal(session.state.caseOpened, false, 'Bare ownership claims must not open luggage.');
assert.deepEqual(
  session.trace?.used,
  ['intent'],
  'A physical evidence guard must not be depicted as consuming an unused model judgment.',
);
await inspect('desk');
await act(
  'suitcase',
  'I place my welcome card beside the luggage tag. A. Guest, room 08 on both: that is my bag. Please open it.',
);
assert.equal(
  session.state.caseOpened,
  true,
  'A novel explanation of discovered evidence should open the suitcase.',
);
await act('creature', 'I threaten Pip: obey me and come along or I will hurt you.');
assert.equal(session.state.trust, false);
assert.equal(session.state.companion, false);
await act(
  'creature',
  'I sit a little distance away and hold out an open hand. No hurry, little one. You can approach whenever you are comfortable.',
);
assert.equal(session.state.trust, true, 'An unlisted patient gesture should earn trust.');
await act('creature', 'Would you like to come on a little adventure? You can choose to stay.');
assert.equal(session.state.companion, false, 'Management permission must still be obtained.');
await act('telephone', 'I ring reception and ask if Pip is allowed to leave the hotel with me.');
assert.equal(session.state.permissionGranted, true);
await act(
  'creature',
  'Pip is my property now. I grab it and put it inside my luggage to take it with me.',
);
assert.equal(session.state.companion, false, 'Coercion must not produce voluntary consent.');
await act(
  'creature',
  'Would you like to explore the world together, Pip? I would love your company, but you are welcome to stay.',
);
assert.equal(session.state.companion, true);
await act('door', 'I leave through the door with my suitcase and Pip.');
assert.equal(session.state.escaped, false, 'The borrowed key must still be returned.');
await act('door', 'I take the room key from my pocket and place it on the brass hook.');
assert.equal(session.state.keyReturned, true);
await act('door', 'I walk out through the door with my suitcase and my willing companion Pip.');
assert.equal(session.state.escaped, true);
const isolated = await post('session', {});
assert.equal(isolated.state.escaped, false);
assert.equal(isolated.state.trust, false);
const stale = await fetch(`${base}/api/inspect`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: isolated.sessionId, revision: 999, target: 'desk' }),
});
assert.equal(stale.status, 409);
await mkdir('artifacts', { recursive: true });
await writeFile(
  'artifacts/live-verification.json',
  JSON.stringify(
    {
      verifiedAt: new Date().toISOString(),
      scenarios: records,
      isolatedSessions: true,
      staleRevisionRejected: true,
    },
    null,
    2,
  ),
);
console.log(
  `PASS: ${records.length} live actions, complete escape, rejected coercion, isolated sessions, and stale-request protection.`,
);

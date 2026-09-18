import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import {
  initialState,
  inspectState,
  applyJudgment,
  targets,
  type RoomState,
  type Target,
  type Trace,
} from '../src/game';
import { buildRequest, liveJudge, rehearsalAnswers } from './judge';

export const hotelRouter = Router();
const mode = process.env.TYPESAFE_API_KEY?.trim() ? 'live' : 'rehearsal';
interface Session {
  state: RoomState;
  busy: boolean;
  touched: number;
  lastRequest: number;
  history: Trace[];
}
const sessions = new Map<string, Session>();
const cleanup = setInterval(() => {
  for (const [id, s] of sessions)
    if (!s.busy && Date.now() - s.touched > 6 * 60 * 60 * 1000) sessions.delete(id);
}, 60000);
cleanup.unref();
hotelRouter.post('/session', (req, res) => {
  const existingId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : '';
  const existing = sessions.get(existingId);
  if (existing) {
    existing.touched = Date.now();
    res.json({
      sessionId: existingId,
      state: existing.state,
      mode,
      message: 'Welcome back. The room remembers.',
      trace: existing.history.at(-1),
    });
    return;
  }
  if (sessions.size >= 500) {
    res.status(503).json({ error: 'Too many rooms are open. Please try again later.' });
    return;
  }
  const sessionId = randomUUID();
  const state = initialState();
  sessions.set(sessionId, { state, busy: false, touched: Date.now(), lastRequest: 0, history: [] });
  res.json({
    sessionId,
    state,
    mode,
    message:
      'Welcome to Room 08. Your checkout is almost ready. Almost. Pick something in the room to take a closer look.',
  });
});
hotelRouter.post('/inspect', (req, res) => {
  const { sessionId, revision, target } = req.body || {};
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ error: 'This room has expired. Start a new stay.' });
    return;
  }
  if (!targets.includes(target) || !Number.isInteger(revision)) {
    res.status(400).json({ error: 'Choose a valid object.' });
    return;
  }
  if (session.busy || session.state.revision !== revision) {
    res.status(409).json({ error: 'The room has changed. Refresh to pick up its current state.' });
    return;
  }
  const result = inspectState(session.state, target);
  session.state = result.state;
  session.touched = Date.now();
  res.json({ sessionId, state: session.state, mode, message: result.message });
});
hotelRouter.post('/act', async (req, res) => {
  const { sessionId, revision, target, text, suggestionId } = req.body || {};
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ error: 'This room has expired. Start a new stay.' });
    return;
  }
  if (
    !targets.includes(target) ||
    !Number.isInteger(revision) ||
    typeof text !== 'string' ||
    !text.trim() ||
    text.length > 800
  ) {
    res
      .status(400)
      .json({ error: 'Choose an object and describe one action in 800 characters or fewer.' });
    return;
  }
  if (session.busy || session.state.revision !== revision) {
    res.status(409).json({
      error:
        'The room is still responding, or changed in another tab. Refresh before trying again.',
    });
    return;
  }
  if (session.state.escaped) {
    res.status(409).json({ error: 'You have checked out. Begin another stay to play again.' });
    return;
  }
  if (Date.now() - session.lastRequest < 600) {
    res.status(429).json({ error: 'Give the room a moment before your next action.' });
    return;
  }
  session.busy = true;
  session.lastRequest = Date.now();
  session.touched = Date.now();
  try {
    const stateBefore = structuredClone(session.state);
    const request = buildRequest(stateBefore, target as Target, text.trim());
    let result;
    if (mode === 'live') result = await liveJudge(request);
    else {
      const rehearsal = rehearsalAnswers(suggestionId, stateBefore, target);
      request.state.playerAction = rehearsal.text;
      result = {
        answers: rehearsal.answers,
        model: 'scripted-rehearsal',
        durationMs: 0,
        inputTokens: null,
      };
    }
    const outcome = applyJudgment(stateBefore, target, result.answers);
    const trace: Trace = {
      id: randomUUID(),
      source: mode,
      ...result,
      request,
      text: request.state.playerAction,
      target,
      used: outcome.used,
      result: outcome.message,
      changed: outcome.changed,
    };
    session.state = outcome.state;
    session.history = [...session.history.slice(-19), trace];
    res.json({ sessionId, state: session.state, mode, message: outcome.message, trace });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The room could not reach Jev.';
    res.status(502).json({
      error: /timeout|aborted/i.test(message)
        ? 'Jev took too long to respond. Your room is unchanged; please retry.'
        : message,
    });
  } finally {
    session.busy = false;
  }
});

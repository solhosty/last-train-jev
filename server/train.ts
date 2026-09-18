import { Router } from 'express';
import { trainRequest, judgeTrain } from './train-judge';
import { randomUUID } from 'node:crypto';
import {
  trainTargets,
  newTrain,
  inspectTrain,
  applyTrain,
  type TrainState,
  type TrainTrace,
} from '../src/train-game';
export const trainRouter = Router();
const sessions = new Map<
  string,
  { state: TrainState; busy: boolean; touched: number; trace?: TrainTrace }
>();
const timer = setInterval(() => {
  for (const [id, s] of sessions)
    if (!s.busy && Date.now() - s.touched > 6 * 60 * 60 * 1000) sessions.delete(id);
}, 60_000);
timer.unref();
const mode = () => (process.env.TYPESAFE_API_KEY?.trim() ? 'live' : 'unavailable');
trainRouter.post('/session', (req, res) => {
  let sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : '';
  let s = sessions.get(sessionId);
  if (!s) {
    if (sessions.size >= 500) {
      res.status(503).json({ error: 'Too many open cases.' });
      return;
    }
    sessionId = randomUUID();
    s = { state: newTrain(), busy: false, touched: Date.now() };
    sessions.set(sessionId, s);
  }
  s.touched = Date.now();
  res.json({
    sessionId,
    state: s.state,
    mode: mode(),
    trace: s.trace,
    message:
      'Your passport vanished during a blackout. Investigate the passengers, recover it, and convince the conductor to let you out.',
  });
});
for (const route of ['inspect', 'act'])
  trainRouter.post('/' + route, async (req, res) => {
    const { sessionId, revision, target, text } = req.body || {};
    const s = sessions.get(sessionId);
    if (!s) {
      res.status(404).json({ error: 'This case expired. Start a new investigation.' });
      return;
    }
    if (!trainTargets.includes(target) || !Number.isInteger(revision)) {
      res.status(400).json({ error: 'Choose a valid subject.' });
      return;
    }
    if (s.busy || revision !== s.state.revision) {
      res.status(409).json({ error: 'The case changed. Reload to continue.' });
      return;
    }
    if (s.state.escaped) {
      res.status(409).json({ error: 'This case is closed. Start a new investigation.' });
      return;
    }
    s.touched = Date.now();
    if (route === 'inspect') {
      const out = inspectTrain(s.state, target);
      s.state = out.state;
      res.json({ sessionId, ...out, mode: mode(), trace: s.trace });
      return;
    }
    if (typeof text !== 'string' || !text.trim() || text.length > 800) {
      res.status(400).json({ error: 'Describe an action in 800 characters or fewer.' });
      return;
    }
    if (mode() !== 'live') {
      res.status(503).json({ error: 'A TypeSafe key is required for live deductions.' });
      return;
    }
    s.busy = true;
    try {
      const request = trainRequest(s.state, target, text.trim());
      const judgment = await judgeTrain(request);
      const { answers } = judgment;
      const out = applyTrain(s.state, target, answers);
      const trace: TrainTrace = {
        text: text.trim(),
        target,
        answers,
        durationMs: judgment.durationMs,
        model: judgment.model,
        used: out.used,
        changed: out.changed,
        result: out.message,
        request,
      };
      s.state = out.state;
      s.trace = trace;
      res.json({ sessionId, state: s.state, message: out.message, trace, mode: mode() });
    } catch (e) {
      res.status(502).json({
        error: e instanceof Error ? e.message : 'Unable to reach Jev. Your case is unchanged.',
      });
    } finally {
      s.busy = false;
    }
  });

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  newTrain,
  applyTrain,
  inspectTrain,
  type TrainAnswers,
  type Link,
  type TrainIntent,
} from '@last-train/shared';
import { validateTrain, trainQuestions } from '../train-judge';
function a(intent: TrainIntent, connection: Link = 'none', supported = 1): TrainAnswers {
  return {
    intent: {
      type: 'choice',
      choice: intent,
      confidence: 1,
      probabilities: Object.fromEntries(
        Object.keys(trainQuestions.intent.criteria).map((k) => [k, k === intent ? 1 : 0]),
      ),
    },
    connection: {
      type: 'choice',
      choice: connection,
      confidence: 1,
      probabilities: Object.fromEntries(
        Object.keys(trainQuestions.connection.criteria).map((k) => [k, k === connection ? 1 : 0]),
      ),
    },
    supported: { type: 'noul', noul: supported },
  };
}
test('model judgments cannot create undiscovered evidence', () => {
  const r = applyTrain(newTrain(), 'doctor', a('challenge', 'private_detail'));
  assert.deepEqual(r.state.links, []);
  assert.equal(r.changed, false);
});
test('one suspicion and innocent lies cannot authorize a search', () => {
  const s = { ...newTrain(), links: ['private_detail', 'pianist', 'courier'] as Link[] };
  assert.equal(applyTrain(s, 'conductor', a('search')).state.recovered, false);
});
test('two grounded contradictions allow search, but not direct escape', () => {
  let s = newTrain();
  for (const t of ['luggage', 'doctor', 'log'] as const) s = inspectTrain(s, t).state;
  for (const l of ['private_detail', 'alibi'] as const)
    s = applyTrain(s, 'doctor', a('challenge', l)).state;
  assert.equal(applyTrain(s, 'conductor', a('leave')).state.escaped, false);
  s = applyTrain(s, 'conductor', a('search')).state;
  assert.equal(s.recovered, true);
  assert.equal(applyTrain(s, 'conductor', a('leave')).state.escaped, true);
});
test('unsupported argument and wrong target cannot add a connection', () => {
  let s = newTrain();
  for (const t of ['luggage', 'doctor'] as const) s = inspectTrain(s, t).state;
  assert.equal(applyTrain(s, 'doctor', a('challenge', 'private_detail', 0.2)).changed, false);
  assert.equal(applyTrain(s, 'pianist', a('challenge', 'private_detail')).changed, false);
});
test('invalid distributions and non-finite probabilities fail closed', () => {
  const good = a('challenge', 'alibi');
  assert.deepEqual(validateTrain(good), good);
  assert.throws(() => validateTrain({ ...good, supported: { type: 'noul', noul: NaN } }));
  assert.throws(() =>
    validateTrain({ ...good, intent: { ...good.intent, probabilities: { challenge: 1 } } }),
  );
});

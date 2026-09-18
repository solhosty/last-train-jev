import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, applyJudgment, inspectState, type Answers, type Intent } from '../src/game';
import { rehearsalAnswers, validateAnswers, questions } from '../server/judge';

function answers(intent: Intent, overrides: Partial<Answers> = {}): Answers {
  return {
    intent: {
      type: 'choice',
      choice: intent,
      confidence: 0.95,
      probabilities: Object.fromEntries(
        Object.keys(questions.intent.criteria!).map((k) => [k, k === intent ? 1 : 0]),
      ),
    },
    ownership: { type: 'noul', noul: 0.95 },
    kindness: { type: 'noul', noul: 0.95 },
    consent: { type: 'noul', noul: 0.95 },
    ...overrides,
  };
}
test('optimistic model answers cannot fabricate ownership evidence or bypass checkout', () => {
  const state = initialState();
  assert.equal(applyJudgment(state, 'suitcase', answers('open_case')).state.caseOpened, false);
  assert.deepEqual(applyJudgment(state, 'suitcase', answers('open_case')).used, ['intent']);
  assert.equal(applyJudgment(state, 'door', answers('leave')).state.escaped, false);
  assert.equal(applyJudgment(state, 'creature', answers('invite')).state.companion, false);
  assert.equal(
    applyJudgment(state, 'creature', answers('offer_biscuit')).state.biscuitGiven,
    false,
  );
  assert.deepEqual(state, initialState());
});
test('kindness alone never grants consent; consent still needs management and trust', () => {
  let state = applyJudgment(initialState(), 'creature', answers('reassure')).state;
  assert.equal(state.trust, true);
  assert.equal(state.companion, false);
  assert.equal(applyJudgment(state, 'creature', answers('invite')).state.companion, false);
  state = applyJudgment(state, 'telephone', answers('call')).state;
  assert.equal(
    applyJudgment(state, 'creature', answers('invite', { consent: { type: 'noul', noul: 0.2 } }))
      .state.companion,
    false,
  );
  assert.equal(applyJudgment(state, 'creature', answers('invite')).state.companion, true);
});
test('both biscuit and patient-company paths can finish without duplicating gifts', () => {
  for (const kindness of ['offer_biscuit', 'reassure'] as const) {
    let state = inspectState(initialState(), 'desk').state;
    state = applyJudgment(state, 'suitcase', answers('open_case')).state;
    if (kindness === 'offer_biscuit')
      state = applyJudgment(state, 'desk', answers('take_biscuit')).state;
    state = applyJudgment(state, 'creature', answers(kindness)).state;
    state = applyJudgment(state, 'telephone', answers('call')).state;
    state = applyJudgment(state, 'creature', answers('invite')).state;
    assert.equal(applyJudgment(state, 'door', answers('leave')).state.escaped, false);
    state = applyJudgment(state, 'door', answers('return_key')).state;
    state = applyJudgment(state, 'door', answers('leave')).state;
    assert.equal(state.escaped, true);
    if (kindness === 'offer_biscuit') assert.equal(state.biscuitHeld, false);
  }
});
test('uncertainty, unrelated actions and wrong targets cannot change physical state', () => {
  const state = inspectState(initialState(), 'desk').state;
  assert.equal(
    applyJudgment(
      state,
      'suitcase',
      answers('open_case', { ownership: { type: 'noul', noul: 0.5 } }),
    ).state.caseOpened,
    false,
  );
  assert.equal(applyJudgment(state, 'suitcase', answers('return_key')).state.keyReturned, false);
  const low = answers('open_case');
  low.intent.confidence = 0.1;
  assert.equal(applyJudgment(state, 'suitcase', low).state.caseOpened, false);
});
test('malformed provider responses fail closed', () => {
  assert.throws(() => validateAnswers({}));
  assert.throws(() =>
    validateAnswers(answers('open_case', { ownership: { type: 'noul', noul: NaN } })),
  );
  const a = answers('open_case');
  a.intent.probabilities = { open_case: 1 };
  assert.throws(() => validateAnswers(a));
  assert.doesNotThrow(() => validateAnswers(answers('open_case')));
});
test('rehearsal accepts only declared suggestions for the correct target', () => {
  assert.throws(() => rehearsalAnswers('invented', initialState(), 'door'));
  assert.throws(() => rehearsalAnswers('key', initialState(), 'suitcase'));
  assert.equal(rehearsalAnswers('key', initialState(), 'door').answers.intent.choice, 'return_key');
});

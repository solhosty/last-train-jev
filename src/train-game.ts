export const trainTargets = [
  'luggage',
  'doctor',
  'pianist',
  'courier',
  'log',
  'conductor',
] as const;
export type TrainTarget = (typeof trainTargets)[number];
export type Link = 'private_detail' | 'alibi' | 'pianist' | 'courier' | 'none';
export type TrainIntent = 'question' | 'challenge' | 'search' | 'leave' | 'other';
export interface TrainState {
  revision: number;
  inspected: TrainTarget[];
  links: Link[];
  recovered: boolean;
  escaped: boolean;
  moves: number;
}
export const newTrain = (): TrainState => ({
  revision: 0,
  inspected: [],
  links: [],
  recovered: false,
  escaped: false,
  moves: 0,
});
export const trainObjects: Record<
  TrainTarget,
  { name: string; role: string; quote: string; clue: string }
> = {
  luggage: {
    name: 'Your luggage',
    role: 'THE MISSING PASSPORT',
    quote:
      'Your opaque passport sleeve is empty. You last checked it at midnight. Inside the passport is a distinctive violet Lisbon stamp. You have not shown or mentioned it to anyone aboard.',
    clue: 'Empty sleeve · private Lisbon stamp',
  },
  doctor: {
    name: 'Dr. Vale',
    role: 'THE DOCTOR · COMPARTMENT 03',
    quote:
      '“I slept from midnight until twenty past. Never left my berth. A missing passport? Terrible. I hope that lovely violet Lisbon stamp is not lost forever.”',
    clue: 'Vale: asleep 00:00–00:20 · mentions Lisbon',
  },
  pianist: {
    name: 'Mara Bell',
    role: 'THE PIANIST · COMPARTMENT 01',
    quote:
      '“I stayed in my compartment all night.” A dining receipt pokes out of her score: tea for two, compartment 01, 00:10. She folds it away quickly.',
    clue: 'Mara’s dining receipt · 00:10',
  },
  courier: {
    name: 'Eli Moss',
    role: 'THE COURIER · COMPARTMENT 02',
    quote:
      '“I never touched your luggage.” A wet trail runs from the leaking window to its new position. The handle carries the same blue dye as Eli’s delivery gloves.',
    clue: 'Wet floor · blue dye on luggage handle',
  },
  log: {
    name: 'Night log',
    role: 'THE CONDUCTOR’S RECORD',
    quote:
      '00:12 — Dr. Vale, compartment 03, awake in the corridor. Requested a glass of water. 00:14 — lights failed for ninety seconds. 00:20 — passenger reported a missing passport.',
    clue: 'Signed log · Vale awake at 00:12',
  },
  conductor: {
    name: 'Conductor Ren',
    role: 'THE WAY OUT',
    quote:
      '“We reach the border at dawn. The carriage stays sealed until your papers are found. Show me two independent reasons to search someone’s belongings. A lie alone does not prove theft.”',
    clue: 'Search needs two independent grounds',
  },
};
export interface TrainAnswers {
  intent: {
    type: 'choice';
    choice: TrainIntent;
    confidence: number;
    probabilities: Record<string, number>;
  };
  connection: {
    type: 'choice';
    choice: Link;
    confidence: number;
    probabilities: Record<string, number>;
  };
  supported: { type: 'noul'; noul: number };
}
export interface TrainTrace {
  text: string;
  target: TrainTarget;
  answers: TrainAnswers;
  durationMs: number;
  model: string;
  used: string[];
  changed: boolean;
  result: string;
  request: unknown;
}
export interface TrainResponse {
  sessionId: string;
  state: TrainState;
  message: string;
  mode: 'live' | 'unavailable';
  trace?: TrainTrace;
}
export function inspectTrain(s: TrainState, target: TrainTarget) {
  return {
    state: { ...s, revision: s.revision + 1, inspected: [...new Set([...s.inspected, target])] },
    message: trainObjects[target].quote,
  };
}
export function applyTrain(s: TrainState, target: TrainTarget, a: TrainAnswers) {
  const state = { ...s, links: [...s.links], revision: s.revision + 1, moves: s.moves + 1 };
  const used = ['intent'];
  const result = (message: string, changed = false) => ({ state, message, used, changed });
  if (s.escaped) return result('The carriage is already open. Your passport is safe.');
  if (a.intent.confidence < 0.5)
    return result('I am not sure which action you mean. Ask one question or make one argument.');
  if (a.intent.choice === 'question') return result(trainObjects[target].quote);
  if (a.intent.choice === 'leave') {
    if (target !== 'conductor')
      return result('The conductor controls the carriage door. Speak to Ren.');
    if (!s.recovered) return result('“I still need to see your passport. Follow the evidence.”');
    state.escaped = true;
    return result(
      'Ren checks your passport and unlocks the carriage. Dr. Vale remains behind for the border officers. Your journey is yours again.',
      true,
    );
  }
  if (a.intent.choice === 'search') {
    if (target !== 'conductor')
      return result('Only the conductor can authorize a search. Present your findings to Ren.');
    if (!s.links.includes('private_detail') || !s.links.includes('alibi'))
      return result(
        '“Suspicion is not enough. Establish two independent grounds against the doctor before I search his bag.”',
      );
    state.recovered = true;
    return result(
      'Ren opens Dr. Vale’s medical bag. Beneath a false lining: your passport, with its violet Lisbon stamp. Evidence, not just suspicion. You may now leave.',
      !s.recovered,
    );
  }
  if (a.intent.choice === 'challenge') {
    used.push('connection', 'supported');
    const link = a.connection.choice;
    const requirements: Record<Link, TrainTarget[]> = {
      private_detail: ['luggage', 'doctor'],
      alibi: ['doctor', 'log'],
      pianist: ['pianist'],
      courier: ['courier'],
      none: [],
    };
    const expected = link === 'pianist' ? 'pianist' : link === 'courier' ? 'courier' : 'doctor';
    if (link === 'none' || a.connection.confidence < 0.5 || a.supported.noul < 0.75)
      return result(
        'That argument does not establish a contradiction from the evidence you have. Connect a specific claim to a discovered fact.',
      );
    if (target !== expected && target !== 'conductor')
      return result(
        'That evidence concerns someone else. Put the argument to the person it concerns, or to the conductor.',
      );
    if (!requirements[link].every((t) => s.inspected.includes(t)))
      return result(
        'You have not discovered the evidence for that argument yet. Examine the carriage first.',
      );
    if (s.links.includes(link))
      return result('That connection is already recorded in your case notes.');
    state.links.push(link);
    const messages: Record<Link, string> = {
      private_detail:
        'Vale’s expression changes. “I… may have seen it.” You never showed him the passport. He knows a private detail: establish access, not yet theft.',
      alibi:
        '“The conductor must be mistaken.” But the signed log places Vale awake at 00:12. His sleeping alibi breaks. A second independent ground for a search.',
      pianist:
        'Mara lowers her voice. “I met my sister in the dining car. Our family does not know she is travelling.” A secret meeting explains the lie; it does not link her to the passport.',
      courier:
        'Eli shows his stained gloves. “The window was leaking. I moved your case to keep it dry. I panicked when you said it was missing.” Handling luggage is suspicious, but is not proof of theft.',
      none: '',
    };
    return result(messages[link], true);
  }
  return result(
    'Try questioning a passenger, connecting evidence to a claim, asking Ren for a search, or leaving once your passport is recovered.',
  );
}

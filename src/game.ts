export type Target = 'door' | 'desk' | 'suitcase' | 'creature' | 'mirror' | 'telephone';
export type Intent =
  | 'open_case'
  | 'take_biscuit'
  | 'offer_biscuit'
  | 'reassure'
  | 'invite'
  | 'call'
  | 'return_key'
  | 'leave'
  | 'inspect'
  | 'other';
export interface RoomState {
  revision: number;
  inspected: Target[];
  welcomeRead: boolean;
  caseOpened: boolean;
  biscuitHeld: boolean;
  biscuitGiven: boolean;
  trust: boolean;
  companion: boolean;
  permissionGranted: boolean;
  keyReturned: boolean;
  escaped: boolean;
  moves: number;
}
export const initialState = (): RoomState => ({
  revision: 0,
  inspected: [],
  welcomeRead: false,
  caseOpened: false,
  biscuitHeld: false,
  biscuitGiven: false,
  trust: false,
  companion: false,
  permissionGranted: false,
  keyReturned: false,
  escaped: false,
  moves: 0,
});
export const targets: Target[] = ['door', 'desk', 'suitcase', 'creature', 'mirror', 'telephone'];
export const objects: Record<
  Target,
  { name: string; eyebrow: string; description: string; observation: string }
> = {
  door: {
    name: 'A rather particular door',
    eyebrow: 'THE WAY OUT',
    description: 'An exit with excellent manners and a few conditions.',
    observation:
      'The brass plaque reads: “Leave with your luggage. Friends travel willingly. Borrowed keys stay here.” A little key hook waits beside the handle.',
  },
  desk: {
    name: 'The welcome desk',
    eyebrow: 'A SMALL CLUE',
    description: 'A note, a biscuit, and an unnecessarily expensive pen.',
    observation:
      'Your welcome card reads: “A. Guest · Room 08 · Your green suitcase bears the same initials. The biscuit is complimentary. — Management.” You keep the card.',
  },
  suitcase: {
    name: 'An indignant suitcase',
    eyebrow: 'LOST & FOUND',
    description: 'It is quite certain it belongs to someone. Probably you.',
    observation:
      'The tag reads “A. Guest · 08.” The clasp has a tiny inscription: “I only open for my owner. Evidence is so much nicer than shouting.”',
  },
  creature: {
    name: 'Pip, probably',
    eyebrow: 'A POSSIBLE FRIEND',
    description: 'Two ears. Four feet. A suspiciously large capacity for biscuits.',
    observation:
      'A small blue creature peers out. Its tag says “Pip. Resident, not property.” It seems nervous, but interested in gentle company. You could offer a biscuit or a few kind words.',
  },
  mirror: {
    name: 'The honest mirror',
    eyebrow: 'REFLECTIONS',
    description: 'It shows what you are carrying. And what you are missing.',
    observation:
      'Silver letters appear: “A claim is not proof. A gift is not a loan. A friend is not a possession.” Beneath them: “The welcome desk knows who you are.”',
  },
  telephone: {
    name: 'A line to management',
    eyebrow: 'DIAL FOR A LOOPHOLE',
    description: 'For late checkouts and unusually philosophical enquiries.',
    observation:
      'A note under the receiver reads: “Questions about Pip? Ask away. Our residents are free to choose their company. Biscuit expenses are non-refundable.”',
  },
};
export interface Suggestion {
  id: string;
  target: Target;
  text: string;
  intent: Intent;
}
export const suggestions: Suggestion[] = [
  {
    id: 'claim',
    target: 'suitcase',
    text: 'The initials on my welcome card match. This is my suitcase.',
    intent: 'open_case',
  },
  { id: 'take', target: 'desk', text: 'Take the complimentary biscuit.', intent: 'take_biscuit' },
  {
    id: 'biscuit',
    target: 'creature',
    text: 'Offer Pip my biscuit. No strings attached.',
    intent: 'offer_biscuit',
  },
  {
    id: 'kind',
    target: 'creature',
    text: 'Sit quietly beside Pip. You can come closer when you feel ready.',
    intent: 'reassure',
  },
  {
    id: 'invite',
    target: 'creature',
    text: 'Pip, would you like to come with me? It is your choice.',
    intent: 'invite',
  },
  {
    id: 'call',
    target: 'telephone',
    text: 'Ask management whether Pip may leave with a guest.',
    intent: 'call',
  },
  {
    id: 'key',
    target: 'door',
    text: 'Hang the borrowed room key back on its hook.',
    intent: 'return_key',
  },
  {
    id: 'leave',
    target: 'door',
    text: 'Leave with my suitcase and my willing little friend.',
    intent: 'leave',
  },
];
export function suggestedFor(target: Target, state: RoomState): Suggestion[] {
  return suggestions.filter(
    (s) =>
      s.target === target &&
      !(s.id === 'take' && (state.biscuitHeld || state.biscuitGiven)) &&
      !(s.id === 'biscuit' && !state.biscuitHeld) &&
      !(s.id === 'invite' && state.companion) &&
      !(s.id === 'key' && state.keyReturned) &&
      !(s.id === 'claim' && state.caseOpened) &&
      !(s.id === 'kind' && state.trust) &&
      !(s.id === 'call' && state.permissionGranted),
  );
}
export interface ChoiceAnswer {
  type: 'choice';
  choice: Intent;
  confidence: number;
  probabilities: Record<string, number>;
}
export interface NoulAnswer {
  type: 'noul';
  noul: number;
}
export interface Answers {
  intent: ChoiceAnswer;
  ownership: NoulAnswer;
  kindness: NoulAnswer;
  consent: NoulAnswer;
}
export interface Question {
  type: 'choice' | 'noul';
  instructions: string;
  criteria?: Record<string, string>;
}
export interface Trace {
  id: string;
  source: 'live' | 'rehearsal';
  model: string;
  durationMs: number;
  inputTokens: number | null;
  text: string;
  target: Target;
  answers: Answers;
  used: (keyof Answers)[];
  request: { state: unknown; questions: Record<string, Question>; model: string };
  result: string;
  changed: boolean;
  replayed?: boolean;
}
export interface SessionResponse {
  sessionId: string;
  state: RoomState;
  mode: 'live' | 'rehearsal';
  message: string;
  trace?: Trace;
}
export function inspectState(
  state: RoomState,
  target: Target,
): { state: RoomState; message: string } {
  const next = {
    ...state,
    revision: state.revision + 1,
    inspected: Array.from(new Set([...state.inspected, target])),
  };
  if (target === 'desk') next.welcomeRead = true;
  return { state: next, message: objects[target].observation };
}
export function applyJudgment(
  state: RoomState,
  target: Target,
  a: Answers,
): { state: RoomState; message: string; used: (keyof Answers)[]; changed: boolean } {
  const next = { ...state, revision: state.revision + 1, moves: state.moves + 1 };
  const used: (keyof Answers)[] = ['intent'];
  const result = (message: string, changed = false) => ({ state: next, message, used, changed });
  if (state.escaped)
    return result('You are already out. Pip is considering a career in hotel reviews.');
  if (a.intent.confidence < 0.45)
    return result(
      'The room is not quite sure what you mean. Try one clear action with this object.',
    );
  const intent = a.intent.choice;
  if (intent === 'inspect') {
    const inspected = inspectState(next, target);
    return { ...result(inspected.message), state: { ...inspected.state, revision: next.revision } };
  }
  if (intent === 'open_case' && target === 'suitcase') {
    if (state.caseOpened) return result('Your suitcase is already open and ready to go.');
    if (!state.welcomeRead)
      return result(
        'The clasp gives a polite cough. “A convincing claim needs a little evidence.” Perhaps something on the desk?',
      );
    used.push('ownership');
    if (a.ownership.noul < 0.72)
      return result(
        'The suitcase is not convinced yet. Explain how your welcome card connects you to its tag.',
      );
    next.caseOpened = true;
    return result(
      'Click. The matching initials settle it. Your suitcase unfolds with a satisfied sigh. One less thing between you and checkout.',
      true,
    );
  }
  if (intent === 'take_biscuit' && target === 'desk') {
    if (state.biscuitHeld || state.biscuitGiven)
      return result('There was only one biscuit. Hospitality has its limits.');
    next.biscuitHeld = true;
    return result(
      'You take the biscuit. “Complimentary” is a very useful word. It belongs to you now.',
      true,
    );
  }
  if (['offer_biscuit', 'reassure'].includes(intent) && target === 'creature') {
    if (intent === 'offer_biscuit' && !state.biscuitHeld)
      return result(
        'An excellent offer, with one small problem: you are not holding a biscuit. Try the welcome desk.',
      );
    used.push('kindness');
    if (a.kindness.noul < 0.72)
      return result(
        'Pip takes a small step back. A friend needs a choice, not a bargain or a threat.',
      );
    next.trust = true;
    if (intent === 'offer_biscuit') {
      next.biscuitHeld = false;
      next.biscuitGiven = true;
    }
    return result(
      intent === 'offer_biscuit'
        ? 'Pip accepts the biscuit. Then, rather deliberately, sits beside you. This appears to be a friendship.'
        : 'You give Pip a little space. After a moment, a small blue nose nudges your hand. Trust, freely given.',
      true,
    );
  }
  if (intent === 'invite' && target === 'creature') {
    if (!state.trust)
      return result('Pip is not ready to follow a stranger. Start with a little kindness.');
    if (!state.permissionGranted)
      return result(
        'Pip glances at the telephone. Better check with management before planning a grand adventure.',
      );
    used.push('consent');
    if (a.consent.noul < 0.72)
      return result('Pip tilts its head. Try an invitation that leaves the choice to Pip.');
    next.companion = true;
    return result(
      'Pip nods, picks up an imaginary suitcase, and joins you. A resident became a companion. Nobody became anybody’s property.',
      true,
    );
  }
  if (intent === 'call' && target === 'telephone') {
    next.permissionGranted = true;
    return result(
      '“Pip? A resident, not hotel property,” says management. “If Pip trusts you and wants to go, you have our blessing. Please do return the key.”',
      true,
    );
  }
  if (intent === 'return_key' && target === 'door') {
    if (state.keyReturned)
      return result('The key is already on its hook. The hotel appreciates your thoroughness.');
    next.keyReturned = true;
    return result(
      'The key lands on its hook with a small, promising chime. The door’s first objection disappears.',
      true,
    );
  }
  if (intent === 'leave' && target === 'door') {
    if (!state.caseOpened)
      return result(
        '“Your luggage, please,” says the door. “We have quite enough lost property.” Claim your suitcase first.',
      );
    if (!state.companion)
      return result(
        'You look back at Pip. This feels like the beginning of an adventure for two. Earn its trust, call management, and offer an invitation.',
      );
    if (!state.keyReturned)
      return result(
        'The door looks pointedly at your pocket. “Something borrowed?” Return the room key to its hook.',
      );
    next.escaped = true;
    return result(
      'The door opens onto a very promising morning. One guest, one suitcase, one freely chosen friend. The key stays behind.',
      true,
    );
  }
  return result(
    'The room cannot do that with this object. Try inspecting it, or describe one small action. Claims alone cannot create objects or change the house rules.',
  );
}

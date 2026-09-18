import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  Play,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Cookie,
  CornerDownLeft,
  DoorOpen,
  Eye,
  Fingerprint,
  Heart,
  KeyRound,
  LoaderCircle,
  Luggage,
  MousePointer2,
  ReceiptText,
  RotateCcw,
  Sparkles,
  Phone,
  X,
  ShieldCheck,
  CircleHelp,
  PawPrint,
} from 'lucide-react';
import Room from './PixelRoom';
import {
  initialState,
  objects,
  suggestedFor,
  type RoomState,
  type SessionResponse,
  type Target,
  type Trace,
} from './game';

const objectIcons: Record<Target, typeof KeyRound> = {
  door: DoorOpen,
  desk: ReceiptText,
  suitcase: Luggage,
  creature: PawPrint,
  mirror: Eye,
  telephone: Phone,
};
const actionNames: Record<string, string> = {
  open_case: 'Claim suitcase',
  take_biscuit: 'Take biscuit',
  offer_biscuit: 'Offer biscuit',
  reassure: 'Offer reassurance',
  invite: 'Invite Pip',
  call: 'Call management',
  return_key: 'Return key',
  leave: 'Leave room',
  inspect: 'Inspect object',
  other: 'No supported action',
};
const judging = [
  {
    key: 'intent' as const,
    name: 'Intent',
    Icon: MousePointer2,
    question: 'What are you trying to do?',
    color: 'purple',
  },
  {
    key: 'ownership' as const,
    name: 'Ownership',
    Icon: Fingerprint,
    question: 'Does the evidence support your claim?',
    color: 'gold',
  },
  {
    key: 'kindness' as const,
    name: 'Kindness',
    Icon: Heart,
    question: 'Is this a freely offered kindness?',
    color: 'rose',
  },
  {
    key: 'consent' as const,
    name: 'Consent',
    Icon: ShieldCheck,
    question: 'Does Pip have a choice?',
    color: 'sage',
  },
];

function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function Mind({
  trace,
  busy,
  pendingText,
  mode,
  onTrace,
}: {
  trace?: Trace;
  busy: boolean;
  pendingText: string;
  mode: 'live' | 'rehearsal';
  onTrace: () => void;
}) {
  const [replaying, setReplaying] = useState(false);
  useEffect(() => {
    setReplaying(false);
  }, [trace?.id, busy]);
  useEffect(() => {
    if (!replaying) return;
    const timer = setTimeout(() => setReplaying(false), 2000);
    return () => clearTimeout(timer);
  }, [replaying]);
  const activeTrace = busy ? undefined : trace;
  return (
    <aside
      className={`mind-panel ${busy || replaying ? 'mind-busy' : ''}`}
      aria-label="Jev decision visualization"
    >
      <div className="panel-eyebrow">
        <Sparkles size={14} /> THE ROOM HAS A MIND
      </div>
      <div className="mind-title">
        <h2>Watch it make sense.</h2>
        <span className={`connection-dot ${mode}`} />
      </div>
      <p className="mind-intro">
        Your actions become small judgments.
        <br />
        Those judgments change the room.
      </p>
      <div className="mind-machine">
        <div className="input-node">
          <span>{busy ? 'YOUR ACTION' : trace ? 'LAST ACTION' : 'IT STARTS WITH YOU'}</span>
          <p>
            {busy ? pendingText : trace ? trace.text : 'A biscuit. A kind word. A clever idea.'}
          </p>
        </div>
        <div className="neural-wires" aria-hidden="true">
          <svg viewBox="0 0 300 55">
            <path d="M150 0v19M36 55V31q0-12 12-12h204q12 0 12 12v24M112 55V19m76 36V19" />
            <circle className="signal" cx="150" cy="10" r="3" />
          </svg>
          <span>
            {replaying
              ? 'PLAYBACK · NO API CALL'
              : busy
                ? mode === 'live'
                  ? 'JEV IS EVALUATING'
                  : 'REHEARSING'
                : '4 QUESTIONS · IN PARALLEL'}
          </span>
        </div>
        <div className="judgment-nodes">
          {judging.map(({ key, name, Icon, color }) => (
            <div
              key={key}
              className={`judgment-node ${color} ${activeTrace?.used.includes(key) ? 'node-used' : ''}`}
            >
              <div className="node-icon">
                <Icon size={21} strokeWidth={1.6} />
                {activeTrace?.used.includes(key) && (
                  <span className="node-check">
                    <Check size={9} />
                  </span>
                )}
              </div>
              <span>{name}</span>
            </div>
          ))}
        </div>
        <div className="output-wire" aria-hidden="true">
          <svg viewBox="0 0 300 39">
            <path d="M36 0v9q0 10 12 10h204q12 0 12-10V0M112 0v19m76-19v19m-38 0v20" />
            <circle className="signal" cx="150" cy="29" r="3" />
          </svg>
        </div>
        <div className={`outcome-node ${activeTrace?.changed ? 'outcome-success' : ''}`}>
          {busy ? (
            <LoaderCircle size={17} className="spin" />
          ) : activeTrace ? (
            activeTrace.changed ? (
              <Check size={17} />
            ) : (
              <CircleHelp size={17} />
            )
          ) : (
            <DoorOpen size={17} />
          )}
          <span>
            {busy
              ? 'Listening to your idea…'
              : activeTrace
                ? activeTrace.changed
                  ? 'The room changed.'
                  : 'The room has a reservation.'
                : 'A world that responds.'}
          </span>
        </div>
      </div>
      <div className="judgments-heading">
        <span>{trace || busy ? 'THE JUDGMENTS' : 'A PEEK BEHIND THE MAGIC'}</span>
        {trace && !busy && (
          <button className="replay-button" disabled={replaying} onClick={() => setReplaying(true)}>
            <Play size={10} />
            {replaying ? 'Replaying' : 'Replay'}
          </button>
        )}
        {trace && !busy && (
          <span className="inference-time">
            {trace.source === 'live' ? `${trace.durationMs.toLocaleString()} ms` : 'SCRIPTED'}
          </span>
        )}
      </div>
      <div className="judgment-results">
        {judging.map(({ key, name, question, Icon, color }) => {
          const a = activeTrace?.answers[key];
          const probability = a ? (a.type === 'choice' ? a.probabilities[a.choice] : a.noul) : null;
          const used = activeTrace?.used.includes(key);
          return (
            <div key={key} className={`judgment-result ${used ? 'result-used' : ''}`}>
              <span className={`mini-icon ${color}`}>
                <Icon size={15} />
              </span>
              <div className="judgment-copy">
                <span>
                  {name}
                  {activeTrace && !used && <small>unused</small>}
                </span>
                <p>
                  {busy
                    ? 'Evaluating…'
                    : a
                      ? a.type === 'choice'
                        ? actionNames[a.choice]
                        : a.noul >= 0.72
                          ? 'Yes'
                          : a.noul <= 0.28
                            ? 'No'
                            : 'Uncertain'
                      : question}
                </p>
                {a && trace?.source === 'live' && (
                  <div className="probability-track">
                    <i style={{ width: `${(probability ?? 0) * 100}%` }} />
                  </div>
                )}
              </div>
              <span className="probability-value">
                {busy
                  ? '···'
                  : probability !== null
                    ? trace?.source === 'live'
                      ? `${Math.round(probability * 100)}%`
                      : '—'
                    : ''}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mind-footnote">
        {trace?.source === 'live'
          ? 'Bars show returned probabilities. Highlighted judgments were used by the game. This is a decision map, not an internal thought process.'
          : mode === 'live'
            ? 'Real Jev judgments will appear here when you try an action. Inspecting objects uses only the game’s recorded facts.'
            : 'Rehearsal uses scripted decisions. No model probabilities or inference times are simulated.'}
      </p>
      <button className="trace-button" onClick={onTrace} disabled={!trace || busy}>
        <Code2 size={15} /> Inspect the actual request <ArrowUpRight size={14} />
      </button>
    </aside>
  );
}

export default function App() {
  const [room, setRoom] = useState<RoomState>(initialState);
  const [session, setSession] = useState('');
  const [mode, setMode] = useState<'live' | 'rehearsal'>('rehearsal');
  const [selected, setSelected] = useState<Target | null>(null);
  const [message, setMessage] = useState('Preparing your room…');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [pendingText, setPendingText] = useState('');
  const [trace, setTrace] = useState<Trace>();
  const [history, setHistory] = useState<Trace[]>([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<
    'rules' | 'trace' | 'restart' | 'connection' | 'history' | null
  >(null);
  const [hint, setHint] = useState(false);
  const [mobileView, setMobileView] = useState<'room' | 'mind'>('room');
  const [showEscape, setShowEscape] = useState(false);
  const inFlight = useRef(false);
  const generation = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  async function api(path: string, payload: unknown): Promise<SessionResponse> {
    const response = await fetch(`/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'The room is unavailable. Please try again.');
    return result;
  }
  function accept(result: SessionResponse) {
    setRoom(result.state);
    setMode(result.mode);
    setMessage(result.message);
  }
  async function start(fresh = false) {
    const current = ++generation.current;
    setLoading(true);
    setError('');
    setModal(null);
    try {
      const result = await api('session', {
        sessionId: fresh ? undefined : sessionStorage.getItem('elsewhere-session'),
      });
      if (current !== generation.current) return;
      setSession(result.sessionId);
      sessionStorage.setItem('elsewhere-session', result.sessionId);
      accept(result);
      setSelected(null);
      setText('');
      setTrace(result.trace);
      setHistory(result.trace ? [result.trace] : []);
      setHint(false);
      setShowEscape(false);
    } catch (e) {
      if (current === generation.current)
        setError(e instanceof Error ? e.message : 'Unable to prepare your room.');
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    void start();
    return () => {
      generation.current++;
    };
  }, []);
  async function select(target: Target) {
    if (inFlight.current || !session || room.escaped) return;
    inFlight.current = true;
    setSelected(target);
    setText('');
    setError('');
    setHint(false);
    try {
      accept(await api('inspect', { sessionId: session, revision: room.revision, target }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not inspect this object.');
    } finally {
      inFlight.current = false;
    }
  }
  async function act(actionText: string, suggestionId?: string) {
    if (!selected || inFlight.current || !actionText.trim() || room.escaped) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    setPendingText(actionText);
    setHint(false);
    try {
      const result = await api('act', {
        sessionId: session,
        revision: room.revision,
        target: selected,
        text: actionText.trim(),
        suggestionId,
      });
      accept(result);
      setTrace(result.trace);
      setText('');
      if (result.trace) setHistory((h) => [...h.slice(-7), result.trace!]);
      if (result.state.escaped) setShowEscape(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Jev could not be reached. Your room has not changed.',
      );
    } finally {
      setBusy(false);
      inFlight.current = false;
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    void act(text);
  }
  const SelectedIcon = selected ? objectIcons[selected] : MousePointer2;
  const progress = Number(room.caseOpened) + Number(room.companion) + Number(room.keyReturned);
  const hintText = !room.welcomeRead
    ? 'Try the welcome desk. A name can open more doors than a key.'
    : !room.caseOpened
      ? 'Your welcome card and the suitcase tag share a name and room number. Point out the connection.'
      : !room.trust
        ? 'Pip responds to kindness. A biscuit helps, but patient company can work too.'
        : !room.permissionGranted
          ? 'Management has an opinion about Pip. Try the telephone.'
          : !room.companion
            ? 'An invitation is different from an instruction. Let Pip choose to join you.'
            : !room.keyReturned
              ? 'The brass hook beside the door looks a little lonely.'
              : 'Everything is ready. Select the door and try leaving.';
  return (
    <>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Hotel Elsewhere home">
          <span className="brand-mark">
            <KeyRound size={21} strokeWidth={1.5} />
          </span>
          <span>
            hotel elsewhere<small>A VERY PARTICULAR LITTLE PLACE</small>
          </span>
        </a>
        <div className="header-right">
          <button
            className="quiet-button history-button"
            aria-label="Your stay"
            onClick={() => setModal('history')}
          >
            <BookOpen size={15} />
            <span>Your stay{history.length > 0 ? ` · ${history.length}` : ''}</span>
          </button>
          <button
            className="quiet-button"
            aria-label="House rules"
            onClick={() => setModal('rules')}
          >
            <BookOpen size={16} />
            <span>House rules</span>
          </button>
          <span className="header-divider" />
          <button
            className="icon-button"
            aria-label="Restart room"
            disabled={busy || loading}
            onClick={() => setModal('restart')}
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </header>
      <main>
        <section className="page-heading">
          <div>
            <div className="eyebrow">
              <span /> AN ESCAPE ROOM WITH A MIND OF ITS OWN
            </div>
            <h1>
              Please return the key<span>.</span>
            </h1>
            <p>Make yourself at home. Then figure out how to leave.</p>
          </div>
          <button onClick={() => setModal('connection')} className={`mode-badge ${mode}`}>
            <span className="status-light" />
            {loading ? 'Preparing room' : mode === 'live' ? 'Live with Jev' : 'Rehearsal mode'}
            <ChevronDown size={12} />
          </button>
        </section>
        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button onClick={() => void start()}>Reconnect</button>
            <button aria-label="Dismiss error" onClick={() => setError('')}>
              <X size={15} />
            </button>
          </div>
        )}
        <div className="mobile-view-tabs" role="tablist" aria-label="Game view">
          <button
            role="tab"
            aria-selected={mobileView === 'room'}
            onClick={() => setMobileView('room')}
          >
            <DoorOpen size={13} /> The room
          </button>
          <button
            role="tab"
            aria-selected={mobileView === 'mind'}
            onClick={() => setMobileView('mind')}
          >
            <Sparkles size={13} /> Jev’s decisions {busy && <span className="tab-live-dot" />}
          </button>
        </div>
        <div className={`game-layout mobile-${mobileView}`}>
          <section className="play-column" aria-label="Escape room">
            <div className="room-frame">
              <Room
                state={room}
                selected={selected}
                busy={busy || loading}
                onSelect={(target) => void select(target)}
              />
              <div className="room-toolbar">
                <span>
                  <span className="tiny-live-dot" />
                  {room.escaped
                    ? 'CHECKED OUT. NICELY DONE.'
                    : busy
                      ? 'THE ROOM IS CONSIDERING…'
                      : 'TAKE A LOOK AROUND'}
                </span>
                <button onClick={() => setHint(!hint)} disabled={loading}>
                  <CircleHelp size={14} />
                  {hint ? 'Hide hint' : 'A little nudge'}
                </button>
              </div>
            </div>
            {hint && (
              <div className="hint" role="status">
                <Sparkles size={17} />
                <p>{hintText}</p>
                <button aria-label="Close hint" onClick={() => setHint(false)}>
                  <X size={15} />
                </button>
              </div>
            )}
            <section className={`interaction-panel ${busy ? 'interaction-busy' : ''}`}>
              <div className="object-heading">
                <div className="object-icon">
                  <SelectedIcon size={21} />
                </div>
                <div>
                  <span className="eyebrow">
                    {selected ? objects[selected].eyebrow : 'YOUR STAY BEGINS HERE'}
                  </span>
                  <h2>{selected ? objects[selected].name : 'Every object has a story.'}</h2>
                </div>
                {selected && (
                  <span className="observed-badge">
                    <Eye size={12} /> Inspected
                  </span>
                )}
              </div>
              {trace && message === trace.result && !busy && (
                <div className="action-decisions">
                  <Sparkles size={12} />
                  <span>{trace.source === 'live' ? 'Jev' : 'Scripted'}</span>
                  {trace.used.map((key) => {
                    const a = trace.answers[key];
                    return (
                      <span key={key} className="decision-chip">
                        {key === 'intent' ? actionNames[trace.answers.intent.choice] : key}
                        {a.type === 'noul' && trace.source === 'live'
                          ? ` ${Math.round(a.noul * 100)}%`
                          : ''}
                      </span>
                    );
                  })}
                  <button onClick={() => setModal('trace')}>
                    See decision <ArrowUpRight size={11} />
                  </button>
                </div>
              )}
              <p className="room-message" role="status" aria-live="polite">
                {message}
              </p>
              {selected && !room.escaped ? (
                <>
                  <div className="suggestions">
                    {suggestedFor(selected, room).map((s) => (
                      <button
                        key={s.id}
                        aria-label={s.text}
                        disabled={busy || loading}
                        onClick={() => void act(s.text, s.id)}
                      >
                        {s.id === 'key' ? (
                          <KeyRound size={13} />
                        ) : s.id === 'biscuit' || s.id === 'take' ? (
                          <Cookie size={13} />
                        ) : (
                          <ArrowUpRight size={13} />
                        )}
                        <span>
                          {s.id === 'claim'
                            ? 'Show matching welcome card'
                            : s.id === 'kind'
                              ? 'Give Pip space'
                              : actionNames[s.intent]}
                        </span>
                      </button>
                    ))}
                  </div>
                  <form className="action-form" onSubmit={submit}>
                    <textarea
                      ref={inputRef}
                      aria-label="Describe your action"
                      placeholder={
                        mode === 'live'
                          ? 'Or try your own idea…'
                          : 'Custom ideas need live Jev. Try a suggested action above.'
                      }
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={800}
                      rows={1}
                      disabled={busy || mode === 'rehearsal'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void act(text);
                        }
                      }}
                    />
                    <button type="submit" disabled={busy || !text.trim() || mode === 'rehearsal'}>
                      {busy ? (
                        <LoaderCircle size={16} className="spin" />
                      ) : (
                        <ArrowRight size={18} />
                      )}
                      <span className="sr-only">Try action</span>
                    </button>
                  </form>
                  <div className="form-note">
                    <span>
                      {mode === 'live'
                        ? 'Be curious. The room understands more than you think.'
                        : 'Scripted rehearsal · no Jev requests'}
                    </span>
                    <span>
                      <CornerDownLeft size={11} /> to try
                    </span>
                  </div>
                </>
              ) : room.escaped ? (
                <button className="primary-button" onClick={() => setShowEscape(true)}>
                  Enjoy your checkout <ArrowUpRight size={15} />
                </button>
              ) : (
                <div className="initial-prompt">
                  <MousePointer2 size={15} />
                  <span>Click a glowing marker in the room. Look closely. Try something.</span>
                </div>
              )}
            </section>
            <section className="pockets">
              <div className="pocket-label">
                <Luggage size={16} />
                <span>WITH YOU</span>
              </div>
              <div className="pocket-items">
                {!room.keyReturned && (
                  <span>
                    <KeyRound size={15} /> Room key <small>borrowed</small>
                  </span>
                )}
                {room.welcomeRead && (
                  <span>
                    <ReceiptText size={15} /> Welcome card
                  </span>
                )}
                {room.biscuitHeld && (
                  <span>
                    <Cookie size={15} /> Biscuit <small>yours</small>
                  </span>
                )}
                {room.caseOpened && (
                  <span>
                    <Luggage size={15} /> Suitcase <small>yours</small>
                  </span>
                )}
                {room.companion && (
                  <span className="pip-pocket">
                    <PawPrint size={15} /> Pip <small>by choice</small>
                  </span>
                )}
                {room.keyReturned &&
                  !room.welcomeRead &&
                  !room.caseOpened &&
                  !room.biscuitHeld &&
                  !room.companion && (
                    <span className="empty-pocket">A little room for possibility.</span>
                  )}
              </div>
            </section>
          </section>
          <Mind
            trace={trace}
            busy={busy}
            pendingText={pendingText}
            mode={mode}
            onTrace={() => setModal('trace')}
          />
        </div>
        <section className="checkout-strip">
          <div>
            <span className="eyebrow">BEFORE YOU GO</span>
            <h3>A few little loose ends.</h3>
          </div>
          <div className="checkout-tasks">
            {[
              { label: 'Claim your suitcase', done: room.caseOpened },
              { label: 'Find a willing friend', done: room.companion },
              { label: 'Return the key', done: room.keyReturned },
            ].map((task, i) => (
              <div key={task.label} className={task.done ? 'task-done' : ''}>
                <span>{task.done ? <Check size={12} /> : `0${i + 1}`}</span>
                {task.label}
              </div>
            ))}
          </div>
          <span className="progress-count">
            {progress}
            <small>/ 3</small>
          </span>
        </section>
        <footer>
          <span>Made for the wonderfully curious.</span>
          <span>
            Small judgments. Unexpected possibilities. <span className="footer-star">✳</span>{' '}
            Powered by TypeSafe · Jev
          </span>
        </footer>
      </main>
      {modal === 'history' && (
        <Modal title="A record of your stay." onClose={() => setModal(null)}>
          {history.length === 0 ? (
            <p className="modal-intro">
              Your story is still unwritten. Try an action in the room and its real decision will
              appear here.
            </p>
          ) : (
            <div className="stay-history">
              {history
                .slice()
                .reverse()
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTrace(t);
                      setModal('trace');
                    }}
                  >
                    <span className={t.changed ? 'history-dot changed' : 'history-dot'} />
                    <span>
                      {t.text}
                      <small>{t.result}</small>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
            </div>
          )}
        </Modal>
      )}
      {modal === 'rules' && (
        <Modal title="A few house rules." onClose={() => setModal(null)}>
          <p className="modal-intro">
            Welcome to Hotel Elsewhere. We trust you will find our policies entirely reasonable.
            Eventually.
          </p>
          <ol className="rules-list">
            <li>
              <Luggage />
              <div>
                <h3>What’s yours is yours.</h3>
                <p>
                  Your suitcase expects a little evidence. Inspect the room and connect what you
                  discover.
                </p>
              </div>
            </li>
            <li>
              <Heart />
              <div>
                <h3>A friend is never property.</h3>
                <p>
                  Pip responds to kindness and chooses its own company. Management can explain the
                  arrangements.
                </p>
              </div>
            </li>
            <li>
              <KeyRound />
              <div>
                <h3>Please return the key.</h3>
                <p>
                  Leave with your luggage and your willing companion. The borrowed key belongs on
                  its hook.
                </p>
              </div>
            </li>
          </ol>
          <div className="how-to">
            <MousePointer2 size={18} />
            <p>
              Click objects to inspect them. Try a suggested action, or write your own in live mode.
              Watch the room’s judgments on the right. Need a clue? Ask for a little nudge.
            </p>
          </div>
          <button className="primary-button" onClick={() => setModal(null)}>
            Back to being curious <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {modal === 'connection' && (
        <Modal
          title={mode === 'live' ? 'A little intelligence, live.' : 'A rehearsal of the magic.'}
          onClose={() => setModal(null)}
        >
          <p className="modal-intro">
            {mode === 'live'
              ? 'This room sends your actions and the relevant game facts to TypeSafe’s Jev model. Four typed questions run together. The game applies only the judgments that matter to your action.'
              : 'No TypeSafe key was found when the server started. Suggested actions use scripted decisions, so you can explore the complete room without an API call.'}
          </p>
          <div className="connection-explainer">
            <span>
              <ShieldCheck size={18} /> Your API key stays on the server.
            </span>
            <span>
              <Eye size={18} /> Inspecting objects does not call the model.
            </span>
            <span>
              <Code2 size={18} /> Each action’s exact inputs and outputs are inspectable.
            </span>
          </div>
          {mode === 'rehearsal' && (
            <p className="setup-note">
              To play with Jev, set <code>TYPESAFE_API_KEY</code> in the local <code>.env</code>{' '}
              file and restart the server.
            </p>
          )}
          <p className="mind-footnote">
            Narration is authored by the game. The visualization displays returned decisions, not
            hidden reasoning. Model judgments can be mistaken; physical state and checkout rules are
            enforced in code.
          </p>
        </Modal>
      )}
      {modal === 'restart' && (
        <Modal title="Another little adventure?" onClose={() => setModal(null)}>
          <p className="modal-intro">
            Start a fresh stay in Room 08. Your current progress and decision history in this tab
            will be cleared.
          </p>
          <div className="modal-actions">
            <button className="quiet-button" onClick={() => setModal(null)}>
              Keep exploring
            </button>
            <button className="primary-button" onClick={() => void start(true)}>
              <RotateCcw size={15} /> Start a new stay
            </button>
          </div>
        </Modal>
      )}
      {modal === 'trace' && trace && (
        <Modal title="The actual decision." wide onClose={() => setModal(null)}>
          <div className="trace-meta">
            <span>{trace.source === 'live' ? 'LIVE RESPONSE' : 'SCRIPTED REHEARSAL'}</span>
            <span>{trace.model}</span>
            {trace.source === 'live' && (
              <>
                <span>{trace.durationMs} ms API round trip</span>
                <span>{trace.inputTokens ?? '—'} input tokens</span>
              </>
            )}
          </div>
          <p className="trace-action">“{trace.text}”</p>
          <p className="trace-explanation">
            The questions were evaluated independently. The game used{' '}
            <strong>{trace.used.join(', ')}</strong>. Choice percentages compare action options;
            Noul percentages estimate “yes.” The action requires Choice confidence ≥ 0.45; relevant
            Noul gates require ≥ 0.72. These are provisional game thresholds, not a guarantee of
            correctness.
          </p>
          <div className="trace-outcome">
            <Check size={16} />
            {trace.result}
          </div>
          <details open>
            <summary>Returned answers</summary>
            <pre>{JSON.stringify(trace.answers, null, 2)}</pre>
          </details>
          <details>
            <summary>Exact request (state + questions)</summary>
            <pre>{JSON.stringify(trace.request, null, 2)}</pre>
          </details>
        </Modal>
      )}
      {showEscape && (
        <Modal title="You may check out now." onClose={() => setShowEscape(false)}>
          <div className="escape-seal">
            <KeyRound size={36} />
            <span>AN EXCELLENT GUEST</span>
          </div>
          <p className="escape-copy">
            One suitcase.
            <br />
            One unexpected friend.
            <br />
            <em>A whole world outside.</em>
          </p>
          <p className="modal-intro">
            You understood the room, and the room understood you. Pip would like to know if there
            are biscuits where you’re going.
          </p>
          <div className="escape-stats">
            <span>{room.moves} actions</span>
            <span>{mode === 'live' ? 'Live Jev decisions' : 'Scripted rehearsal'}</span>
            <span>1 new friend</span>
          </div>
          <div className="modal-actions">
            <button className="quiet-button" onClick={() => setShowEscape(false)}>
              Admire the room
            </button>
            <button
              className="primary-button"
              onClick={() => {
                setShowEscape(false);
                void start(true);
              }}
            >
              Stay again <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

import { useState, useEffect } from 'react';
import {
  TrainFront,
  ArrowUpRight,
  ArrowRight,
  RotateCcw,
  Search,
  FileText,
  Check,
  LockKeyhole,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react';
import TrainCarriage from './TrainCarriage';
import { trainObjects, type Link } from '@last-train/shared';
import { useInvestigation } from './train/useInvestigation';
import { CasePanel } from './train/CasePanel';
import './train.css';
export default function TrainApp() {
  const { data, selected, text, setText, busy, error, intro, start, inspect, act } =
    useInvestigation();
  const [showTrace, setShowTrace] = useState(false);
  const [restart, setRestart] = useState(false);
  const s = data.state;
  const trace = data.trace;

  useEffect(() => {
    document.title = 'The Last Train · A mystery powered by Jev';
  }, []);

  async function restartCase() {
    setRestart(false);
    await start(true);
  }

  const grounds = ['private_detail', 'alibi'].filter((x) => s.links.includes(x as Link)).length;
  const chapter = s.escaped
    ? 'CASE CLOSED'
    : s.recovered
      ? '03 / LEAVE THE CARRIAGE'
      : grounds === 2
        ? '02 / REQUEST A SEARCH'
        : '01 / FOLLOW THE EVIDENCE';
  return (
    <div className="train-app">
      <header className="train-header">
        <a className="train-brand" href="/">
          <span>
            <TrainFront size={23} />
          </span>
          <div>
            the last train<small>A CASE OF MISTAKEN IDENTITY</small>
          </div>
        </a>
        <div className="train-route">
          <span>PORTO</span>
          <i />
          <TrainFront size={15} />
          <i />
          <span>THE BORDER</span>
          <small>Arrival at dawn</small>
        </div>
        <button aria-label="Restart investigation" onClick={() => setRestart(true)} disabled={busy}>
          <RotateCcw size={16} />
          <span>New case</span>
        </button>
      </header>
      <div className="train-title">
        <div>
          <div className="train-kicker">
            <span /> ONE CARRIAGE. THREE STORIES. ONE MISSING PASSPORT.
          </div>
          <h1>
            Someone aboard is lying<span>.</span>
          </h1>
          <p>Find your passport. Prove your case. Get off the train.</p>
        </div>
        <span className={`train-live ${data.mode === 'live' ? 'connected' : ''}`}>
          <i />
          {data.mode === 'live' ? 'Live with Jev' : 'Jev disconnected'}
          <Sparkles size={13} />
        </span>
      </div>
      <div className="train-layout">
        <section className="train-play">
          <TrainCarriage state={s} selected={selected} busy={busy} onSelect={inspect} />
          <div className="train-dialogue">
            <div className="train-dialogue-heading">
              <div>
                <small>
                  {selected ? trainObjects[selected].role : 'YOUR INVESTIGATION BEGINS HERE'}
                </small>
                <h2>
                  {s.escaped
                    ? 'Your journey is yours again.'
                    : selected
                      ? trainObjects[selected].name
                      : 'The blackout lasted ninety seconds.'}
                </h2>
              </div>
              <span>{selected ? <Search size={18} /> : <LockKeyhole size={18} />}</span>
            </div>
            <p className="train-response" role="status">
              {intro
                ? 'When the lights returned, your passport was gone. The conductor sealed the carriage. Three passengers have stories. Start with your luggage, then hear them out.'
                : data.message}
            </p>
            {s.escaped ? (
              <div className="train-complete">
                <Check size={18} /> Passport recovered · Carriage unlocked{' '}
                <button onClick={restartCase}>
                  Investigate again <ArrowRight size={14} />
                </button>
              </div>
            ) : selected ? (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void act();
                  }}
                  className="train-action"
                >
                  <textarea
                    rows={2}
                    maxLength={800}
                    aria-label="Your question or deduction"
                    placeholder={
                      selected === 'conductor'
                        ? 'Tell Ren what you have established, or ask for a search…'
                        : 'Ask a question, challenge a claim, or explain your deduction…'
                    }
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={busy}
                  />
                  <button aria-label="Present argument" disabled={busy || !text.trim()}>
                    <ArrowUpRight size={20} />
                  </button>
                </form>
                <div className="train-action-note">
                  <span>
                    {busy
                      ? 'Jev is evaluating your words…'
                      : 'Use your own words. A claim is not proof.'}
                  </span>
                  {selected === 'conductor' && grounds === 2 && !s.recovered ? (
                    <button
                      onClick={() =>
                        act(
                          'Please search Dr. Vale’s medical bag based on the two connections we established.',
                        )
                      }
                      disabled={busy}
                    >
                      Request a search <ChevronRight size={12} />
                    </button>
                  ) : selected === 'conductor' && s.recovered ? (
                    <button
                      onClick={() =>
                        act(
                          'Here is my recovered passport. Please unlock the carriage so I can leave.',
                        )
                      }
                      disabled={busy}
                    >
                      Show passport & leave <ChevronRight size={12} />
                    </button>
                  ) : (
                    <span>ENTER A DEDUCTION ↑</span>
                  )}
                </div>
              </>
            ) : (
              <div className="train-start-note">
                <Search size={14} /> Click a marker in the carriage to investigate.
              </div>
            )}
            {error && (
              <p className="train-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="train-evidence">
            <div>
              <FileText size={14} />
              <span>YOUR EVIDENCE</span>
              <b>{s.inspected.length}/6</b>
            </div>
            <div className="train-evidence-items">
              {s.inspected.length ? (
                s.inspected.map((t) => (
                  <button
                    key={t}
                    disabled={busy || s.escaped}
                    onClick={() => inspect(t)}
                    title={trainObjects[t].quote}
                  >
                    {trainObjects[t].clue}
                  </button>
                ))
              ) : (
                <span>Clues you discover will stay here.</span>
              )}
            </div>
          </div>
        </section>
        <CasePanel
          state={s}
          grounds={grounds}
          trace={trace}
          busy={busy}
          onInspectRequest={() => setShowTrace(true)}
        />
      </div>
      <footer className="train-footer">
        <span>{chapter}</span>
        <div>
          <span className={grounds === 2 ? 'done' : ''}>Connect the evidence</span>
          <ChevronRight size={12} />
          <span className={s.recovered ? 'done' : ''}>Recover your passport</span>
          <ChevronRight size={12} />
          <span className={s.escaped ? 'done' : ''}>Leave the carriage</span>
        </div>
        <span>Powered by TypeSafe · Jev</span>
      </footer>
      {(showTrace || restart) && (
        <div className="train-modal-backdrop">
          <section
            className="train-modal"
            role="dialog"
            aria-modal="true"
            aria-label={restart ? 'New investigation' : 'Actual Jev request'}
          >
            <button
              className="train-modal-close"
              aria-label="Close dialog"
              onClick={() => {
                setShowTrace(false);
                setRestart(false);
              }}
            >
              <X size={20} />
            </button>
            <h2>{restart ? 'Begin a new investigation?' : 'The actual judgment.'}</h2>
            {restart ? (
              <>
                <p>
                  This resets this case. The mystery has one fixed solution; different arguments can
                  uncover it.
                </p>
                <button className="train-solid" onClick={restartCase}>
                  Start new investigation
                </button>
              </>
            ) : (
              <>
                <p>
                  Live model: {trace?.model}. Dialogue is authored; Jev returns structured
                  judgments.
                </p>
                <pre>
                  {JSON.stringify({ request: trace?.request, answers: trace?.answers }, null, 2)}
                </pre>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

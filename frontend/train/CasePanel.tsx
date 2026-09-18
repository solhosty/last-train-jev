import { Link2, Check, LockKeyhole, Search, Sparkles, ArrowUpRight } from 'lucide-react';
import type { Link, TrainState, TrainTrace } from '@last-train/shared';

const linkNames: Record<Link, string> = {
  private_detail: 'Private knowledge → passport access',
  alibi: 'Night log → broken alibi',
  pianist: 'Dining receipt → secret meeting',
  courier: 'Glove dye → moved luggage',
  none: 'No connection',
};

interface CasePanelProps {
  state: TrainState;
  grounds: number;
  trace?: TrainTrace;
  busy: boolean;
  onInspectRequest: () => void;
}

export function CasePanel({ state, grounds, trace, busy, onInspectRequest }: CasePanelProps) {
  return (
    <aside className="train-case">
      <div className="train-kicker">
        <Link2 size={13} /> THE CASE TAKES SHAPE
      </div>
      <h2>Make the connection.</h2>
      <p className="train-case-intro">
        Facts stay fixed.
        <br />
        The argument is yours to make.
      </p>
      <div className="train-connections">
        {[
          {
            id: 'private_detail' as Link,
            title: 'Access to the passport',
            a: 'A private detail',
            b: 'Someone knows it',
          },
          {
            id: 'alibi' as Link,
            title: 'A story that does not hold',
            a: 'A passenger’s claim',
            b: 'Conflicting evidence',
          },
        ].map((c, i) => (
          <div
            className={`train-connection ${state.links.includes(c.id) ? 'linked' : ''}`}
            key={c.id}
          >
            <div>
              <span>0{i + 1}</span>
              <b>
                {state.links.includes(c.id)
                  ? c.id === 'private_detail'
                    ? 'Vale knew the Lisbon stamp'
                    : 'Vale was awake at 00:12'
                  : c.title}
              </b>
              {state.links.includes(c.id) ? <Check size={14} /> : <LockKeyhole size={13} />}
            </div>
            <p>
              {state.links.includes(c.id)
                ? c.id === 'private_detail'
                  ? 'Private knowledge → established access'
                  : 'Signed night log → broken alibi'
                : `${c.a}  ···  ${c.b}`}
            </p>
            <i />
          </div>
        ))}
      </div>
      <div className={`train-search-status ${grounds === 2 ? 'ready' : ''}`}>
        <Search size={16} />
        <span>
          {state.recovered
            ? 'Passport found in Vale’s bag'
            : grounds === 2
              ? 'Two grounds. Ren can authorize a search.'
              : `${grounds}/2 grounds for a search`}
        </span>
      </div>
      <div className="train-jev">
        <div className="train-jev-heading">
          <span>
            <Sparkles size={13} /> JEV’S LIVE JUDGMENT
          </span>
          {trace && <b>{busy ? '…' : trace.durationMs + ' ms'}</b>}
        </div>
        {trace ? (
          <>
            <p className="train-last-action">“{trace.text}”</p>
            {[
              {
                key: 'intent',
                label: 'Action',
                value: trace.answers.intent.choice,
                p: trace.answers.intent.probabilities[trace.answers.intent.choice],
              },
              {
                key: 'connection',
                label: 'Connection',
                value: linkNames[trace.answers.connection.choice],
                p: trace.answers.connection.probabilities[trace.answers.connection.choice],
              },
              {
                key: 'supported',
                label: 'Supported by evidence',
                value: trace.answers.supported.noul >= 0.75 ? 'Yes' : 'Not established',
                p: trace.answers.supported.noul,
              },
            ].map((r) => (
              <div
                className={`train-judgment ${trace.used.includes(r.key) ? 'used' : ''}`}
                key={r.key}
              >
                <div>
                  <span>
                    {r.label}
                    {!trace.used.includes(r.key) && <small> unused</small>}
                  </span>
                  <b>{busy ? '···' : Math.round(r.p * 100) + '%'}</b>
                </div>
                <p>{busy ? 'Evaluating…' : r.value}</p>
                <div className="train-bar">
                  <i style={{ width: busy ? '0%' : `${r.p * 100}%` }} />
                </div>
              </div>
            ))}
            <button className="train-request" onClick={onInspectRequest}>
              Inspect actual request <ArrowUpRight size={13} />
            </button>
          </>
        ) : (
          <div className="train-jev-empty">
            <span>YOUR WORDS</span>
            <div>Question → Connection → Evidence</div>
            <p>
              Jev interprets your argument. The game checks discovered facts and changes the story.
            </p>
          </div>
        )}
        <p className="train-explainer">
          {busy
            ? 'A live request is in flight.'
            : 'Model probabilities, not proof of guilt. Highlighted judgments are used by the game.'}
        </p>
      </div>
    </aside>
  );
}

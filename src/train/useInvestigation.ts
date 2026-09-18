import { useCallback, useEffect, useRef, useState } from 'react';
import { newTrain, type TrainResponse, type TrainTarget } from '../train-game';

const SESSION_KEY = 'last-train-session';

async function request(path: 'session' | 'inspect' | 'act', body: unknown): Promise<TrainResponse> {
  const response = await fetch(`/api/train/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'The carriage is unavailable.');
  return result as TrainResponse;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The carriage is unavailable. Please retry.';
}

/** Keeps request serialization and session revisions out of the presentation components. */
export function useInvestigation() {
  const [data, setData] = useState<TrainResponse>({
    sessionId: '',
    state: newTrain(),
    mode: 'unavailable',
    message: 'Preparing the carriage…',
  });
  const [selected, setSelected] = useState<TrainTarget | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [intro, setIntro] = useState(true);
  const inFlight = useRef(false);

  const start = useCallback(async (fresh = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await request('session', {
        sessionId: fresh ? undefined : sessionStorage.getItem(SESSION_KEY),
      });
      setData(result);
      sessionStorage.setItem(SESSION_KEY, result.sessionId);
      setSelected(null);
      setText('');
      setIntro(result.state.inspected.length === 0);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void start();
  }, [start]);

  async function inspect(target: TrainTarget) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await request('inspect', {
        sessionId: data.sessionId,
        revision: data.state.revision,
        target,
      });
      setData(result);
      setSelected(target);
      setText('');
      setIntro(false);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function act(value = text) {
    if (!selected || inFlight.current || !value.trim()) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      setData(
        await request('act', {
          sessionId: data.sessionId,
          revision: data.state.revision,
          target: selected,
          text: value,
        }),
      );
      setText('');
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return { data, selected, text, setText, busy, error, intro, start, inspect, act };
}

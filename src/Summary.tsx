import { useState } from 'react';
import './Summary.css';
import type { Ord } from './engine/dates';
import { parseRanges } from './engine/ranges';
import { earliestEntry, type Analysis, type Rules } from './engine/schengen';
import { formatDay, plural } from './format';
import type { History, SelectionStore } from './state/selection';

type SummaryProps = {
  today: Ord;
  rules: Rules;
  selected: ReadonlySet<Ord>;
  analysis: Analysis;
  store: SelectionStore;
  history: History;
};

const ImportTrips = ({ store }: { store: SelectionStore }) => {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const submit = () => {
    const { days, errors } = parseRanges(text);
    if (errors.length) {
      setMessage(`Can't read line ${errors.join(', ')} (use YYYY-MM-DD YYYY-MM-DD)`);
      return;
    }
    store.add(days);
    setText('');
    setMessage(`Added ${plural(days.length, 'day')}`);
  };
  return (
    <details className="Summary-Tools">
      <summary>Import trips</summary>
      <textarea
        aria-label="Trips, one per line"
        placeholder={'2026-07-21 2026-08-02\n2026-10-04'}
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="Summary-Actions">
        <button type="button" onClick={submit} disabled={!text.trim()}>
          Add
        </button>
        <button
          type="button"
          onClick={() => window.confirm('Remove all marked days?') && store.clear()}
        >
          Clear all
        </button>
      </div>
      {message ? <p className="Summary-Message">{message}</p> : null}
    </details>
  );
};

const Summary = ({ today, rules, selected, analysis, store, history }: SummaryProps) => {
  const used = analysis.count(today);
  const stay = analysis.stayFrom(today);
  const entry = stay > 0 ? today : earliestEntry(analysis, today + 1);
  const planned = [...selected].filter((d) => d > today).length;
  const firstOver = analysis.overstays[0];

  return (
    <section className="Summary" aria-label="Summary">
      <div className="Summary-Section" aria-live="polite">
        <span className="Summary-Number">{used}</span>
        <span className="Summary-Label">
          of {rules.max} days used in the last {rules.window}
        </span>
      </div>
      <ul className="Summary-Facts" aria-live="polite">
        <li>{plural(Math.max(rules.max - used, 0), 'day')} left today</li>
        {stay > 0 ? (
          <li>
            {selected.has(today) ? 'Can stay' : 'Enter today: stay'} up to {plural(stay, 'day')},
            until {formatDay(today + stay - 1)}
          </li>
        ) : entry !== null ? (
          <li>
            Earliest entry {formatDay(entry)}, for up to {plural(analysis.stayFrom(entry), 'day')}
          </li>
        ) : null}
        {planned ? <li>{plural(planned, 'day')} planned</li> : null}
        {firstOver !== undefined ? (
          <li className="Summary-Warning" role="alert">
            Overstay on {plural(analysis.overstays.length, 'day')}, first {formatDay(firstOver)}
          </li>
        ) : null}
      </ul>
      <div className="Summary-Actions Summary-History">
        <button type="button" onClick={store.undo} disabled={!history.canUndo} title="Ctrl+Z">
          Undo
        </button>
        <button type="button" onClick={store.redo} disabled={!history.canRedo} title="Ctrl+Shift+Z">
          Redo
        </button>
      </div>
      <p className="Summary-Hint">
        Drag across days to mark or clear a trip (long-press on touch). Shift+click extends.
      </p>
      <ImportTrips store={store} />
    </section>
  );
};

export default Summary;

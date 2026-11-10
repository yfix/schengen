import { useState } from 'react';
import { parseIso, toIso, type Ord } from './engine/dates';
import { earliestEntry, type Analysis, type Rules } from './engine/schengen';
import { formatDay, plural } from './format';

type PlannerProps = { today: Ord; rules: Rules; analysis: Analysis };

const Planner = ({ today, rules, analysis }: PlannerProps) => {
  const [entryIso, setEntryIso] = useState(toIso(today));
  const [length, setLength] = useState('14');
  const entry = parseIso(entryIso);
  const inRange = entry !== null && entry >= today && entry <= analysis.to;
  const stay = inRange ? analysis.stayFrom(entry) : 0;
  const days = Number(length);
  const validLength = Number.isInteger(days) && days >= 1 && days <= rules.max;
  const first = validLength ? earliestEntry(analysis, today, days) : null;

  return (
    <details className="Summary-Tools Planner">
      <summary>Plan a trip</summary>
      <label>
        Enter on{' '}
        <input
          type="date"
          value={entryIso}
          min={toIso(today)}
          max={toIso(analysis.to)}
          onChange={(e) => setEntryIso(e.target.value)}
        />
      </label>
      <p className="Summary-Message" aria-live="polite">
        {!inRange
          ? `Pick a date from ${formatDay(today)} to ${formatDay(analysis.to)}`
          : stay > 0
            ? `Stay up to ${plural(stay, 'day')}, leave by ${formatDay(entry + stay - 1)}`
            : 'No days left on that date'}
      </p>
      <label>
        Earliest entry for{' '}
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={rules.max}
          value={length}
          onChange={(e) => setLength(e.target.value)}
          aria-label="Trip length in days"
        />{' '}
        days
      </label>
      <p className="Summary-Message" aria-live="polite">
        {!validLength
          ? `Enter 1 to ${String(rules.max)} days`
          : first === null
            ? `Not possible before ${formatDay(analysis.to)}`
            : `${formatDay(first)}, leave by ${formatDay(first + days - 1)}`}
      </p>
    </details>
  );
};

export default Planner;

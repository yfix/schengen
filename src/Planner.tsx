import { useState } from 'react';
import { parseIso, toIso, type Ord } from './engine/dates';
import { earliestEntry, type Analysis, type Rules } from './engine/schengen';
import { useI18n } from './i18n';

type PlannerProps = { today: Ord; rules: Rules; analysis: Analysis };

const Planner = ({ today, rules, analysis }: PlannerProps) => {
  const { t, fmt } = useI18n();
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
      <summary>{t.plan}</summary>
      <label>
        {t.enterOn}{' '}
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
          ? t.pickRange(fmt.day(today), fmt.day(analysis.to))
          : stay > 0
            ? t.stayUpTo(stay, fmt.day(entry + stay - 1))
            : t.noDaysOnDate}
      </p>
      <label>
        {t.earliestFor}{' '}
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={rules.max}
          value={length}
          onChange={(e) => setLength(e.target.value)}
          aria-label={t.tripLength}
        />{' '}
        {t.daysUnit}
      </label>
      <p className="Summary-Message" aria-live="polite">
        {!validLength
          ? t.enterRange(rules.max)
          : first === null
            ? t.notPossibleBefore(fmt.day(analysis.to))
            : t.firstLeave(fmt.day(first), fmt.day(first + days - 1))}
      </p>
    </details>
  );
};

export default Planner;

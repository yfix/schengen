import './Summary.css';
import DataTools from './DataTools';
import type { Ord } from './engine/dates';
import { earliestEntry, type Analysis, type Rules } from './engine/schengen';
import { useI18n } from './i18n';
import Planner from './Planner';
import Prefs from './Prefs';
import TripList from './TripList';
import type { PrefsStore } from './state/prefs';
import type { History, SelectionStore } from './state/selection';

type SummaryProps = {
  today: Ord;
  rules: Rules;
  selected: ReadonlySet<Ord>;
  analysis: Analysis;
  store: SelectionStore;
  history: History;
  firstRelevant: Ord;
  prefs: PrefsStore;
  weekStart: number;
};

const Summary = ({
  today,
  rules,
  selected,
  analysis,
  store,
  history,
  firstRelevant,
  prefs,
  weekStart,
}: SummaryProps) => {
  const { t, fmt } = useI18n();
  const used = analysis.count(today);
  const stay = analysis.stayFrom(today);
  const entry = stay > 0 ? today : earliestEntry(analysis, today + 1);
  const planned = [...selected].filter((d) => d > today).length;
  const firstOver = analysis.overstays[0];

  return (
    <section className="Summary" aria-label={t.summary}>
      <Prefs store={prefs} weekStart={weekStart} />
      <div className="Summary-Section" aria-live="polite">
        <span className="Summary-Number">{used}</span>
        <span className="Summary-Label">{t.usedOf(rules.max, rules.window)}</span>
      </div>
      <ul className="Summary-Facts" aria-live="polite">
        <li>{t.leftToday(Math.max(rules.max - used, 0))}</li>
        {stay > 0 ? (
          <li>
            {(selected.has(today) ? t.canStay : t.enterToday)(stay, fmt.day(today + stay - 1))}
          </li>
        ) : entry !== null ? (
          <li>{t.earliestEntry(fmt.day(entry), analysis.stayFrom(entry))}</li>
        ) : null}
        {planned ? <li>{t.planned(planned)}</li> : null}
        {firstOver !== undefined ? (
          <li className="Summary-Warning" role="alert">
            {t.overstayOn(analysis.overstays.length, fmt.day(firstOver))}
          </li>
        ) : null}
      </ul>
      <div className="Summary-Actions Summary-History">
        <button type="button" onClick={store.undo} disabled={!history.canUndo} title="Ctrl+Z">
          {t.undo}
        </button>
        <button type="button" onClick={store.redo} disabled={!history.canRedo} title="Ctrl+Shift+Z">
          {t.redo}
        </button>
      </div>
      <p className="Summary-Hint">{t.dragHint}</p>
      <Planner today={today} rules={rules} analysis={analysis} />
      <TripList selected={selected} min={firstRelevant} store={store} />
      <DataTools store={store} selected={selected} rules={rules} />
    </section>
  );
};

export default Summary;

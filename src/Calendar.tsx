import {
  memo,
  useEffect,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type PointerEventHandler,
  type RefObject,
} from 'react';
import './Calendar.css';
import { fromOrd, type Ord } from './engine/dates';
import type { Analysis } from './engine/schengen';
import type { DragRange } from './state/useDragSelect';
import { useI18n, type I18n } from './i18n';

type DayState = {
  ord: Ord;
  selected: boolean;
  today: boolean;
  inactive: boolean;
  over: boolean;
  stay: number | null;
  used: number | null;
  max: number;
  inRange: boolean;
  focusable: boolean;
};

type DragHandlers = {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerMove: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onPointerCancel: PointerEventHandler<HTMLElement>;
};

type CalendarProps = {
  from: Ord;
  to: Ord;
  firstRelevant: Ord;
  today: Ord;
  selected: ReadonlySet<Ord>;
  analysis: Analysis;
  max: number;
  range: DragRange | null;
  listRef: RefObject<HTMLDivElement | null>;
  handlers: DragHandlers;
  focus: Ord;
  weekStart: number;
  keys: {
    onKeyDown: KeyboardEventHandler<HTMLElement>;
    onFocus: FocusEventHandler<HTMLElement>;
  };
};

const label = (s: DayState, { t, fmt }: I18n) => {
  const parts = [fmt.day(s.ord)];
  if (s.today) parts.push(t.today);
  if (s.selected) parts.push(t.inSchengen);
  if (s.over) parts.push(t.overstay);
  if (s.used !== null) parts.push(t.usedInWindow(s.used, s.max));
  if (s.stay !== null) parts.push(s.stay > 0 ? t.entryAllows(s.stay) : t.noDaysLeft);
  return parts.join(', ');
};

const Day = memo(function Day(state: DayState) {
  const i18n = useI18n();
  const text = label(state, i18n);
  const { date, month } = fromOrd(state.ord);
  const classes = ['Day', month % 2 ? 'Day-Odd' : 'Day-Even'];
  if (state.inactive) classes.push('Day-Disabled');
  if (state.selected) classes.push('Day-Selected');
  if (state.today) classes.push('Day-Today');
  if (state.over) classes.push('Day-Over');
  if (state.stay === 0) classes.push('Day-Blocked');
  if (state.inRange) classes.push('Day-InRange');
  return (
    <div
      role="button"
      aria-pressed={state.selected}
      aria-disabled={state.inactive || undefined}
      aria-label={text}
      title={text}
      data-ord={state.ord}
      tabIndex={state.focusable ? 0 : -1}
      className={classes.join(' ')}
    >
      {date}
      {state.stay ? <small className="Day_Available">{state.stay}</small> : null}
    </div>
  );
});

const Calendar = ({
  from,
  to,
  firstRelevant,
  today,
  selected,
  analysis,
  max,
  range,
  listRef,
  handlers,
  focus,
  keys,
  weekStart,
}: CalendarProps) => {
  const { t, fmt } = useI18n();
  useEffect(() => {
    listRef.current?.querySelector('.Day-Today')?.scrollIntoView({ block: 'center' });
  }, [listRef]);

  const offset = (fromOrd(from).weekday - weekStart + 7) % 7;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(<div key={`pad-${i}`} className="Day Day-Empty" />);
  for (let ord = from; ord <= to; ord++) {
    const isSelected = selected.has(ord);
    const state: DayState = {
      ord,
      selected: isSelected,
      today: ord === today,
      inactive: ord < firstRelevant,
      over: isSelected && analysis.remaining(ord) < 0,
      stay: !isSelected && ord >= today ? analysis.stayFrom(ord) : null,
      used: ord < firstRelevant ? null : analysis.count(ord),
      max,
      inRange: range !== null && ord >= range.lo && ord <= range.hi,
      focusable: ord === focus,
    };
    if (fromOrd(ord).date === 1)
      cells.push(
        <div key={`m-${ord}`} className="Month" aria-hidden="true">
          {fmt.month(ord)}
        </div>,
      );
    cells.push(<Day key={ord} {...state} />);
  }

  return (
    <div className="Calendar">
      <div className="Calendar-Weekdays" aria-hidden="true">
        {fmt.weekdays(weekStart).map((name) => (
          <div key={name} className="Weekday">
            {name}
          </div>
        ))}
      </div>
      <div
        ref={listRef}
        className={range ? 'Calendar-List Calendar-Dragging' : 'Calendar-List'}
        role="group"
        aria-label={t.calendar}
        aria-describedby="Calendar-Keys"
        {...handlers}
        {...keys}
      >
        {cells}
      </div>
      <p id="Calendar-Keys" className="Calendar-Hint">
        {t.keysHint}
      </p>
    </div>
  );
};

export default Calendar;

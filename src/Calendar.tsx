import { memo, useEffect, type PointerEventHandler, type RefObject } from 'react';
import './Calendar.css';
import { fromOrd, type Ord } from './engine/dates';
import type { Analysis } from './engine/schengen';
import type { DragRange } from './state/useDragSelect';
import { formatDay, formatMonth, weekdayNames } from './format';

type DayState = {
  ord: Ord;
  selected: boolean;
  today: boolean;
  inactive: boolean;
  over: boolean;
  stay: number | null;
  inRange: boolean;
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
  range: DragRange | null;
  listRef: RefObject<HTMLDivElement | null>;
  handlers: DragHandlers;
};

const label = (s: DayState) => {
  const parts = [formatDay(s.ord)];
  if (s.today) parts.push('today');
  if (s.selected) parts.push('in Schengen');
  if (s.over) parts.push('overstay');
  if (s.stay !== null)
    parts.push(s.stay > 0 ? `entering here allows ${s.stay} days` : 'no days left');
  return parts.join(', ');
};

const Day = memo(function Day(state: DayState) {
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
      aria-label={label(state)}
      title={label(state)}
      data-ord={state.ord}
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
  range,
  listRef,
  handlers,
}: CalendarProps) => {
  useEffect(() => {
    listRef.current?.querySelector('.Day-Today')?.scrollIntoView?.({ block: 'center' });
  }, [listRef]);

  const offset = (fromOrd(from).weekday + 6) % 7;
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
      inRange: range !== null && ord >= range.lo && ord <= range.hi,
    };
    if (fromOrd(ord).date === 1)
      cells.push(
        <div key={`m-${ord}`} className="Month" aria-hidden="true">
          {formatMonth(ord)}
        </div>,
      );
    cells.push(<Day key={ord} {...state} />);
  }

  return (
    <div className="Calendar">
      <div className="Calendar-Weekdays" aria-hidden="true">
        {weekdayNames.map((name) => (
          <div key={name} className="Weekday">
            {name}
          </div>
        ))}
      </div>
      <div
        ref={listRef}
        className={range ? 'Calendar-List Calendar-Dragging' : 'Calendar-List'}
        role="group"
        aria-label="Calendar"
        {...handlers}
      >
        {cells}
      </div>
    </div>
  );
};

export default Calendar;

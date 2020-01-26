import React from 'react';
import './Calendar.css';

const monthsNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatMonth = d => `${monthsNames[d.month]} ${d.year}`;

const dayClassName = day => `Day ${day.date.month % 2 ? 'Day-Odd' : 'Day-Even'}${day.disabled ? ' Day-Disabled' : ''}${day.selected ? ' Day-Selected' : ''}${day.today ? ' Day-Today' : ''}`;

const repeat = (times, fn) => {
  const results = [];
  for (let i = 1; i <= times; i++)
    results.push(fn(i));
  return results;
};

/**
 * @typedef {{ date: FlatDate, today?: boolean, disabled?: boolean, selected?: boolean }} Day
 * @param {object} props
 * @param {Array<Day>} props.days
 * @param {(day: Day) => void} props.toggleSelection
 */
const Calendar = ({ days, toggleSelection }) => (
  <div className="Calendar">
    <div className="Calendar-List">
      {repeat(days[0].date.day, i => <div key={i} className="Day Day-Empty"></div>)}
      {days.map(day => (
        <>
          {day.date.date === 1
            ? <div className="Month">{formatMonth(day.date)}</div>
            : undefined}
          <div key={day.date.toString() + Math.random()} onClick={() => toggleSelection(day)} className={dayClassName(day)}>
            {day.date.date}
          </div>
        </>
      ))}
    </div>
  </div>
);

export default Calendar;

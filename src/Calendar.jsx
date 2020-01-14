import React from 'react';
import './Calendar.css';

const monthsNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatMonth = d => `${monthsNames[d.getMonth()]} ${d.getFullYear()}`;

const dayClassName = day => `Day ${day.date.getMonth() % 2 ? 'Day-Odd' : 'Day-Even'}${day.disabled ? ' Day-Disabled' : ''}${day.selected ? ' Day-Selected' : ''}${day.today ? ' Day-Today' : ''}`;

const repeat = (times, fn) => {
  const results = [];
  for (let i = 1; i <= times; i++)
    results.push(fn(i));
  return results;
};

/**
 * @typedef {{ date: Date, today?: boolean, disabled?: boolean, selected?: boolean }} Day
 * @param {object} props
 * @param {Array<Day>} props.days
 * @param {(day: Day) => void} props.toggleSelection
 */
const Calendar = ({ days, toggleSelection }) => (
  <div className="Calendar">
    <div className="CalendarList">
      {repeat(days[0].date.getDay(), i => <div key={i} className="Day Day-Empty"></div>)}
      {days.map(day => (
        <>
          {day.date.getDate() === 1
            ? <div className="Month">{formatMonth(day.date)}</div>
            : undefined}
          <div key={day.date.toString()} onClick={() => toggleSelection(day)} className={dayClassName(day)}>
            {day.date.getDate()}
          </div>
        </>
      ))}
    </div>
  </div>
);

export default Calendar;
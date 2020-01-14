import React, { useState } from 'react';
import './App.css';
import Calendar from './Calendar';

const countSelected = days => days.filter(d => d.selected).length;

const collectDays = () => {
  const now = new Date();
  /** @type {Array<{ date: Date, today?: boolean, disabled?: boolean, selected?: boolean }>} */
  const days = [];

  for (let i = 180; i--;)
    days.push({ date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - i) });

  days[days.length - 1].today = true;

  do {
    const firstDay = days[0].date;
    const prevDay = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() - 1);
    if (prevDay.getMonth() !== firstDay.getMonth())
        break;
    days.unshift({ date: prevDay, disabled: true });
  } while (true);
  
  
  do {
    const lastDay = days[days.length - 1].date;
    const nextDay = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1);
    if (nextDay.getMonth() !== lastDay.getMonth())
        break;
    days.push({ date: nextDay, disabled: true });
  } while (true);

  return days;
};

const App = () => {
  const [days, updateDays] = useState(collectDays());

  const toggleSelection = day => {
    if (day.disabled)
      return;
    updateDays(days.map(d => d === day ? { ...day, selected: !day.selected } : d));
  };

  return (
    <div className="App">
      <div className="Counter">{countSelected(days)}</div>
      <Calendar days={days} toggleSelection={toggleSelection} />
    </div>
  );
};

export default App;
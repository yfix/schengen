import React from 'react';
import './App.css';
import useStorage from './useStorage';
import Calendar from './Calendar';
import Summary from './Summary';
import collectDays from './collectDays';

const App = () => {
  const [days, updateDays] = useStorage('days', collectDays);

  const toggleSelection = day => {
    if (day.disabled)
      return;
    updateDays(days.map(d => d === day ? { ...day, selected: !day.selected } : d));
  };

  return (
    <div className="App">
      <Summary days={days} />
      <Calendar days={days} toggleSelection={toggleSelection} />
    </div>
  );
};

export default App;
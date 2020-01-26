import { useState, useEffect } from 'react';
import collectDays from './collectDays';
import findDate from './findDate';

const originalDays = collectDays();

const useSchengenDays = (selectedDates) => {
  const [days, update] = useState(originalDays);

  useEffect(() => {
    const daysWithSelections = originalDays.map(day => {
      return findDate(selectedDates, day.date)
        ? { ...day, selected: true }
        : day;
    });
    update(daysWithSelections)
  }, [selectedDates]);

  return days;
};

export default useSchengenDays;
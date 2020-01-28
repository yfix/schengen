import { useState, useEffect } from 'react';
import collectDays from './collectDays';
import findDate from './findDate';

const originalDays = collectDays();

/**
 * @param {Array<DatePointer>} selectedDates
 * @returns {(day: Day) => Day}
 */
const markWithSelect = selectedDates => day => {
  return findDate(selectedDates, day.date)
    ? { ...day, selected: true }
    : day;
};

/**
 * @param {Array<DatePointer>} selectedDates
 * @returns {Array<Day>}
 */
const useSchengenDays = (selectedDates) => {
  const [days, update] = useState(originalDays);
  useEffect(() => {
    const days = originalDays
      .map(markWithSelect(selectedDates));
    update(days);
  }, [selectedDates]);

  return days;
};

export default useSchengenDays;
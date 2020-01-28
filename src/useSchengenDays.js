import { useState, useEffect } from 'react';
import compareDates from './compareDates';
import collectDays from './collectDays';
import findDate from './findDate';
import getToday from './today';
import { MAX_DAYS_IN_SCHENGEN, SCHENGEN_RANGE } from './constants';

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
 * @returns {(day: Day, index: number, allDays: Array<Day>) => Day}
 */
const addAvailability = () => {
  const today = getToday();
  let daysInSchengen = 0;
  return (day, index, allDays) => {
    if (compareDates(day.date, today) < 0) {
      if (day.selected) daysInSchengen++;
      return day;
    }
    if (allDays[index - SCHENGEN_RANGE].selected)
      daysInSchengen--;
    const available = MAX_DAYS_IN_SCHENGEN - daysInSchengen;
    return { ...day, available };
  };
};

/**
 * @param {Array<DatePointer>} selectedDates
 * @returns {Array<Day>}
 */
const useSchengenDays = (selectedDates) => {
  const [days, update] = useState(originalDays);
  useEffect(() => {
    const days = originalDays
      .map(markWithSelect(selectedDates))
      .map(addAvailability());
    update(days);
  }, [selectedDates]);

  return days;
};

export default useSchengenDays;
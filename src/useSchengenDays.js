import { useState, useEffect } from 'react';
import collectDays from './collectDays';
import findDate from './findDate';
import { MAX_DAYS_IN_SCHENGEN, SCHENGEN_RANGE } from './settings';

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
 * @param {Day} day
 * @returns {Day}
 */
const resetAvailability = day => ({
  ...day,
  available: day.outOfRange ? 0 : 1
});

const countRangesAvailability = days => {
  let available = MAX_DAYS_IN_SCHENGEN;
  for (let i = 0; i < SCHENGEN_RANGE; i++) {
    if (days[i].selected)
      available--;
  }

  const rangesAvailability = [available];
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1].selected)
      available++;
    if (days[i + SCHENGEN_RANGE - 1] &&days[i + SCHENGEN_RANGE - 1].selected)
      available--;
      rangesAvailability.push(available);
  }

  // console.log(rangesAvailability);
  return rangesAvailability;
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
      .map(resetAvailability);

    const rangesAvailability = countRangesAvailability(days);

    (() => { // Filter unavailable days
      for (let i = 0; i < rangesAvailability.length; i++) {
        if (rangesAvailability[i] > 0)
          continue;

        for (let ii = SCHENGEN_RANGE; ii--;) {
          if (!days[i + ii].selected)
            days[i + ii].available = -1;
        }
      }
    })();

    (() => { // Count availability
      let todayIndex = 0;
      for (let i = 0; i < days.length; i++) {
        if (!days[i].today && todayIndex === i) {
          todayIndex++;
          continue;
        }
        const bottomEdge = i - SCHENGEN_RANGE + 1 <= 0 ? 0 : i - SCHENGEN_RANGE + 1;
        const minOfRange = Math.min(...rangesAvailability.slice(bottomEdge, i + 1));
        days[i].available = minOfRange + (days[i].selected ? 1 : 0);
      }

      for (let i = todayIndex; i < days.length; i++) {
        let available = days[i].available;
        if (available < 1)
          continue;

        let last = available;
        for (let s = 1; s <= last; s++) {
          const next = i + s;
          if (next >= days.length)
            break;

          if (days[next].selected || days[next].available > (days[next - 1].available - (days[next - 1].selected ? 1 : 0))) {
            available++;
            last++;
          }
        }

        days[i].available = available > MAX_DAYS_IN_SCHENGEN ? MAX_DAYS_IN_SCHENGEN : available;
      }
    })();

    update(days);
  }, [selectedDates]);

  return days;
};

export default useSchengenDays;
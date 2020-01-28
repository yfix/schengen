import compareDates from './compareDates';
import getToday from './today';

const cleanOutdatedDates = (dates, daysLimit) => {
  const today = getToday();
  const startOfSchengenPeriod = new Date(today.year, today.month, today.date - daysLimit);
  const minimalDate = {
    year: startOfSchengenPeriod.getFullYear(),
    month: startOfSchengenPeriod.getMonth(),
    date: startOfSchengenPeriod.getDate()
  };
  return dates.filter(date => compareDates(minimalDate, date) <= 0);
};

export default cleanOutdatedDates;
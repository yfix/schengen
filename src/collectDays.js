import date from './date';
import getToday from './today';
import { SCHENGEN_RANGE } from './constants';

const collectDays = () => {
  const today = getToday();
  /** @type {Array<{ date: FlatDate, today?: boolean, disabled?: boolean, selected?: boolean }>} */
  const days = [];

  for (let i = SCHENGEN_RANGE; i--;)
    days.push({ date: date(today.year, today.month, today.date - i) });

  days[days.length - 1].today = true;

  for (let i = 1; i <= SCHENGEN_RANGE; i++)
    days.push({ date: date(today.year, today.month, today.date + i), disabled: true });

  do {
    const firstDay = days[0].date;
    const prevDay = date(firstDay.year, firstDay.month, firstDay.date - 1);
    if (prevDay.month !== firstDay.month)
        break;
    days.unshift({ date: prevDay, disabled: true });
  } while (true);
  
  
  do {
    const lastDay = days[days.length - 1].date;
    const nextDay = date(lastDay.year, lastDay.month, lastDay.date + 1);
    if (nextDay.month !== lastDay.month)
        break;
    days.push({ date: nextDay, disabled: true });
  } while (true);

  return days;
};

export default collectDays;
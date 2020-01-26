/**
 * @typedef {{ year: number, month: number, date: number, day: number, toString(): string }} FlatDate
 * @param {number} year
 * @param {number} month
 * @param {number} date
 * @returns {FlatDate}
 */
const date = (year, month, date) => {
  const d = new Date(year, month, date);
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    date: d.getDate(),
    day: d.getDay(),
    toString() {
      return `${this.year}-${this.month}-${this.date}`;
    }
  };
};

const collectDays = () => {
  const now = new Date();
  /** @type {Array<{ date: FlatDate, today?: boolean, disabled?: boolean, selected?: boolean }>} */
  const days = [];

  for (let i = 180; i--;)
    days.push({ date: date(now.getFullYear(), now.getMonth(), now.getDate() - i) });

  days[days.length - 1].today = true;

  for (let i = 1; i <= 180; i++)
    days.push({ date: date(now.getFullYear(), now.getMonth(), now.getDate() + i), disabled: true });

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
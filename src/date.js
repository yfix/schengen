const dateToString = function () {
  return `${this.year}-${this.month + 1}-${this.date}`;
};

/**
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
    toString: dateToString
  };
};

export default date;
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
    toString() {
      return `${this.year}-${this.month}-${this.date}`;
    }
  };
};

export default date;
const orderedDateProps = ['year', 'month', 'date'];

/**
 * @param {DatePointer} leftDate
 * @param {DatePointer} rightDate
 * @returns {ComparisonResult}
 */
const compareDates = (leftDate, rightDate) => {
  for (let prop of orderedDateProps) {
    if (leftDate[prop] < rightDate[prop]) return -1;
    if (leftDate[prop] > rightDate[prop]) return 1;
  }
  return 0;
};

export default compareDates;
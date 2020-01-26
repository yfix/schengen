import compareDates from './compareDates';

/**
 * @param {Array<DatePointer>} dates
 * @param {DatePointer} date 
 */
const findDate = (dates, date) => dates.find(d => compareDates(date, d) === 0);

export default findDate;
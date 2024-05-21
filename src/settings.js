import queryParams from './queryParams';

const strDateRanges = `
2023-06-02	2023-06-06
2023-09-01	2023-09-03
2023-09-17	2023-09-21
2023-11-23	2023-11-27
2023-12-23	2024-01-13
2024-01-20	2024-01-24
2024-02-03	2024-02-17
2024-04-05	2024-05-04
`;

const dateRanges = strDateRanges
  .trim()
  .split("\n")
  .map((line) => line.trim().split(/\s+/));
const initialDates = [];
console.log(initialDates);

const date180DaysAgo = new Date();
date180DaysAgo.setDate(new Date().getDate() - 180);

dateRanges.forEach((range) => {
  const startDate = new Date(range[0]);
  const endDate = new Date(range[1]);

  for (let d = startDate; d <= endDate; d.setDate(d.getDate()+1)) {
    if (d >= date180DaysAgo) {
      initialDates.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        date: d.getDate(),
        day: d.getDay(),
      });
    }
  }
});

export const SCHENGEN_RANGE = queryParams.range ? +queryParams.range : 180;
export const MAX_DAYS_IN_SCHENGEN = queryParams.max
  ? +queryParams.max
  : (queryParams.range ? Math.floor(queryParams.range / 2) : 90);
export const SCHENGEN_SCHEDULE_DAYS = SCHENGEN_RANGE * (queryParams.repeat ? +queryParams.repeat : 4);
export const SCHENGEN_INIT_DAYS = initialDates;

import queryParams from './queryParams';

export const SCHENGEN_RANGE = queryParams.range ? +queryParams.range : 180;
export const MAX_DAYS_IN_SCHENGEN = queryParams.max
  ? +queryParams.max
  : (queryParams.range ? Math.floor(queryParams.range / 2) : 90);
export const SCHENGEN_SCHEDULE_DAYS = SCHENGEN_RANGE * (queryParams.repeat ? +queryParams.repeat : 4);
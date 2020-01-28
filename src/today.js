import date from './date';

const today = () => {
  const now = new Date();
  return date(now.getFullYear(), now.getMonth(), now.getDate());
};

export default today;
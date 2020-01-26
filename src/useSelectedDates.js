import { useEffect } from 'react';
import useStorage from './useStorage';
import compareDates from './compareDates';

const useSelectedDates = () => {
  const [selectedDates, updateSelectedDays] = useStorage('selectedDates', []);
  useEffect(() => {
    const now = new Date();
    const startOfSchengenPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 180);
    const minimalDate = {
      year: startOfSchengenPeriod.getFullYear(),
      month: startOfSchengenPeriod.getMonth(),
      date: startOfSchengenPeriod.getDate()
    };
    const relevantSelectedDates = selectedDates.filter(date => compareDates(minimalDate, date) <= 0)
    if (selectedDates.length !== relevantSelectedDates.length)
      updateSelectedDays(relevantSelectedDates);
  }, []);
  return [selectedDates, updateSelectedDays];
};

export default useSelectedDates;
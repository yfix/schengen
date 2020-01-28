import { useEffect } from 'react';
import useStorage from './useStorage';
import cleanOutdatedDates from './cleanOutdatedDates';

const useSelectedDates = () => {
  const [selectedDates, updateSelectedDays] = useStorage('selectedDates', []);
  useEffect(() => {
    const relevantSelectedDates = cleanOutdatedDates(selectedDates, 180);
    if (selectedDates.length !== relevantSelectedDates.length)
      updateSelectedDays(relevantSelectedDates);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [selectedDates, updateSelectedDays];
};

export default useSelectedDates;
import { useEffect } from 'react';
import useStorage from './useStorage';
import cleanOutdatedDates from './cleanOutdatedDates';
import { SCHENGEN_RANGE } from './constants';

const useSelectedDates = () => {
  const [selectedDates, updateSelectedDays] = useStorage('selectedDates', []);
  useEffect(() => {
    const relevantSelectedDates = cleanOutdatedDates(selectedDates, SCHENGEN_RANGE);
    if (selectedDates.length !== relevantSelectedDates.length)
      updateSelectedDays(relevantSelectedDates);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [selectedDates, updateSelectedDays];
};

export default useSelectedDates;
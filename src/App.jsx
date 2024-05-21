import React from "react";
import "./App.css";
import Calendar from "./Calendar";
import Summary from "./Summary";
import compareDates from "./compareDates";
import useSelectedDates from "./useSelectedDates";
import useSchengenDays from "./useSchengenDays";

const App = () => {
  const [selectedDates, updateSelectedDays] = useSelectedDates();
  const days = useSchengenDays(selectedDates);

  /**
   * @param {Day} day
   */
  const toggleSelection = (day) => {
    const selectedDate = selectedDates.find(
      (date) => !compareDates(date, day.date)
    );
    if (selectedDate)
      updateSelectedDays(selectedDates.filter((date) => date !== selectedDate));
    else updateSelectedDays(selectedDates.concat(day.date));
  };

  return (
    <div className="App">
      <Summary days={days} />
      <Calendar days={days} toggleSelection={toggleSelection} />
    </div>
  );
};

export default App;

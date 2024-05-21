import React from "react";
import "./Calendar.css";

const monthsNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatMonth = (d) => `${monthsNames[d.month]} ${d.year}`;

/**
 * @param day
 */
function dayClassName(day) {
  const classes = ["Day"];
  if (day.date.month % 2) {
    classes.push("Day-Odd");
  } else {
    classes.push("Day-Even");
  }
  if (day.outOfRange || day.available < 1) {
    classes.push("Day-Disabled");
  }
  if (day.selected) {
    classes.push("Day-Selected");
  }
  if (day.today) {
    classes.push("Day-Today");
  }
  return classes.join(" ");
}

const repeat = (times, fn) => {
  const results = [];
  for (let i = 1; i <= times; i++) results.push(fn(i));
  return results;
};

/**
 * @param {object} props
 * @param {Array<Day>} props.days
 * @param {(day: Day) => void} props.toggleSelection
 */
const Calendar = ({ days, toggleSelection }) => {
  // Adjust the start day to Monday
  const firstDayIndex = (days[0].date.day + 6) % 7;

  return (
    <div className="Calendar">
      <div className="Calendar-List">
        {repeat(firstDayIndex, (i) => (
          <div key={i} className="Day Day-Empty"></div>
        ))}
        {days.map((day) => (
          <React.Fragment
            key={`${day.date.year}-${day.date.month}-${day.date.date}`}
          >
            {day.date.date === 1 ? (
              <div className="Month">{formatMonth(day.date)}</div>
            ) : undefined}
            <div
              key={day.date.toString() + Math.random()}
              className={dayClassName(day)}
              onClick={() =>
                day.outOfRange || day.available < 1 || toggleSelection(day)
              }
            >
              {day.date.date}
              {day.available > 1 ? (
                <small className="Day_Available">+{day.available - 1}</small>
              ) : undefined}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Calendar;

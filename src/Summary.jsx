import React from "react";
import "./Summary.css";
import countSelected from "./countSelected";

const Summary = ({ days }) => (
  <div className="Summary">
    <div className="Summary-Section">
      <span>{countSelected(days)}</span>
      <span className="Summary-Label">Days in Schengen</span>
    </div>
  </div>
);

export default Summary;

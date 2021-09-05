import React from "react";
import { CLASSES_TYPE } from "../utils/classes";

const SummonStats = ({ xp, level, classType }) => {
  return (
    <div>
      <p className="stat-desc">XP: {xp}</p>
      <p className="stat-desc">Level: {level}</p>
      <p className="stat-desc">Class: {CLASSES_TYPE[classType]}</p>
    </div>
  );
};

export { SummonStats };

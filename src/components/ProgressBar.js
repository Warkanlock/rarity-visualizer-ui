import React from "react";

const ProgressBar = ({ xp, xpRequired, levelUpPlayer }) => {
  const done = (xp / xpRequired) * 100;
  return (
    <div className="progress">
      <div className="progress-done" style={{ width: `${done}%` }}></div>
      {done >= 100 ? (
        <div
          className="total"
          style={{ cursor: "pointer" }}
          onClick={levelUpPlayer}
        >
          Level Up!
        </div>
      ) : (
        <div className="total">
          {xp}/{xpRequired}
        </div>
      )}
    </div>
  );
};

export { ProgressBar };

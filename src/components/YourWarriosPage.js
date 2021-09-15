import React from "react";
import WarriorCard from "./WarriorCard";

const YourWarriorsPage = ({ summoners }) => {
  console.log(summoners);
  return (
    <div
      className="container-box summoners-container"
      style={{ textAlign: "center" }}
    >
      {summoners?.map((summoner) => {
        return (
          <WarriorCard
            key={`summoner-card-${summoner.id}`}
            summoner={summoner}
          />
        );
      })}
    </div>
  );
};

export default YourWarriorsPage;

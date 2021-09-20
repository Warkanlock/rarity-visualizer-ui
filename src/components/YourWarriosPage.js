import React from "react";
import { withRouter } from "react-router";
import WarriorCard from "./WarriorCard";

const YourWarriorsPage = ({ summoners, setSummonId, history }) => {
  const goToWarrior = (summonerId) => {
    setSummonId(summonerId);
    history.push("/");
  };

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
            goToWarrior={goToWarrior}
          />
        );
      })}
    </div>
  );
};

export default withRouter(YourWarriorsPage);

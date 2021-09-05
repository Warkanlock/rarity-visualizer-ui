import React, { useContext, useState } from "react";
import { RarityContext } from "../context/RarityProvider";
import { SummonStats } from "./SummonStats";
import { NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";

const Home = (props) => {
  const [context] = useContext(RarityContext);
  const [summonData, setSummonData] = useState(null);
  const [summonId, setSummonId] = useState(112220);

  const getSummonerState = async () => {
    try {
      if (summonId != null) {
        const summonData = await context.contract.methods
          .summoner(summonId)
          .call();
        setSummonData({
          xp: parseFloat(summonData[0]) / 1e18,
          classType: summonData[2],
          level: summonData[3],
        });
        NotificationManager.success("Information retrieval successfully");
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${ex}`);
    }
  };

  const sendToAdventure = async () => {
    try {
      if (summonId != null) {
        await context.contract.methods
          .adventure(summonId)
          .send({ from: context.accounts[0] });
        NotificationManager.success(
          "Summoner went for an adventure!",
          "Information"
        );
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  };

  const levelUpPlayer = async () => {
    try {
      if (summonId != null) {
        await context.contract.methods
          .level_up(summonId)
          .send({ from: context.accounts[0] });
        NotificationManager.success(
          "You just level up your player!",
          "Information"
        );
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  };

  const changeSummonId = (event) => {
    setSummonId(event.target.value);
  };

  return (
    <div>
      <div className="welcome-warrior">Welcome - {context.accounts[0]}</div>
      <div className="button-warrior">
        <p>
          Your warrior{" "}
          <span className="button-warrior-minor-text">
            (use your summoner id)
          </span>
        </p>
        <input
          className="button-summon-data"
          defaultValue={112220}
          name="summonId"
          type="number"
          onChange={changeSummonId}
        />
      </div>
      <div className="summoner-container">
        <button className="button-summon-data" onClick={sendToAdventure}>
          Go to an adventure
        </button>
        <button className="button-summon-data" onClick={getSummonerState}>
          Information
        </button>
        <button className="button-summon-data" onClick={levelUpPlayer}>
          Level up
        </button>
      </div>
      {summonData != null && <SummonStats {...summonData}></SummonStats>}
    </div>
  );
};

export { Home };

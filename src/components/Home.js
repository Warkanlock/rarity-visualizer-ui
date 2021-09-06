import React, { useContext, useEffect, useState } from "react";
import { RarityContext } from "../context/RarityProvider";
import { SummonStats } from "./SummonStats";
import { NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { CLASSES_TYPE } from "../utils/classes";

const Home = (props) => {
  const [context] = useContext(RarityContext);
  const [summonData, setSummonData] = useState(null);
  const [summonId, setSummonId] = useState(112220);
  const [lastSummon, setLastSummon] = useState(null);
  const [classId, setClassId] = useState(1);
  const [adventureTime, setAdventureTime] = useState(null);
  const [switchAdventure, setSwitchAdventure] = useState(false);

  useEffect(() => {
    const isReadyForAdventure = async () => {
      if (summonId != null && context.contract) {
        const timestamp = await context.contract.methods
          .adventurers_log(summonId)
          .call();
        const milliseconds = timestamp * 1000; // 1575909015000
        const dateObject = new Date(milliseconds);
        setAdventureTime(dateObject);
      }
    };

    isReadyForAdventure();
  }, [context.contract, summonId, switchAdventure]);

  const getSummonerState = async () => {
    try {
      if (summonId != null) {
        const summonData = await context.contract.methods
          .summoner(summonId)
          .call();

        const attributesData = await context.contract_attributes.methods
          .ability_scores(summonId)
          .call();

        const levelPoints = await context.contract_attributes.methods
          .level_points_spent(summonId)
          .call();

        const xpRequired = await context.contract.methods
          .xp_required(summonId)
          .call();

        setSummonData({
          xp: parseFloat(summonData[0]) / 1e18,
          xpRequired: parseFloat(xpRequired) / 1e18,
          classType: summonData[2],
          level: summonData[3],
          levelPoints: levelPoints,
          attributes: {
            strength: attributesData.strength,
            dexterity: attributesData.dexterity,
            constitution: attributesData.constitution,
            intelligence: attributesData.intelligence,
            wisdom: attributesData.wisdom,
            charisma: attributesData.charisma,
          },
        });
        NotificationManager.success("Information retrieval successfully");
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  };

  const sendToAdventure = async () => {
    try {
      if (summonId != null) {
        await context.contract.methods
          .adventure(summonId)
          .send({ from: context.accounts[0] });
        setSwitchAdventure(!switchAdventure);
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

  const summonPlayer = async () => {
    try {
      setSummonData(null);
      if (classId != null) {
        const response = await context.contract.methods
          .summon(classId)
          .send({ from: context.accounts[0] });
        setLastSummon(response.events.summoned.returnValues[2]);
        NotificationManager.success(
          `You just summon your player! ${response.events.summoned.returnValues[2]}`,
          "Information",
          100000
        );
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  };

  const selectClassType = (event) => {
    setClassId(event.target.value);
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
          <p className="button-warrior-minor-text">- use your summoner id</p>
          <p className="button-warrior-minor-text">
            - if you don't have a summoner id, please summon one
          </p>
        </p>
        <input
          className="button-summon-data"
          defaultValue={""}
          name="summonId"
          type="number"
          onChange={changeSummonId}
        />
      </div>
      <div className="summoner-container">
        <div className="container-summon-data">
          <button className="button-summon-data" onClick={summonPlayer}>
            Summon a new warrior
          </button>
          <select className="button-summon-data" onChange={selectClassType}>
            {Object.keys(CLASSES_TYPE).map((key) => {
              return (
                <option value={key} key={`${key}-class-type`}>
                  {CLASSES_TYPE[key]}
                </option>
              );
            })}
          </select>
          <div className="button-summon-data">
            <div>Last id summoned: {lastSummon}</div>
          </div>
        </div>
        <div className="container-summon-data">
          {adventureTime && (
            <>
              <p className="button-summon-data">
                (Start new adventure: {adventureTime.toUTCString() || ""})
              </p>
              <button
                disabled={adventureTime.getTime() >= new Date().getTime()}
                className="button-summon-data"
                onClick={sendToAdventure}
              >
                Go to an adventure
              </button>
            </>
          )}
        </div>
        <button className="button-summon-data" onClick={getSummonerState}>
          Information
        </button>
        <button className="button-summon-data" onClick={levelUpPlayer}>
          Level up
        </button>
      </div>
      {summonData != null && (
        <SummonStats summonId={summonId} {...summonData}></SummonStats>
      )}
    </div>
  );
};

export { Home };

import React, { useContext, useEffect, useState } from "react";
import { RarityContext } from "../context/RarityProvider";
import { SummonStats } from "./SummonStats";
import { NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { CLASSES_TYPE } from "../utils/classes";

const Home = (props) => {
  const [context] = useContext(RarityContext);
  const [summonData, setSummonData] = useState(null);
  const [summonId, setSummonId] = useState(null);
  const [lastSummon, setLastSummon] = useState(null);
  const [classId, setClassId] = useState(1);
  const [adventureTime, setAdventureTime] = useState(null);
  const [switchAdventure, setSwitchAdventure] = useState(false);
  const [defaultSummoned, setDefaultSummoned] = useState();

  useEffect(() => {
    const isReadyForAdventure = async () => {
      if (summonId != null && context.contract) {
        console.log(summonId);
        const timestamp = await context.contract.methods
          .adventurers_log(summonId)
          .call();
        const milliseconds = timestamp * 1000; // 1575909015000
        const dateObject = new Date(milliseconds);
        setAdventureTime(dateObject);
      }
    };
    try {
      isReadyForAdventure();
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  }, [context.contract, summonId, switchAdventure]);

  const getSummonerState = async () => {
    try {
      console.log(summonId);
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
        setSummonId(response.events.summoned.returnValues[2]);
        setDefaultSummoned(response.events.summoned.returnValues[2]);
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
    if (event.target.value === "" || event.target.value === 0) {
      setSummonId(null);
    } else {
      setSummonId(event.target.value.toString());
    }
  };

  return (
    <>
      <div className="container-box welcome-warrior">
        Welcome - <span className="golden-font">{context.accounts[0]}</span>
      </div>
      <div className="d-flex">
        <div className="container-box summoner-class">
          <div className="summoner-class-title">
            <label>Your warrior:</label>
          </div>
          <div className="summoner-img-container">
            <img
              src={process.env.PUBLIC_URL + "/img/sword-draw.png"}
              alt="sword-draw"
            />
          </div>
          <div className="summon-id">
            <input
              placeholder="Summoner ID"
              className="summon-id-input"
              defaultValue={defaultSummoned}
              name="summonId"
              onChange={changeSummonId}
            />
            <div className="new-summoner-button" onClick={getSummonerState}>
              <img
                src={process.env.PUBLIC_URL + "/img/dagger_new.png"}
                alt="new-summoner"
              />
            </div>
          </div>
        </div>
        <div className="summoner-info">
          <div className="container-box">
            <ul>
              <li>Use your Summoner ID</li>
              <li>
                If you don't have a Summoner ID, please summon a new warrior
              </li>
              <li>
                If gas fees are excessively high then that action is unavailable
                at the moment
              </li>
            </ul>
          </div>
          <div className="container-box">
            <div className="summoner-buttons">
              <button className="summon-new" onClick={summonPlayer}>
                Summon new warrior
              </button>
              <select onChange={selectClassType}>
                {Object.keys(CLASSES_TYPE).map((key) => {
                  return (
                    <option value={key} key={`${key}-class-type`}>
                      {CLASSES_TYPE[key]}
                    </option>
                  );
                })}
              </select>
            </div>
            Last ID summoned:{" "}
            <span className="golden-font">
              {lastSummon ? lastSummon : " - "}
            </span>
          </div>
        </div>
      </div>
      <div className="container-box actions">
        <button
          disabled={
            adventureTime?.getTime() >= new Date().getTime() ||
            summonId === null
          }
          onClick={sendToAdventure}
          style={{
            backgroundColor: "rgb(186, 39, 21)",
            border: "2px solid rgb(61, 29, 20)",
          }}
        >
          Go on adventure
        </button>
        <button
          disabled={summonId === null}
          onClick={getSummonerState}
          style={{
            backgroundColor: "rgb(0, 147, 107)",
            border: "2px solid rgb(9, 62, 47)",
          }}
        >
          Information
        </button>
        <button
          disabled={summonId === null}
          onClick={levelUpPlayer}
          style={{
            backgroundColor: "rgb(27, 98, 136)",
            border: "2px solid rgb(24, 54, 74)",
          }}
        >
          Level up
        </button>
      </div>
      {summonData != null && (
        <SummonStats summonId={summonId} {...summonData}></SummonStats>
      )}
    </>
  );
};

export { Home };

import React, { useContext, useEffect, useState } from "react";
import { RarityContext } from "../context/RarityProvider";
import { SummonStats } from "./SummonStats";
import { NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { CLASSES_TYPE } from "../utils/classes";
import { RARITY_SUMMONERS } from "../utils/config";
import { useAuth } from "../hooks/useAuth";
import DungeonModal from "./DungeonModal";
import fetchRetry, { RetryContractCall } from "../utils/fetchRetry";
import SummonNewWarriorModal from "./SummonNewWarriorModal";

const Home = (props) => {
  const [context] = useContext(RarityContext);
  const [, , , update] = useAuth();
  const [summonData, setSummonData] = useState(null);
  const [summonId, setSummonId] = useState(null);
  const [summoners, setSummoners] = useState([]);
  const [lastSummon, setLastSummon] = useState(null);
  const [classId, setClassId] = useState(1);
  const [adventureTime, setAdventureTime] = useState(null);
  const [switchAdventure, setSwitchAdventure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summonName, setSummonName] = useState(null);
  const [summoning, setSummoning] = useState(false);
  const [loadingAdventure, setLoadingAdventure] = useState(false);
  const [showDungeonModal, setShowDungeonModal] = useState(false);
  const [showSummonNewWarriorModal, setShowSummonNewWarriorModal] =
    useState(false);

  const walletAddress = context.walletAddress;

  useEffect(() => {
    const getAllSummoners = async () => {
      try {
        if (walletAddress) {
          const response = await fetchRetry(
            RARITY_SUMMONERS(walletAddress),
            500,
            3
          );
          const summonsId = response?.map((event) => {
            const id = event.tokenID;
            return { id: Number(id) };
          });
          if (summonsId) setSummoners(summonsId);
        }
      } catch {
        NotificationManager.error("Something bad happened");
      }
    };

    try {
      getAllSummoners();
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  }, [walletAddress]);

  useEffect(() => {
    const isReadyForAdventure = async () => {
      if (summonId != null && context.contract) {
        setLoadingAdventure(true);
        const timestamp = await RetryContractCall(
          context.contract.methods.adventurers_log(summonId)
        );
        const milliseconds = timestamp * 1000; // 1575909015000
        const dateObject = new Date(milliseconds);
        setAdventureTime(dateObject);
        setLoadingAdventure(false);
      }
    };

    const haveNameSetted = async () => {
      if (summonId != null && context.contract_names) {
        setLoadingAdventure(true);
        const summonName = await RetryContractCall(
          context.contract_names.methods.summoner_name(summonId)
        );
        setSummonName(summonName);
        setLoadingAdventure(false);
      }
    };

    try {
      isReadyForAdventure();
      haveNameSetted();
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  }, [
    context,
    context.contract,
    summonId,
    switchAdventure,
    summonData,
    update,
  ]);

  useEffect(() => {
    if (summonId) getSummonerState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summonId]);

  const getSummonerState = async () => {
    if (summonId == null) {
      return;
    }
    try {
      setLoading(true);
      if (summonId != null) {
        const summonData = await RetryContractCall(
          context.contract.methods.summoner(summonId)
        );

        const attributesDataPromise = RetryContractCall(
          context.contract_attributes.methods.ability_scores(summonId)
        );

        const levelPointsPromise = RetryContractCall(
          context.contract_attributes.methods.level_points_spent(summonId)
        );

        const xpRequiredPromise = RetryContractCall(
          context.contract.methods.xp_required(summonData[3])
        );

        const fullNamePromise = RetryContractCall(
          context.contract_names.methods.full_name(summonId)
        );

        const summonNamePromise = RetryContractCall(
          context.contract_names.methods.summoner_name(summonId)
        );

        const titlePromise = RetryContractCall(
          context.contract_names.methods.title(summonData[3])
        );

        const playerGoldPromise = RetryContractCall(
          context.contract_gold.methods.claimed(summonId)
        );

        const pendingGoldPromise = RetryContractCall(
          context.contract_gold.methods.claimable(summonId)
        );

        const [
          attributesData,
          levelPoints,
          xpRequired,
          fullName,
          summonName,
          title,
          playerGold,
          pendingGold,
        ] = await Promise.all([
          attributesDataPromise,
          levelPointsPromise,
          xpRequiredPromise,
          fullNamePromise,
          summonNamePromise,
          titlePromise,
          playerGoldPromise,
          pendingGoldPromise,
        ]);

        setSummonData({
          name: {
            fullName,
            summonName,
            title,
          },
          gold: {
            playerGold,
            pendingGold: parseFloat(pendingGold) / Math.pow(10, 18),
          },
          xp: parseFloat(summonData[0]) / Math.pow(10, 18),
          xpRequired: parseFloat(xpRequired) / Math.pow(10, 18),
          xpToGo: (xpRequired - parseFloat(summonData[0])) / Math.pow(10, 18),
          classType: summonData[2],
          level: summonData[3],
          levelPoints: levelPoints,
          attributes: {
            strength:
              Number(attributesData.strength) === 0
                ? 8
                : Number(attributesData.strength),
            dexterity:
              Number(attributesData.dexterity) === 0
                ? 8
                : Number(attributesData.dexterity),
            constitution:
              Number(attributesData.constitution) === 0
                ? 8
                : Number(attributesData.constitution),
            intelligence:
              Number(attributesData.intelligence) === 0
                ? 8
                : Number(attributesData.intelligence),
            wisdom:
              Number(attributesData.wisdom) === 0
                ? 8
                : Number(attributesData.wisdom),
            charisma:
              Number(attributesData.charisma) === 0
                ? 8
                : Number(attributesData.charisma),
          },
        });

        setLoading(false);
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    } finally {
      setLoading(false);
    }
  };

  const sendToAdventure = async () => {
    try {
      setLoading(true);
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
      setSummonData(null);
      setSummonId(summonId);
      await getSummonerState();
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    } finally {
      setLoading(false);
    }
  };

  const levelUpPlayer = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const summonPlayer = async () => {
    try {
      setSummoning(true);
      setSummonData(null);
      setLoading(true);
      if (classId != null) {
        const response = await context.contract.methods
          .summon(classId)
          .send({ from: context.accounts[0] });
        setLastSummon(response.events.summoned.returnValues[2]);
        setSummoners((prevState) => [
          ...prevState,
          { id: response.events.summoned.returnValues[2] },
        ]);
        setSummonId(response.events.summoned.returnValues[2]);
        NotificationManager.success(
          `You just summon your player! ${response.events.summoned.returnValues[2]}`,
          "Information",
          100000
        );
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    } finally {
      setLoading(false);
    }
  };

  const assignName = async () => {
    try {
      if (summonId != null && summonName != null) {
        setLoading(true);
        await context.contract_names.methods
          .set_name(summonId, summonName)
          .send({ from: context.accounts[0] });
        NotificationManager.success(
          `You just named your player!`,
          "Information",
          5000
        );
        setLoading(false);
        setSummonData(null);
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    } finally {
      setSummoning(false);
    }
  };

  const selectClassType = (event) => {
    setClassId(event.target.value);
  };

  useEffect(() => {
    if (summoners[0] && !summonId) {
      setSummonId(summoners[0].id);
    }
  }, [summonId, summoners]);

  const changeSummonId = (event) => {
    if (event.target.value === "" || event.target.value === 0) {
      setSummonId(null);
    } else {
      setSummonId(event.target.value);
      getSummonerState();
      setSummonData(null);
    }
  };

  return (
    <React.Fragment>
      {loading && <div className="loading">Loading&#8230;</div>}
      {showDungeonModal && (
        <DungeonModal
          summonId={summonId}
          setShowDungeonModal={setShowDungeonModal}
        />
      )}
      {showSummonNewWarriorModal && (
        <SummonNewWarriorModal
          summonId={summonId}
          setShowSummonNewWarriorModal={setShowSummonNewWarriorModal}
        />
      )}
      <div className="d-flex">
        <div className="container-box summoner-class">
          <div className="summoner-class-title">
            <label>Your warrior</label>
            {summonName &&
              (loadingAdventure ? (
                <div>...</div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  &#9679;{summonName}&#9679;
                </div>
              ))}
          </div>
          <div className="summoner-img-container">
            <img
              src={`${process.env.PUBLIC_URL}/classes/${
                summonData
                  ? CLASSES_TYPE[summonData.classType]
                  : CLASSES_TYPE[1]
              }.png`}
              alt="summon-img"
            />
          </div>
          <div className="summon-id">
            <select
              placeholder="Summoner ID"
              className="summon-id-input"
              name="summonId"
              value={summonId || 0}
              onChange={changeSummonId}
            >
              {summoners.map((summon) => {
                return (
                  <option value={summon.id} key={`summoner-${summon.id}`}>
                    {summon.id}
                  </option>
                );
              })}
            </select>
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
              <button
                className="summon-new"
                disabled={summonId === null && summoning}
                onClick={() => setShowSummonNewWarriorModal(true)}
              >
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
          {loadingAdventure ? (
            <div>
              <div className="spinner"></div>
            </div>
          ) : adventureTime?.getTime() >= new Date().getTime() ? (
            <p>
              Next adventure in{" "}
              {Math.floor(
                Math.abs(adventureTime?.getTime() - new Date().getTime()) /
                  1000 /
                  3600
              ) % 24}{" "}
              hours
            </p>
          ) : (
            "Go on adventure"
          )}
        </button>
        <button
          disabled={summonId === null || summonData}
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
          onClick={() => setShowDungeonModal(true)}
          style={{
            backgroundColor: "rgb(0, 122, 107)",
            border: "2px solid rgb(9, 62, 47)",
          }}
        >
          Dungeons
        </button>
      </div>
      {summonData != null && (
        <SummonStats
          summonId={summonId}
          summonName={summonName}
          setSummonName={setSummonName}
          assignName={assignName}
          levelUpPlayer={levelUpPlayer}
          refreshView={async () => {
            setSummonData(null);
            setSummonId(summonId);
            await getSummonerState();
          }}
          {...summonData}
        ></SummonStats>
      )}
    </React.Fragment>
  );
};

export { Home };

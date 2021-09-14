/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { SummonStats } from "./SummonStats";
import { CLASSES_TYPE } from "../utils/classes";
import DungeonModal from "./DungeonModal";
import { toast } from "react-toastify";
import { RarityContext } from "../context/RarityProvider";
import { useAuth } from "../hooks/useAuth";
import fetchRetry, { RetryContractCall } from "../utils/fetchRetry";
import { RARITY_SUMMONERS } from "../utils/config";
import { reduceNumber } from "../utils";
import Tabs from "./Tabs";

const WarriorPage = ({
  summonId,
  setSummonId,
  summoners,
  setSummoners,
  loading,
  setLoading,
}) => {
  const [context] = useContext(RarityContext);
  const [, , , update] = useAuth();
  const [summonData, setSummonData] = useState(null);
  const [adventureTime, setAdventureTime] = useState(null);
  const [summonName, setSummonName] = useState(null);
  const [loadingAdventure, setLoadingAdventure] = useState(false);
  const [showDungeonModal, setShowDungeonModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
        toast.error("Something bad happened");
      }
    };

    try {
      getAllSummoners();
    } catch (ex) {
      toast.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (summonId) {
      localStorage.setItem("summonId", summonId);
      getSummonerState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summonId, update]);

  useEffect(() => {
    if (summoners[0] && !summonId) {
      if (localStorage.getItem("summonId")) {
        setSummonId(localStorage.getItem("summonId"));
      } else {
        setSummonId(summoners[0].id);
      }
    }
  }, [summonId, summoners]);

  const isReadyForAdventure = async () => {
    if (summonId != null && context.contract_base) {
      setLoadingAdventure(true);

      const timestamp = await RetryContractCall(
        context.contract_base.methods.adventurers_log(summonId)
      );
      const milliseconds = timestamp * 1000; // 1575909015000
      const dateObject = new Date(milliseconds);
      setAdventureTime(dateObject);
      setLoadingAdventure(false);
    }
  };

  const haveNameSetted = async () => {
    if (summonId != null && context.contract_names) {
      const summonName = await RetryContractCall(
        context.contract_names.methods.summoner_name(summonId)
      );
      setSummonName(summonName);
    }
  };

  const getSummonerState = async () => {
    if (summonId == null) {
      return;
    }
    try {
      setLoading(true);
      if (summonId != null) {
        const summonData = await RetryContractCall(
          context.contract_base.methods.summoner(summonId)
        );

        const attributesDataPromise = RetryContractCall(
          context.contract_attributes.methods.ability_scores(summonId)
        );

        const levelPointsPromise = RetryContractCall(
          context.contract_attributes.methods.level_points_spent(summonId)
        );

        const xpRequiredPromise = RetryContractCall(
          context.contract_base.methods.xp_required(summonData[3])
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
          context.contract_gold.methods.balanceOf(summonId)
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
            playerGold: parseFloat(playerGold) / reduceNumber(18),
            pendingGold: parseFloat(pendingGold) / reduceNumber(18),
          },
          xp: parseFloat(summonData[0]) / reduceNumber(18),
          xpRequired: parseFloat(xpRequired) / reduceNumber(18),
          xpToGo: (xpRequired - parseFloat(summonData[0])) / reduceNumber(18),
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
      }
    } catch (ex) {
      toast.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }

    try {
      const readyForAdventurePromise = isReadyForAdventure();
      const nameSettedPromise = haveNameSetted();
      await Promise.all([readyForAdventurePromise, nameSettedPromise]);
    } catch (ex) {
      toast.error(`Something went wrong!`);
    }

    setLoading(false);
  };

  const sendToAdventure = async () => {
    if (summonId == null) return;
    const id = toast.loading("I'm going on an adventure!");
    try {
      await context.contract_base.methods
        .adventure(summonId)
        .send({ from: context.accounts[0] });
      toast.update(id, {
        render: `Summoner went for an adventure!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      await getSummonerState();
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! ${JSON.stringify(ex)}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const levelUpPlayer = async () => {
    if (!summonId) return;
    const id = toast.loading("Levelling up...");
    try {
      await context.contract_base.methods
        .level_up(summonId)
        .send({ from: context.accounts[0] });
      toast.update(id, {
        render: `You just level up your player!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      await getSummonerState();
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! ${JSON.stringify(ex)}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const assignName = async (summonName) => {
    const id = toast.loading("Assigning name...");
    if (!summonId) return;
    if (!summonName) {
      toast.update(id, {
        render: `Can't assign an empty name!`,
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
      return;
    }
    try {
      await context.contract_names.methods
        .set_name(summonId, summonName)
        .send({ from: context.accounts[0] });
      setSummonName(summonName);
      toast.update(id, {
        render: `Name assigned!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! ${JSON.stringify(ex)}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const changeSummonId = (event) => {
    if (event.target.value === "" || event.target.value === 0) {
      setSummonId(null);
    } else {
      setSummonData(null);
      setSummonId(event.target.value);
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
      <div className="d-flex">
        <div className="container-box summoner-class">
          <div className="summoner-class-title">
            <label>Your warrior</label>
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
        </div>
      </div>
      <Tabs>
        <div label="Stats">
          {summonData != null && (
            <SummonStats
              summonId={summonId}
              summonName={summonName}
              setSummonName={setSummonName}
              assignName={assignName}
              levelUpPlayer={levelUpPlayer}
              refreshView={async () => {
                await getSummonerState();
              }}
              {...summonData}
            ></SummonStats>
          )}
        </div>
        <div label="Skills">
          <div style={{ textAlign: "center" }}>
            <h1>Coming soon!</h1>
          </div>
        </div>
        <div label="Inventory">
          <div style={{ textAlign: "center" }}>
            <h1>Coming soon!</h1>
          </div>
        </div>
      </Tabs>
    </React.Fragment>
  );
};

export default WarriorPage;
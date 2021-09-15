/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RarityContext } from "../context/RarityProvider";
import { reduceNumber } from "../utils";
import { CLASSES_TYPE } from "../utils/classes";
import { RetryContractCall } from "../utils/fetchRetry";
import { getAdventureTime } from "../utils/utils";
import { ProgressBar } from "./ProgressBar";

const WarriorCard = ({ summoner, goToWarrior }) => {
  const [context] = useContext(RarityContext);
  const [summonData, setSummonData] = useState({});
  const [adventureTime, setAdventureTime] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSummonerState();
  }, []);

  const getSummonerState = async () => {
    const summonId = summoner.id;
    if (summonId == null) {
      return;
    }
    try {
      if (summonId != null) {
        const summonData = await RetryContractCall(
          context.contract_base.methods.summoner(summonId)
        );

        const xpRequiredPromise = RetryContractCall(
          context.contract_base.methods.xp_required(summonData[3])
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

        const [xpRequired, summonName, title, playerGold] = await Promise.all([
          xpRequiredPromise,
          summonNamePromise,
          titlePromise,
          playerGoldPromise,
        ]);

        setSummonData({
          name: {
            summonName,
            title,
          },
          gold: {
            playerGold: parseFloat(playerGold) / reduceNumber(18),
          },
          xp: parseFloat(summonData[0]) / reduceNumber(18),
          xpRequired: parseFloat(xpRequired) / reduceNumber(18),
          xpToGo: (xpRequired - parseFloat(summonData[0])) / reduceNumber(18),
          classType: summonData[2],
          level: summonData[3],
        });
      }
    } catch (ex) {
      // do something with error
    }

    try {
      await isReadyForAdventure();
    } catch (ex) {
      toast.error(`Something went wrong!`);
    }

    setLoading(false);
  };

  const isReadyForAdventure = async () => {
    const summonId = summoner.id;
    if (summonId != null && context.contract_base) {
      const timestamp = await RetryContractCall(
        context.contract_base.methods.adventurers_log(summonId)
      );
      const milliseconds = timestamp * 1000; // 1575909015000
      const dateObject = new Date(milliseconds);
      setAdventureTime(dateObject);
    }
  };

  const levelUpPlayer = async () => {
    const summonId = summoner.id;
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
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const sendToAdventure = async () => {
    const summonId = summoner.id;
    if (summonId == null) return;
    const id = toast.loading(`Sending ${summonId} for an adventure!`);
    try {
      await context.contract_base.methods
        .adventure(summonId)
        .send({ from: context.accounts[0] });
      toast.update(id, {
        render: `Summoner ${summonId} went for an adventure!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      await getSummonerState();
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="summoner-card">
      <div className="summoner-card-body">
        {loading ? (
          <>
            <div className="summoner-card-class-image">
              <div className="unknown-summoner"></div>
            </div>
            <div className="summoner-card-info">
              <div className="summoner-card-row">{summoner.id}</div>
              <div className="summoner-card-row">
                <ProgressBar
                  xp={0}
                  xpRequired={0}
                  levelUpPlayer={levelUpPlayer}
                />
              </div>
              <div className="summoner-card-row">
                <div className="summoner-card-level-adventure">
                  <p>Level: ???</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className="summoner-card-class-image"
              onClick={() => goToWarrior(summoner.id)}
            >
              <img
                src={`${process.env.PUBLIC_URL}/classes/${
                  CLASSES_TYPE[summonData.classType]
                }.png`}
                alt="summon-img"
              />
            </div>
            <div className="summoner-card-info">
              <div className="summoner-card-row">
                {summonData?.name?.summonName ? (
                  <p>
                    {summoner.id} - <i>{summonData?.name?.summonName}</i>
                  </p>
                ) : (
                  summoner.id
                )}
              </div>
              <div className="summoner-card-row">
                <ProgressBar
                  xp={summonData.xp}
                  xpRequired={summonData.xpRequired}
                  levelUpPlayer={levelUpPlayer}
                />
              </div>
              <div className="summoner-card-row">
                <div className="summoner-card-level-adventure">
                  <p>Level: {summonData.level}</p>
                  <p>
                    {adventureTime?.getTime() >= new Date().getTime() ? (
                      getAdventureTime(adventureTime?.getTime())
                    ) : (
                      <p
                        className="summoner-card-adventure"
                        onClick={sendToAdventure}
                      >
                        Adventure
                      </p>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WarriorCard;

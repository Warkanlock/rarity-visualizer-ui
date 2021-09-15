import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RarityContext } from "../context/RarityProvider";
import { reduceNumber } from "../utils";
import { RetryContractCall } from "../utils/fetchRetry";

const WarriorCard = ({ summoner }) => {
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

  return (
    <div className="summoner-card">
      <div className="summoner-card-body">{summoner.id}</div>
    </div>
  );
};

export default WarriorCard;

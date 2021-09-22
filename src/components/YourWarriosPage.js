/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { withRouter } from "react-router";
import { toast } from "react-toastify";
import { RarityContext } from "../context/RarityProvider";
import { RARITY_ADDRESS_DAYCARE } from "../utils/config";
import { RetryContractCall } from "../utils/fetchRetry";
import WarriorCard from "./WarriorCard";

const YourWarriorsPage = ({ summoners, setSummonId, history }) => {
  const [context] = useContext(RarityContext);
  const [fetchingIsApprovedForAll, setFetchingIsApprovedForAll] =
    useState(true);
  const [isApprovedForAll, setIsApprovedForAll] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchIsApprovedForAll();
  }, [context, context.contract_base]);

  const fetchIsApprovedForAll = async () => {
    if (!context || !context.contract_base) return;
    try {
      const response = await RetryContractCall(
        context.contract_base.methods.isApprovedForAll(
          context.accounts[0],
          RARITY_ADDRESS_DAYCARE
        )
      );
      setIsApprovedForAll(response);
    } catch {
      setIsApprovedForAll(false);
    } finally {
      setFetchingIsApprovedForAll(false);
    }
  };

  const goToWarrior = (summonerId) => {
    setSummonId(summonerId);
    history.push("/");
  };

  const sendAllForAdventure = async () => {
    const id = toast.loading("Sending all summoners for an adventure...");
    try {
      const summonersIds = await getSummonerIdsList();
      if (!summonersIds.length) {
        toast.update(id, {
          render: `All warriors need to rest`,
          type: "info",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }
      await context.contract_daycare.methods
        .adventureTime(summonersIds)
        .send({ from: context.accounts[0] });
      toast.update(id, {
        render: `Summoners went for an adventure!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setRefresh((prevState) => !prevState);
    } catch (err) {
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const getSummonerIdsList = async () => {
    const summonersIds = [];
    await Promise.all(
      summoners?.map(async (summoner) => {
        const timestamp = await RetryContractCall(
          context.contract_base.methods.adventurers_log(summoner.id)
        );
        const milliseconds = timestamp * 1000; // 1575909015000
        const dateObject = new Date(milliseconds);
        if (dateObject?.getTime() < new Date().getTime()) {
          summonersIds.push(summoner.id);
        }
      })
    );
    return summonersIds;
  };

  const approveIsApprovedForAll = async () => {
    const id = toast.loading("Approving send all for an adventure...");
    try {
      await context.contract_base.methods
        .setApprovalForAll(RARITY_ADDRESS_DAYCARE, true)
        .send({ from: context.accounts[0] });
      setIsApprovedForAll(true);
      toast.update(id, {
        render: `Send all for an adventure approved`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      <div className="container-box" style={{ textAlign: "center" }}>
        <div className="send-all-buttons">
          {fetchingIsApprovedForAll ? (
            <button>
              <div className="spinner"></div>
            </button>
          ) : isApprovedForAll ? (
            <button onClick={sendAllForAdventure}>
              Send all for adventure
            </button>
          ) : (
            <button onClick={approveIsApprovedForAll}>
              Approve send all for adventure
            </button>
          )}
          <hr
            style={{
              width: "95%",
              marginTop: "10px",
              border: "1px solid rgba(255,255,255, .1)",
            }}
          />
        </div>
        <div className="summoners-container">
          {summoners?.map((summoner) => {
            return (
              <WarriorCard
                key={`summoner-card-${summoner.id}-${refresh}`}
                summoner={summoner}
                goToWarrior={goToWarrior}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default withRouter(YourWarriorsPage);

import React, { useContext, useEffect, useState } from "react";
import { RarityContext } from "../context/RarityProvider";
import "../Modal.css";
import { toast } from "react-toastify";
import { RetryContractCall } from "../utils/fetchRetry";

const ForestModal = ({ setShowForestModal, currentLevel, summonId }) => {
  const [context] = useContext(RarityContext);
  const [loading, setLoading] = useState(false);
  const [forestInfo, setForestInfo] = useState(null);
  const [tokenId, setTokenId] = useState(null);

  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadForest = async () => {
      setLoading(true);

      const xpRequired = await RetryContractCall(
        context.contract_forest.methods.xpRequired(currentLevel)
      );

      setForestInfo({
        xpRequiredToExplore: xpRequired / Math.pow(10, 21),
      });
      setLoading(false);
    };

    try {
      loadForest();
    } catch (ex) {
      toast.error(`Something went wrong! Try Again in a few seconds!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShowForestModal]);

  const takeTreasure = async () => {
    if (!tokenId) return;
    const id = toast.loading("I think there's something inside the brush...");
    try {
      const treasureId = await context.contract_forest.methods
        .treasure(tokenId)
        .call();
      setTokenId(treasureId);

      toast.success(`Treasure grab!`);
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const exploreForest = async () => {
    if (!summonId) return;
    const id = toast.loading("Entering into the deep woods of the north...");
    try {
      const treasure = await context.contract_forest.methods
        .discover(summonId)
        .send({ from: context.accounts[0] });

      console.log(treasure);

      toast.success(`Going back home!`);
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const closeOnEscapeKeyDown = (e) => {
    if ((e.charCode || e.keyCode) === 27) {
      setShowForestModal(false);
    }
  };

  const isLevelAllowed = currentLevel > forestInfo?.xpRequiredToExplore;

  return (
    <>
      <div className="modal" onClick={() => setShowForestModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">{"The Forest"}</div>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            forestInfo && (
              <>
                <div className="forest-content">
                  <img
                    src={process.env.PUBLIC_URL + "/img/forest_dungeon.png"}
                    alt="forest-dungeon"
                    className="dungeon-image"
                  />
                  {isLevelAllowed ? (
                    <div className="forest-title">{"Explore the forest"}</div>
                  ) : (
                    <div className="forest-title">
                      {"Go back...your level it's too low"}
                    </div>
                  )}
                  {tokenId && <p>Your rewards: {tokenId}</p>}
                  <div className="forest-content-buttons">
                    <button
                      className="dungeon-button-adventure"
                      onClick={exploreForest}
                      disabled={!isLevelAllowed}
                    >
                      Explore the forest
                    </button>
                    <button
                      className="dungeon-button-adventure"
                      onClick={takeTreasure}
                      disabled={!isLevelAllowed}
                    >
                      Scout
                    </button>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default ForestModal;

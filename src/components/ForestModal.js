import React, { useContext, useEffect, useState } from "react";
import NotificationManager from "react-notifications/lib/NotificationManager";
import { RarityContext } from "../context/RarityProvider";
import "../Modal.css";
import { RetryContractCall } from "../utils/fetchRetry";

const ForestModal = ({ setShowForestModal, currentLevel, summonId }) => {
  const [context] = useContext(RarityContext);
  const [loading, setLoading] = useState(false);
  const [forestInfo, setForestInfo] = useState(null);

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
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShowForestModal]);

  const closeOnEscapeKeyDown = (e) => {
    if ((e.charCode || e.keyCode) === 27) {
      setShowForestModal(false);
    }
  };

  return (
    <>
      <div className="modal" onClick={() => setShowForestModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">{"The Forest"}</div>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            forestInfo && JSON.stringify(forestInfo.xpRequiredToExplore)
          )}
        </div>
      </div>
    </>
  );
};

export default ForestModal;

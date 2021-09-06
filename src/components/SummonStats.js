import React, { useContext } from "react";
import { NotificationManager } from "react-notifications";
import { RarityContext } from "../context/RarityProvider";
import { CLASSES_TYPE } from "../utils/classes";

const SummonStats = ({
  summonId,
  xp,
  level,
  classType,
  attributes,
  levelPoints,
}) => {
  const [context] = useContext(RarityContext);

  const increase = async (attr) => {
    try {
      if (summonId != null) {
        await context.contract_attributes.methods[`increase_${attr}`](
          summonId
        ).send({ from: context.accounts[0] });
        NotificationManager.success(
          "Summoner went for an adventure!",
          "Information"
        );
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  };

  return (
    <div className="d-flex">
      <div className="summoner-stats">
        <h3>Stats:</h3>
        <hr />
        <p className="stat-desc">XP: {xp}</p>
        <p className="stat-desc">Level: {level}</p>
        <p className="stat-desc">Class: {CLASSES_TYPE[classType]}</p>
        <p className="stat-desc">Points to spent: {levelPoints}</p>
      </div>
      <div className="stat-desc-attribs-container">
        {Object.keys(attributes).map((attr) => {
          return (
            <div className="stat-increase-container">
              <button
                className="stat-desc-attrbs-button"
                onClick={() => increase(attr)}
                type="button"
              >
                +
              </button>
              <p className="stat-desc-attrbs">
                {attr[0].toUpperCase() + attr.slice(1)} {attributes[attr]}
              </p>
              <button
                className="stat-desc-attrbs-button"
                onClick={() => console.log("No mechanism yet in the contract")}
                type="button"
                disabled
              >
                -
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { SummonStats };

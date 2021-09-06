import React, { useContext } from "react";
import { NotificationManager } from "react-notifications";
import { RarityContext } from "../context/RarityProvider";
import { CLASSES_TYPE } from "../utils/classes";

const SummonStats = ({
  summonId,
  xp,
  xpRequired,
  level,
  classType,
  attributes,
  levelPoints,
}) => {
  const [context] = useContext(RarityContext);
  const [amountXp, setAmountXp] = React.useState(0);

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

  const spendXp = async () => {
    try {
      if (summonId != null) {
        await context.contract.methods
          .spend_xp(summonId, amountXp)
          .send({ from: context.accounts[0] });
        NotificationManager.success(
          `Summoner spent ${amountXp} xp`,
          "Information"
        );
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  };

  const updateAmount = (event) => {
    setAmountXp(event.target.value);
  };

  return (
    <>
      <div>
        <div className="stat-desc">
          <div className="stat-desc-single">XP: {xp} </div>
          <div className="stat-desc-single">
            <button className="stat-desc-button" onClick={spendXp}>
              Spend XP
            </button>
            <input
              className="stat-desc"
              type="number"
              onChange={updateAmount}
              max="1000"
            />
          </div>
        </div>
        <p className="stat-desc">XP Required: {xpRequired}</p>
        <p className="stat-desc">Level: {level}</p>
        <p className="stat-desc">Class: {CLASSES_TYPE[classType]}</p>
        <p className="stat-desc">Points to spent: {levelPoints}</p>
      </div>
      <div className="stat-desc-attribs-container">
        {Object.keys(attributes).map((attr) => {
          return (
            <div
              className="stat-increase-container"
              key={`class-${attributes}`}
            >
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
    </>
  );
};

export { SummonStats };

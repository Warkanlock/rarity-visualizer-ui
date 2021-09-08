import React, { useContext } from "react";
import { NotificationManager } from "react-notifications";
import { RarityContext } from "../context/RarityProvider";
import { CLASSES_TYPE } from "../utils/classes";

const SummonStats = ({
  summonId,
  name,
  xp,
  xpRequired,
  xpToGo,
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
      <div className="summoner-stats">
        <div className="container-box summoner-information">
          <ul>
            <li>
              <div className="xp-spend">
                <p>XP: {xp} </p>
                <input
                  onChange={updateAmount}
                  max="1000"
                  placeholder="XP to spend"
                />
                <button disabled onClick={spendXp}>
                  Spend XP
                </button>
              </div>
            </li>
            <li>
              <p>XP Left: {xpToGo}</p>
            </li>
            <li>
              <p>XP Required: {xpRequired}</p>
            </li>
            <li>
              <p>
                Level: {level} {name.title}{" "}
              </p>
            </li>
            <li>
              <p>Class: {CLASSES_TYPE[classType]}</p>
            </li>
            <li>
              <p>Points to spent: {levelPoints}</p>
            </li>
          </ul>
        </div>
        <div className="container-box summoner-attributes">
          {Object.keys(attributes).map((attr) => {
            return (
              <div
                className="summoner-attribute-container"
                key={`class-${attr}`}
              >
                <button
                  onClick={() =>
                    console.log("No mechanism yet in the contract")
                  }
                  type="button"
                  disabled
                >
                  -
                </button>
                <div className="summoner-attribute">
                  {attr[0].toUpperCase() + attr.slice(1)}:{" "}
                  <span className="golden-font">
                    {Number(attributes[attr]) + 8}
                  </span>
                </div>
                <button onClick={() => increase(attr)} type="button">
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export { SummonStats };

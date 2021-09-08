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
  summonName,
  setSummonName,
  assignName,
}) => {
  const [context] = useContext(RarityContext);
  const [amountXp, setAmountXp] = React.useState(0);
  const [editingName, setEditingName] = React.useState(false);

  const [mapAttributes, setMapAttributes] = React.useState(
    Object.keys(attributes).reduce((acc, item) => {
      acc[item] = Number(attributes[item]) + 8;
      return acc;
    }, {})
  );

  const [totalPointsToSpend, setTotalPointsToSpend] = React.useState(
    Object.keys(mapAttributes).reduce(
      (acc, item) => acc + mapAttributes[item],
      0
    ) === 48
      ? 32
      : levelPoints
  );

  const increase_by_skill = async (attr) => {
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

  const increase = async (attr) => {
    if (!(totalPointsToSpend <= 0)) {
      setMapAttributes({
        ...mapAttributes,
        [attr]: mapAttributes[attr] + 1,
      });
      setTotalPointsToSpend(totalPointsToSpend - 1);
    }
  };

  const decrease = async (attr) => {
    if (totalPointsToSpend > 0) {
      setMapAttributes({
        ...mapAttributes,
        [attr]: mapAttributes[attr] - 1,
      });
      setTotalPointsToSpend(totalPointsToSpend + 1);
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

  const confirmPoints = async () => {
    try {
      if (summonId != null) {
        await context.contract_attributes.methods
          .point_buy(
            summonId,
            mapAttributes?.strength || 8,
            mapAttributes?.dexterity || 8,
            mapAttributes?.constitution || 8,
            mapAttributes?.intelligence || 8,
            mapAttributes?.wisdom || 8,
            mapAttributes?.charisma || 8
          )
          .send({ from: context.accounts[0] });
        NotificationManager.success(
          "Summoner bought some points!",
          "Information"
        );
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
  };

  return (
    <>
      <div className="summoner-stats">
        <div className="container-box summoner-information">
          <ul className="stats-list">
            <li>
              <div className="summon-name">
                <p>
                  Name: {summonName ? summonName : "Unknown"}
                  {summonName && !editingName && (
                    <img
                      src={process.env.PUBLIC_URL + "/img/edit-feather.png"}
                      onClick={() => setEditingName(true)}
                      alt="edit-name"
                    />
                  )}
                </p>
                {(!summonName || editingName) && (
                  <>
                    <input
                      onChange={(e) => setSummonName(e.target.value)}
                      max="1000"
                      placeholder="Warrior name"
                    />
                    <button onClick={assignName}>
                      {summonName ? "Rename" : "Assign"}
                    </button>
                  </>
                )}
              </div>
            </li>
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
              <>
                <div
                  className="summoner-attribute-container"
                  key={`class-${attr}`}
                >
                  <button
                    onClick={() => decrease(attr)}
                    type="button"
                    disabled={
                      Object.keys(mapAttributes).reduce(
                        (acc, item) => acc + mapAttributes[item],
                        0
                      ) === 48 || mapAttributes[attr] === 8
                    }
                  >
                    -
                  </button>
                  <div className="summoner-attribute">
                    {attr[0].toUpperCase() + attr.slice(1)}:{" "}
                    <span className="golden-font">{mapAttributes[attr]}</span>
                  </div>
                  <button onClick={() => increase(attr)} type="button">
                    +
                  </button>
                  <button
                    className="assign-points-summoner"
                    type="button"
                    onClick={() => increase_by_skill(attr)}
                    disabled={!(levelPoints > 0)}
                  >
                    Assign
                  </button>
                </div>
              </>
            );
          })}
          <div className="summoner-buttons">
            <button
              className="confirm-points-summoner"
              onClick={() => confirmPoints()}
            >
              Confirm points
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export { SummonStats };

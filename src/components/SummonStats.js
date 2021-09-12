import React, { useContext } from "react";
import { NotificationManager } from "react-notifications";
import { RarityContext } from "../context/RarityProvider";
import { CLASSES_TYPE } from "../utils/classes";
import { ProgressBar } from "../components/ProgressBar";
import { useEffect } from "react/cjs/react.development";
import { RARITY_BASE_MAX_SCORE } from "../utils/config";

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
  gold,
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
      ? RARITY_BASE_MAX_SCORE
      : levelPoints
  );

  useEffect(() => {
    const computeLevelingScore = (value) => {
      const base = value - 8;
      if (value <= 14) {
        return base;
      } else {
        return Math.floor(base ** 2 / 6);
      }
    };

    if (mapAttributes) {
      const totalComputeCost = Object.keys(mapAttributes).reduce(
        (acc, item) => acc + computeLevelingScore(mapAttributes[item]),
        0
      );

      setTotalPointsToSpend(
        Math.ceil(RARITY_BASE_MAX_SCORE - totalComputeCost)
      );
    }
  }, [mapAttributes]);

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

  const computeAssingAttributes = (attr) => {
    if (attr <= 14) {
      return 1;
    }
    if (attr > 14 && attr <= 16) {
      return 2;
    } else if (attr >= 17) {
      return 3;
    } else {
      return 1;
    }
  };

  const increase = async (attr) => {
    if (!(totalPointsToSpend <= 0)) {
      setMapAttributes({
        ...mapAttributes,
        [attr]: mapAttributes[attr] + 1,
      });
    }
  };

  const decrease = async (attr) => {
    if (totalPointsToSpend >= 0) {
      setMapAttributes({
        ...mapAttributes,
        [attr]: mapAttributes[attr] - 1,
      });
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

  const claimGold = async () => {
    try {
      if (summonId != null) {
        await context.contract_gold.methods
          .claim(summonId)
          .send({ from: context.accounts[0] });
        NotificationManager.success(`Summoner claimed gold!`, "Information");
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
                <p className="summon-name-indicator">
                  {summonName ? summonName : "Unknown"}
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
              <div className="claim-gold">
                <div className="claim-gold-container">
                  <img
                    alt="coin"
                    src={process.env.PUBLIC_URL + "/img/coin.png"}
                  />
                  <div className="gold-indicator">{gold.playerGold}</div>
                </div>
                <div className="claim-gold-container">
                  <button
                    onClick={claimGold}
                    disabled={Number(gold.pendingGold) === 0}
                  >
                    {Number(gold.pendingGold) > 0
                      ? `Claim ${gold.pendingGold} gold!`
                      : "No gold to claim"}
                  </button>
                </div>{" "}
              </div>
            </li>
            <li>
              <div className="xp-spend">
                <ProgressBar done={(xp / xpRequired) * 100}></ProgressBar>
                <input
                  onChange={updateAmount}
                  max="1000"
                  placeholder="XP to spend"
                />
                <button onClick={spendXp}>Spend XP</button>
              </div>
              {/* <div className="xp-spend-required">
                <p>Left: {xpToGo}</p>
                <p>Required: {xpRequired}</p>
              </div> */}
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
              <p>
                Attributes point: <i>({totalPointsToSpend})</i> + {levelPoints}
              </p>
            </li>
          </ul>
        </div>
        <div className="container-box summoner-attributes">
          {Object.keys(attributes).map((attr) => {
            return (
              <React.Fragment key={`class-${attr}`}>
                <div className="summoner-attribute-container">
                  <button
                    onClick={() => decrease(attr)}
                    type="button"
                    disabled={
                      // Object.keys(mapAttributes).reduce(
                      //   (acc, item) => acc + mapAttributes[item],
                      //   0
                      // ) === 48 ||
                      mapAttributes[attr] === 8
                    }
                  >
                    -
                  </button>
                  <div className="summoner-attribute">
                    {attr[0].toUpperCase() + attr.slice(1)}:{" "}
                    <span className="golden-font">{mapAttributes[attr]}</span>
                  </div>
                  <button
                    disabled={
                      totalPointsToSpend <
                      computeAssingAttributes(mapAttributes[attr])
                    }
                    onClick={() => increase(attr)}
                    type="button"
                  >
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
              </React.Fragment>
            );
          })}
          <div className="summoner-buttons">
            <button
              className="confirm-points-summoner"
              onClick={() => confirmPoints()}
            >
              Confirm points ({totalPointsToSpend})
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export { SummonStats };

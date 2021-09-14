import React, { useContext, useEffect } from "react";
import { RarityContext } from "../context/RarityProvider";
import { CLASSES_TYPE } from "../utils/classes";
import { ProgressBar } from "../components/ProgressBar";
import { RARITY_BASE_MAX_SCORE } from "../utils/config";
import { toast } from "react-toastify";

const SummonStats = ({
  refreshView,
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
  levelUpPlayer,
}) => {
  const [context] = useContext(RarityContext);
  const [editedName, setEditedName] = React.useState(summonName);
  const [editingName, setEditingName] = React.useState(false);
  const [tempAttributes, setTempAttributes] = React.useState(attributes);

  useEffect(() => {
    setTempAttributes(attributes);
  }, [attributes]);

  const [totalPointsToSpend, setTotalPointsToSpend] = React.useState(
    Object.keys(tempAttributes).reduce(
      (acc, item) => acc + tempAttributes[item],
      0
    ) === 48
      ? RARITY_BASE_MAX_SCORE
      : levelPoints
  );

  const computeAssingAttributes = (attr) => {
    const newAttributes = { ...tempAttributes };
    newAttributes[attr] += 1;
    const totalComputeCost = Object.keys(newAttributes).reduce((acc, item) => {
      const computeLevelingScore = (value) => {
        const base = value - 8;
        if (value <= 14) {
          return base;
        } else {
          return Math.floor(base ** 2 / 6);
        }
      };
      return acc + computeLevelingScore(newAttributes[item]);
    }, 0);

    return RARITY_BASE_MAX_SCORE - totalComputeCost < 0;
  };

  React.useEffect(() => {
    if (tempAttributes) {
      const totalComputeCost = Object.keys(tempAttributes).reduce(
        (acc, item) => {
          const computeLevelingScore = (value) => {
            const base = value - 8;
            if (value <= 14) {
              return base;
            } else {
              return Math.floor(base ** 2 / 6);
            }
          };
          return acc + computeLevelingScore(tempAttributes[item]);
        },
        0
      );
      setTotalPointsToSpend(
        Math.ceil(RARITY_BASE_MAX_SCORE - totalComputeCost)
      );
    }
  }, [tempAttributes]);

  const increase_by_skill = async (attr) => {
    if (!summonId) return;
    const id = toast.loading("Increasing skill...");
    try {
      if (summonId != null) {
        await context.contract_attributes.methods[`increase_${attr}`](
          summonId
        ).send({ from: context.accounts[0] });
        toast.update(id, {
          render: `Skill increased!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        refreshView();
      }
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! ${JSON.stringify(ex)}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const increase = async (attr) => {
    if (!(totalPointsToSpend <= 0)) {
      setTempAttributes((prevState) => ({
        ...prevState,
        [attr]: prevState[attr] + 1,
      }));
    }
  };

  const decrease = async (attr) => {
    if (totalPointsToSpend >= 0) {
      setTempAttributes((prevState) => ({
        ...prevState,
        [attr]: prevState[attr] - 1,
      }));
    }
  };

  const confirmPoints = async () => {
    if (totalPointsToSpend || !summonId) return;
    const id = toast.loading("Confirming points...");
    try {
      await context.contract_attributes.methods
        .point_buy(
          summonId,
          tempAttributes?.strength || 8,
          tempAttributes?.dexterity || 8,
          tempAttributes?.constitution || 8,
          tempAttributes?.intelligence || 8,
          tempAttributes?.wisdom || 8,
          tempAttributes?.charisma || 8
        )
        .send({ from: context.accounts[0] });

      toast.update(id, {
        render: `Summoner bought some points!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      refreshView();
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! ${JSON.stringify(ex)}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const claimGold = async () => {
    if (!summonId) return;
    const id = toast.loading("Claiming gold...");
    try {
      await context.contract_gold.methods
        .claim(summonId)
        .send({ from: context.accounts[0] });

      toast.update(id, {
        render: `Gold claimed!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      refreshView();
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! ${JSON.stringify(ex)}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    attributes && (
      <>
        <div className="summoner-stats">
          <div className="container-box summoner-information">
            <ul className="stats-list">
              <li>
                <div className="summon-name">
                  <p>
                    <span>Summoner Name:</span>
                    {summonName ? summonName : "Unknown"}
                  </p>
                  {summonName && !editingName && (
                    <img
                      src={process.env.PUBLIC_URL + "/img/edit-feather.png"}
                      onClick={() => setEditingName(true)}
                      alt="edit-name"
                    />
                  )}
                  {(!summonName || editingName) && (
                    <>
                      <input
                        onChange={(e) => setEditedName(e.target.value)}
                        max="1000"
                        placeholder="Warrior name"
                      />
                      <button
                        onClick={() => {
                          assignName(editedName);
                        }}
                      >
                        {summonName ? "Rename" : "Assign"}
                      </button>
                      {summonName && (
                        <p
                          style={{
                            color: "red",
                            cursor: "pointer",
                            margin: "0 5px",
                            padding: "0px",
                            overflow: "unset",
                          }}
                          onClick={() => {
                            setEditingName(false);
                            setEditedName(summonName);
                          }}
                        >
                          X
                        </p>
                      )}
                    </>
                  )}
                </div>
              </li>
              <li>
                <div className="d-flex">
                  <p>
                    <span>Level:</span> {level} {name.title}{" "}
                  </p>
                  <ProgressBar
                    xp={xp}
                    xpRequired={xpRequired}
                    levelUpPlayer={levelUpPlayer}
                  ></ProgressBar>
                </div>
              </li>
              <li>
                <p>
                  <span>Class:</span> {CLASSES_TYPE[classType]}
                </p>
              </li>
              <li>
                <div className="claim-gold">
                  <div className="claim-gold-container">
                    <span>Gold:</span>
                    <p className="gold-indicator">{gold.playerGold}</p>
                    <img
                      alt="coin"
                      src={process.env.PUBLIC_URL + "/img/coin.png"}
                    />
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
                <p>
                  <span>Attributes point:</span> <i>({totalPointsToSpend})</i> +{" "}
                  {levelPoints}
                </p>
              </li>
            </ul>
          </div>
          <div className="container-box summoner-attributes">
            {Object.keys(tempAttributes).map((attr) => {
              return (
                <React.Fragment key={`class-${attr}`}>
                  <div className="summoner-attribute-container">
                    <button
                      onClick={() => decrease(attr)}
                      type="button"
                      disabled={attributes[attr] === tempAttributes[attr]}
                    >
                      -
                    </button>
                    <div className="summoner-attribute">
                      {attr[0].toUpperCase() + attr.slice(1)}:{" "}
                      <span className="golden-font">
                        {tempAttributes[attr]}
                      </span>
                    </div>
                    <button
                      disabled={computeAssingAttributes(attr)}
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
                disabled={totalPointsToSpend !== 0}
              >
                Confirm points ({totalPointsToSpend})
              </button>
            </div>
          </div>
        </div>
      </>
    )
  );
};

export { SummonStats };

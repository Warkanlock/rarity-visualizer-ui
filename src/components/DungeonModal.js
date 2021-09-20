import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RarityContext } from "../context/RarityProvider";
import "../Modal.css";
import { CLASSES_TYPE } from "../utils/classes";
import { RetryContractCall } from "../utils/fetchRetry";

const DungeonModal = ({ setShowDungeonModal, summonId }) => {
  const [context] = useContext(RarityContext);
  const [loading, setLoading] = useState(false);
  const [dungeonInfo, setDungeonInfo] = useState(null);
  const [adventureTime, setAdventureTime] = useState(null);

  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadDungeon = async () => {
      setLoading(true);

      const summonData = await RetryContractCall(
        context.contract_base.methods.summoner(summonId)
      );

      const dungeonDamagePromise = RetryContractCall(
        context.contract_dungeons.methods.dungeon_damage()
      );

      const bonusByClassPromise = RetryContractCall(
        context.contract_dungeons.methods.base_attack_bonus_by_class(
          summonData[2]
        )
      );

      const dungeonHealthPromise = RetryContractCall(
        context.contract_dungeons.methods.dungeon_health()
      );

      const dungeonArmorClassPromise = RetryContractCall(
        context.contract_dungeons.methods.dungeon_armor_class()
      );

      const [dungeonDamage, bonusByClass, dungeonHealth, dungeonArmorClass] =
        await Promise.all([
          dungeonDamagePromise,
          bonusByClassPromise,
          dungeonHealthPromise,
          dungeonArmorClassPromise,
        ]);

      setDungeonInfo({
        dungeon: "The Cellar",
        damage: dungeonDamage,
        health: dungeonHealth,
        armor: dungeonArmorClass,
        bonus: CLASSES_TYPE[summonData[2]] + " +" + bonusByClass.toString(),
      });
      setLoading(false);
    };

    const isReadyForAdventure = async () => {
      if (summonId != null && context.contract_base) {
        setLoading(true);
        await getAdventureTime();
        setLoading(false);
      }
    };
    try {
      loadDungeon();
      isReadyForAdventure();
    } catch (ex) {
      toast.error(`Something went wrong! Try Again in a few seconds!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShowDungeonModal]);

  const getAdventureTime = async () => {
    const timestamp = await RetryContractCall(
      context.contract_dungeons.methods.adventurers_log(summonId)
    );
    const milliseconds = timestamp * 1000;
    const dateObject = new Date(milliseconds);
    setAdventureTime(dateObject);
  };

  const closeOnEscapeKeyDown = (e) => {
    if ((e.charCode || e.keyCode) === 27) {
      setShowDungeonModal(false);
    }
  };

  const exploreDungeon = async () => {
    if (!summonId) return;
    const id = toast.loading("Exploring dungeon...");
    try {
      await context.contract_dungeons.methods
        .adventure(summonId)
        .send({ from: context.accounts[0] });
      await getAdventureTime();
      toast.update(id, {
        render: `Summoner started exploring the dungeon!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const scoutDungeon = async () => {
    if (!summonId) return;
    const id = toast.loading("Scouting...");
    try {
      const response = await RetryContractCall(
        context.contract_dungeons.methods.scout(summonId)
      );
      if (Number(response) === 0) {
        toast.update(id, {
          render: `This dungeon is too dangerous for you... You won't find anything here`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(id, {
          render: `After scouting the dungeon ~${Number(response)} drops found`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (ex) {
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
      <div className="modal" onClick={() => setShowDungeonModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <>
            <div className="modal-header">{"Dungeon World"}</div>
            {loading || !dungeonInfo ? (
              <div className="spinner"></div>
            ) : (
              <>
                <div className="modal-body">
                  <div className="dungeon-description">
                    <div className="dungeon-container-left">
                      {Object.keys(dungeonInfo).map((key) => (
                        <React.Fragment key={`dungeon-key-${key}`}>
                          {key[0].toUpperCase() + key.slice(1)}
                          <div className="dungeon-stat">
                            <img
                              className="dungeon-stat-icon"
                              src={`${process.env.PUBLIC_URL}/icons/${key}.png`}
                              alt={"dungeon-stat-icon"}
                            />
                            <span className="dungeon-golden-font">
                              {dungeonInfo[key]}
                            </span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="dungeon-container-right">
                      <img
                        src={process.env.PUBLIC_URL + "/img/dungeon.png"}
                        alt="dungeon-draw"
                        className="dungeon-image"
                      />
                      <div className="dungeon-buttons-thecellar">
                        <button
                          disabled={
                            adventureTime?.getTime() >= new Date().getTime() ||
                            summonId === null
                          }
                          className="dungeon-button-adventure"
                          onClick={exploreDungeon}
                          type="button"
                        >
                          {loading ? (
                            <div>
                              <div className="spinner"></div>
                            </div>
                          ) : adventureTime?.getTime() >=
                            new Date().getTime() ? (
                            <p>
                              You need to rest, try again in{" "}
                              {Math.floor(
                                Math.abs(
                                  adventureTime?.getTime() -
                                    new Date().getTime()
                                ) /
                                  1000 /
                                  3600
                              ) % 24}{" "}
                              hours
                            </p>
                          ) : (
                            "Attack"
                          )}
                        </button>
                        <button
                          disabled={summonId === null}
                          className="dungeon-button-adventure"
                          onClick={scoutDungeon}
                          type="button"
                        >
                          Scout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  Try to not get lost in the fog...
                </div>
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default DungeonModal;

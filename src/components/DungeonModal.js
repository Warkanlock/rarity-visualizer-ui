import React, { useContext, useEffect, useState } from "react";
import NotificationManager from "react-notifications/lib/NotificationManager";
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
        context.contract.methods.summoner(summonId)
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
      if (summonId != null && context.contract) {
        setLoading(true);
        const timestamp = await RetryContractCall(
          context.contract_dungeons.methods.adventurers_log(summonId)
        );
        const milliseconds = timestamp * 1000;
        const dateObject = new Date(milliseconds);
        setAdventureTime(dateObject);
        setLoading(false);
      }
    };
    try {
      loadDungeon();
      isReadyForAdventure();
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShowDungeonModal]);

  const closeOnEscapeKeyDown = (e) => {
    if ((e.charCode || e.keyCode) === 27) {
      setShowDungeonModal(false);
    }
  };

  const exploreDungeon = async () => {
    try {
      setLoading(true);
      if (summonId != null) {
        await context.contract_dungeons.methods
          .adventure(summonId)
          .send({ from: context.accounts[0] });
        NotificationManager.success(
          "Summoner started exploring the dungeon!",
          "Information"
        );
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    } finally {
      setLoading(false);
    }
  };

  const scoutDungeon = async () => {
    try {
      setLoading(true);
      if (summonId != null) {
        const response = await RetryContractCall(
          context.contract_dungeons.methods.scout(summonId)
        );
        NotificationManager.success(
          `After scouting the dungeon ${Number(response)} rewards found`,
          "Information"
        );
      }
    } catch (ex) {
      NotificationManager.error(`Something went wrong! ${JSON.stringify(ex)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal" onClick={() => setShowDungeonModal(false)}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
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
                  Be careful...you don't know how much pain you can find
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

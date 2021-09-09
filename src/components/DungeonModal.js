import React, { useContext, useEffect, useState } from "react";
import NotificationManager from "react-notifications/lib/NotificationManager";
import { RarityContext } from "../context/RarityProvider";
import "../Modal.css";

const DungeonModal = ({ setShowDungeonModal, summonId, classId }) => {
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
      const dungeonDamage = await context.contract_dungeons.methods
        .dungeon_damage()
        .call();

      const bonusByClass = await context.contract_dungeons.methods
        .base_attack_bonus_by_class(classId)
        .call();

      const dungeonHealth = await context.contract_dungeons.methods
        .dungeon_health()
        .call();
      const dungeonToHit = await context.contract_dungeons.methods
        .dungeon_health()
        .call();
      const dungeonArmorClass = await context.contract_dungeons.methods
        .dungeon_armor_class()
        .call();

      setDungeonInfo({
        dungeon: "The Cellar",
        damange: dungeonDamage,
        healt: dungeonHealth,
        hit: dungeonToHit,
        armor: dungeonArmorClass,
        bonus: bonusByClass,
      });
      setLoading(false);
    };

    const isReadyForAdventure = async () => {
      if (summonId != null && context.contract) {
        setLoading(true);
        const timestamp = await context.contract.methods
          .adventurers_log(summonId)
          .call();
        const milliseconds = timestamp * 1000; // 1575909015000
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
  }, []);

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

  console.log(loading);

  return (
    <>
      <div className="dungeon-modal" onClick={() => setShowDungeonModal(false)}>
        <div
          className="dungeon-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <>
            <div className="dungeon-modal-header">{"Dungeon World"}</div>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              dungeonInfo && (
                <>
                  <div className="dungeon-modal-body">
                    <div className="dungeon-description">
                      <div className="dungeon-container-left">
                        {Object.keys(dungeonInfo).map((key) => (
                          <>
                            {key[0].toUpperCase() + key.slice(1)}
                            <span className="dungeon-golden-font">
                              {dungeonInfo[key]}
                            </span>
                          </>
                        ))}
                      </div>
                      <div className="dungeon-container-right">
                        <img
                          src={process.env.PUBLIC_URL + "/img/dungeon.png"}
                          alt="dungeon-draw"
                          className="dungeon-image"
                        />
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
                              Next adventure in{" "}
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
                            "Explore the dungeon"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="dungeon-modal-footer">
                    Be careful...you don't know how much pain you can find
                  </div>
                </>
              )
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default DungeonModal;

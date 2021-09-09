import React, { useContext, useEffect, useState } from "react";
import { RarityContext } from "../context/RarityProvider";
import "../Modal.css";

const DungeonModal = ({ setShowDungeonModal }) => {
  const [context] = useContext(RarityContext);
  const [loading, setLoading] = useState(false);
  const [dungeonInfo, setDungeonInfo] = useState({
    dungeonName: "",
    dungeonDamage: 0,
    dungeonHealth: 0,
    dungeonToHit: 0,
    dungeonArmorClass: 0,
  });

  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const loadDungeon = async () => {
      const dungeonName = await context.contract_dungeons.methods.name().call();
      const dungeonDamage = await context.contract_dungeons.methods
        .dungeon_damage()
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
        dungeonName,
        dungeonDamage,
        dungeonHealth,
        dungeonToHit,
        dungeonArmorClass,
      });
    };
    try {
      loadDungeon();
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const closeOnEscapeKeyDown = (e) => {
    if ((e.charCode || e.keyCode) === 27) {
      setShowDungeonModal(false);
    }
  };

  return (
    <>
      <div className="dungeon-modal" onClick={() => setShowDungeonModal(false)}>
        <div
          className="dungeon-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div>loading</div>
          ) : (
            <>
              <div className="dungeon-modal-header">
                {dungeonInfo.dungeonName}
              </div>
              <div className="dungeon-modal-body">
                {Object.keys(dungeonInfo).map((key) => (
                  <div>
                    {key}:{" "}
                    <span className="golden-font">{dungeonInfo[key]}</span>
                  </div>
                ))}
              </div>
              <div className="dungeon-modal-footer">Dungeon Footer</div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DungeonModal;

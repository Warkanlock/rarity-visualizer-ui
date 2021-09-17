import React from "react";
import { createPopper } from '@popperjs/core';

function SkillItem({
  synergy,
  attribute_id,
  name,
  id,
  retry,
  armor_check_penalty,
  check,
  action,
  isCross,
  totalPointsToSpend,
  handleRemoveRankPoint,
  handleAddRankPoint,
}) {
  const [skillValue, setSkillValue] = React.useState(0);
  const [currentSkillValue, setCurrentSkillValue] = React.useState(skillValue);

  return (
    <div className="summon-skill-item">
      <div className="summon-skill-item-card">
        <img
          className="summon-skill-item-card-img"
          src={`${process.env.PUBLIC_URL}/skills/${name}.png`}
          alt={`${name}-skill-img`}
        />
        <div className="summon-skill-item-card-synergy">
          <span>{synergy}</span>
        </div>
        {armor_check_penalty && (
          <div className="summon-skill-item-card-armorpenalty">
            <img
              src={`${process.env.PUBLIC_URL}/icons/armor_penalty.png`}
              alt="summon-img"
            />
          </div>
        )}
        {retry && (
          <div className="summon-skill-item-card-retry">
            <img
              src={`${process.env.PUBLIC_URL}/icons/retry.png`}
              alt="summon-img"
            />
          </div>
        )}
        <div className="summon-skill-item-card-buttons">
          <span
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => {
              if (skillValue > 0) {
                handleRemoveRankPoint(id, skillValue);
                setSkillValue(skillValue - 1);
              }
            }}
          >
            -
          </span>
          {skillValue > currentSkillValue ? (
            <span style={{ color: "green" }}>{skillValue}</span>
          ) : (
            <span>{skillValue}</span>
          )}
          <span
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => {
              if (skillValue < (isCross ? 2 : 5) && totalPointsToSpend > 0) {
                handleAddRankPoint(id, skillValue);
                setSkillValue(skillValue + 1);
              }
            }}
          >
            +
          </span>
        </div>
      </div>
    </div>
  );
}

export default SkillItem;

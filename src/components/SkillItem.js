import React from "react";
import { CLASSES_ATTRIBUTES } from "../utils/classes";

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

  var randomColor = "#" + (((1 << 24) * Math.random()) | 0).toString(16);

  return (
    <div className="summon-skill-item">
      {/* replace with image */}
      <div
        className="summon-skill-item-card"
        style={{ backgroundColor: randomColor }}
      >
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
          <span>{skillValue}</span>
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

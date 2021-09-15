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
              handleRemoveRankPoint(id, skillValue);
              setSkillValue(skillValue - 1);
            }}
          >
            -
          </span>
          <span>{skillValue}</span>
          <span
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => {
              handleAddRankPoint(id, skillValue);
              setSkillValue(skillValue + 1);
            }}
          >
            +
          </span>
        </div>
      </div>
      {/* <p>{id}</p>
      <p>{name}</p>
      <p>{CLASSES_ATTRIBUTES[attribute_id]}</p>
      <p>{armor_check_penalty ? "Yes" : "No"}</p>
      <p>{retry ? "Yes" : "No"}</p>
      <p>{synergy}</p>
      <button
        onClick={() => {
          handleRemoveRankPoint(id, skillValue);
          setSkillValue(skillValue - 1);
        }}
      >
        Remove
      </button>
      {skillValue}
      <button
        onClick={() => {
          handleAddRankPoint(id, skillValue);
          setSkillValue(skillValue + 1);
        }}
      >
        Add
      </button> */}
    </div>
  );
}

export default SkillItem;

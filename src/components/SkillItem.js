import React, { useState } from "react";
import { usePopper } from "react-popper";
import { CLASSES_ATTRIBUTES } from "../utils/classes";
import SkillItemTooltip from "./SkillItemTooltip";

const SkillItem = ({
  synergy,
  attribute_id,
  name,
  id,
  retry,
  armor_check_penalty,
  check,
  action,
  isCross,
  currentValue,
  totalPointsToSpend,
  handleRemoveRankPoint,
  handleAddRankPoint,
  skillSynergy,
}) => {
  const [skillValue, setSkillValue] = useState(currentValue || 0);
  const [currentSkillValue] = useState(skillValue);
  const [showPopper, setShowPopper] = useState(false);

  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      {
        name: "arrow",
        options: {
          element: arrowElement,
        },
      },
    ],
    placement: "right",
  });

  return (
    <>
      <div
        className="summon-skill-item"
        ref={setReferenceElement}
        onMouseEnter={() => setShowPopper(true)}
        onMouseLeave={() => setShowPopper(false)}
      >
        <div className="summon-skill-item-card">
          <img
            className="summon-skill-item-card-img"
            src={`${process.env.PUBLIC_URL}/skills/${name}.png`}
            alt={`${name}-skill-img`}
          />
          {skillSynergy && (
            <div className="summon-skill-item-card-synergy">
              <img
                src={`${process.env.PUBLIC_URL}/icons/syngergy.png`}
                alt="syngegy-img"
              />
            </div>
          )}
          {armor_check_penalty && (
            <div className="summon-skill-item-card-armorpenalty">
              <img
                src={`${process.env.PUBLIC_URL}/icons/armor_penalty.png`}
                alt="armorpenalty-img"
              />
            </div>
          )}
          {retry && (
            <div className="summon-skill-item-card-retry">
              <img
                src={`${process.env.PUBLIC_URL}/icons/retry.png`}
                alt="retry-img"
              />
            </div>
          )}
          <div className="summon-skill-item-card-buttons">
            <span
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => {
                if (skillValue <= currentSkillValue) return;
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
      {showPopper && (
        <div
          className="summon-skill-tooltip"
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <SkillItemTooltip
            name={name}
            attribute={CLASSES_ATTRIBUTES[attribute_id]}
            action={action}
            check={check}
            synergy={synergy}
            retry={retry}
            armorPenalty={armor_check_penalty}
            skillSynergy={skillSynergy}
          />
          <div
            className="summon-skill-arrow"
            ref={setArrowElement}
            style={styles.arrow}
          />
        </div>
      )}
    </>
  );
};

export default SkillItem;

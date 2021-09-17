import React from "react";

const SkillItemTooltip = ({
  name,
  attribute,
  action,
  check,
  synergy,
  retry,
  armorPenalty,
  skillSynergy,
  skillValue,
  isCross,
  summonLevel,
}) => {
  return (
    <div className="container-box summon-skill-tooltip-container">
      <div className="summon-skill-tooltip-header">
        <div className="summon-skill-tooltip-header-name">
          <h2>{name}</h2>
          <h5>{attribute}</h5>
          <h6>
            {skillValue}/
            {isCross ? Math.trunc((summonLevel + 3) / 2) : summonLevel + 3}
          </h6>
        </div>
        <img
          src={`${process.env.PUBLIC_URL}/skills/${name}.png`}
          alt={`${name}-skill-img`}
        />
      </div>
      <hr
        style={{ marginTop: "10px", border: "1px solid rgba(255,255,255, .1)" }}
      />
      <div className="summon-skill-tooltip-body">
        <div className="summon-skill-tooltip-info">
          <span>
            Synergy with:{" "}
            {skillSynergy ? (
              <span>{skillSynergy}</span>
            ) : (
              <span style={{ color: "red" }}>✘</span>
            )}
          </span>
          <span>
            Retry:{" "}
            {retry ? (
              <span style={{ color: "green" }}>✓</span>
            ) : (
              <span style={{ color: "red" }}>✘</span>
            )}
          </span>
          <span>
            Armor Check Penalty:{" "}
            {armorPenalty ? (
              <span style={{ color: "green" }}>✓</span>
            ) : (
              <span style={{ color: "red" }}>✘</span>
            )}
          </span>
        </div>
        <hr
          style={{
            marginTop: "10px",
            border: "1px solid rgba(255,255,255, .1)",
          }}
        />
        <div className="summon-skill-tooltip-action">
          <h4>Action</h4>
          <p>{action}</p>
        </div>
        <hr
          style={{
            marginTop: "10px",
            border: "1px solid rgba(255,255,255, .1)",
          }}
        />
        <div className="summon-skill-tooltip-check">
          <h4>Check</h4>
          <p>{check}</p>
        </div>
      </div>
    </div>
  );
};

export default SkillItemTooltip;

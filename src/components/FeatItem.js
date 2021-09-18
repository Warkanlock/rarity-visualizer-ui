import React from "react";

function FeatItem({
  information,
  onSelection,
  canPickFeat,
  isBase,
  hasPointsAvailable,
  prerequisitesFeat,
}) {
  return (
    <>
      <div className="summon-feat-item">
        <h3>{information.name}</h3>
        <p>{information.benefit}</p>
        {isBase ? (
          <div className="summon-feat-base-class">Assigned</div>
        ) : !hasPointsAvailable ? (
          <div disabled className="summon-feat-base-class">
            No points
          </div>
        ) : !canPickFeat ? (
          <div className="summon-feat-prerequisites">
            <p>Prerequisites not met:</p>
            <span>{prerequisitesFeat?.name}</span>
          </div>
        ) : (
          <button
            className="summon-feat-select-feat"
            onClick={() => onSelection(information.id)}
          >
            PICK FEAT
          </button>
        )}
      </div>
    </>
  );
}

export default FeatItem;

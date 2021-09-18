import React from "react";

function FeatItem({ information, onSelection, isSummonerSkill, isBase }) {
  return (
    <>
      <div className="summon-feat-item">
        <h3>{information.name}</h3>
        <p>{information.benefit}</p>
        {isBase ? (
          <div className="summon-feat-base-class">BASE CLASS</div>
        ) : (
          <button
            className="summon-feat-select-feat"
            disabled={isSummonerSkill}
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

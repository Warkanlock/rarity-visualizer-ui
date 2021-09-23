import { reduceNumber } from "../../utils";

function GenericItem({
  id,
  base,
  name,
  description,
  cost,
  weight,
  armourStat,
  weaponStat,
  onCraft,
}) {
  const humanize = (text) => {
    return text[0].toUpperCase() + text.slice(1).replace("_", " ");
  };

  return (
    <div className="item-generic-style">
      <div className="item-generic-title">
        <h2>{name}</h2>
        <button
          className="item-generic-title-button"
          onClick={() => onCraft(id, base)}
        >
          Craft
        </button>
      </div>
      {description && <p>{description}</p>}
      <div className="item-generic-cost-and-weight">
        <div className="item-generic-minimal-description-item">
          <span className="item-generic-minimal-description">Cost :</span>{" "}
          {cost / reduceNumber(18)}
        </div>
        <div className="item-generic-minimal-description-item">
          <span className="item-generic-minimal-description">Weight :</span>{" "}
          {weight}
        </div>
      </div>

      {armourStat && (
        <div className="item-generic-armour-stats">
          {Object.keys(armourStat).map((key) => (
            <div className="item-generic-minimal-description-item">
              <span className="item-generic-minimal-description">
                {humanize(key)}:
              </span>{" "}
              {armourStat[key]}
            </div>
          ))}
        </div>
      )}

      {weaponStat && (
        <div className="item-generic-armour-stats">
          {Object.keys(weaponStat).map((key) => (
            <div className="item-generic-minimal-description-item">
              <span className="item-generic-minimal-description">
                {humanize(key)}:
              </span>{" "}
              {weaponStat[key]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GenericItem;

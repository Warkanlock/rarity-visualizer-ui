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
  onIncreaseMaterial,
  totalMaterials,
  materialsLeft,
  materialsToUse,
  resetMaterials,
}) {
  const humanize = (text) => {
    return text[0].toUpperCase() + text.slice(1).replaceAll("_", " ");
  };

  return (
    <div className="item-generic-style">
      <div className="item-generic-title">
        <span className="item-name">{name}</span>
      </div>
      {description && <p>{description}</p>}
      <div className="item-generic-cost-and-weight">
        <div className="item-generic-minimal-description-item">
          <span className="item-generic-minimal-description">Cost :</span>{" "}
          <span className="indicator">{cost / reduceNumber(18)}</span>
          <img
            className="gold-icon"
            alt="coin"
            src={process.env.PUBLIC_URL + "/img/coin.png"}
          />
        </div>
        <div className="item-generic-minimal-description-item">
          <span className="item-generic-minimal-description">Weight :</span>{" "}
          <span className="indicator">{weight}</span>
        </div>
      </div>

      {armourStat && (
        <div className="item-generic-armour-stats">
          {Object.keys(armourStat).map((key) => (
            <div key={key} className="item-generic-minimal-description-item">
              <span className="item-generic-minimal-description">
                {humanize(key)}:
              </span>{" "}
              <span className="indicator">{armourStat[key]}</span>
            </div>
          ))}
        </div>
      )}

      {weaponStat && (
        <div className="item-generic-armour-stats">
          {Object.keys(weaponStat).map((key) => (
            <div key={key} className="item-generic-minimal-description-item">
              <span className="item-generic-minimal-description">
                {humanize(key)}:
              </span>{" "}
              <span className="indicator">{weaponStat[key]}</span>
            </div>
          ))}
        </div>
      )}
      <div className="item-actions">
        <button
          className="item-generic-small-button craft"
          onClick={() => onCraft(id, base)}
        >
          Craft
        </button>
      </div>
    </div>
  );
}

export default GenericItem;

import React, { useEffect } from "react";
import { CLASSES_DESCRIPTION, CLASSES_TYPE } from "../utils/classes";
import ReactTooltip from "react-tooltip";

const SummonNewWarriorModal = ({
  setShowSummonNewWarriorModal,
  summonPlayer,
}) => {
  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeOnEscapeKeyDown = (e) => {
    if ((e.charCode || e.keyCode) === 27) {
      setShowSummonNewWarriorModal(false);
    }
  };

  return (
    <>
      <div
        className="modal"
        onClick={() => setShowSummonNewWarriorModal(false)}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">Summon your warrior</div>
          <div className="modal-body">
            <div className="classes-container">
              {Object.keys(CLASSES_TYPE).map((key) => {
                return (
                  <div
                    data-tip={CLASSES_DESCRIPTION[key]}
                    key={`summon-${key}`}
                    className="class-container"
                    onClick={() => summonPlayer(key)}
                  >
                    <ReactTooltip
                      className="tooltip"
                      type="dark"
                      place="bottom"
                      effect="solid"
                    />
                    <img
                      src={`${process.env.PUBLIC_URL}/classes/${CLASSES_TYPE[key]}.png`}
                      alt={`class-img-${CLASSES_TYPE[key]}`}
                    />
                    <p>{CLASSES_TYPE[key]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default SummonNewWarriorModal;

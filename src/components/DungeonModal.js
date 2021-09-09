import React, { useEffect } from "react";
import "../Modal.css";

const DungeonModal = ({ setShowDungeonModal }) => {
  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
  }, []);

  const closeOnEscapeKeyDown = (e) => {
    if ((e.charCode || e.keyCode) === 27) {
      setShowDungeonModal(false);
    }
  };

  return (
    <>
      <div className="dungeon-modal" onClick={() => setShowDungeonModal(false)}>
        <div
          className="dungeon-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="dungeon-modal-header">Dungeon Title</div>
          <div className="dungeon-modal-body">Dungeon Body</div>
          <div className="dungeon-modal-footer">Dungeon Footer</div>
        </div>
      </div>
    </>
  );
};

export default DungeonModal;

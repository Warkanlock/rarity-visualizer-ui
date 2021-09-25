import React, { useContext, useEffect, useState } from "react";
import { RarityContext } from "../context/RarityProvider";
import "../Modal.css";
import { toast } from "react-toastify";
import { RetryContractCall } from "../utils/fetchRetry";
import { reduceNumber } from "../utils";

const CraftingModal = ({
  setShowCraftingModal,
  summonId,
  totalMaterials,
  itemToCraft,
}) => {
  const [context] = useContext(RarityContext);
  const [loading, setLoading] = useState(false);
  const [materialsToUse, setMaterialsToUse] = React.useState(0);
  const [dc, setDc] = useState(0);
  const [itemCost, setItemCost] = useState(0);

  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadCraftingWindow = async () => {
      setLoading(true);
      const dcPromise = RetryContractCall(
        context.contract_crafting.base.methods.get_dc(
          itemToCraft.base,
          itemToCraft.id
        )
      );

      const itemCostPromise = RetryContractCall(
        context.contract_crafting.base.methods.get_item_cost(
          itemToCraft.base,
          itemToCraft.id
        )
      );

      const [dc, cost] = await Promise.all([dcPromise, itemCostPromise]);

      setDc(dc);
      setItemCost(cost / reduceNumber(18));
      setLoading(false);
    };

    try {
      loadCraftingWindow();
    } catch (ex) {
      toast.error(`Something went wrong! Try Again in a few seconds!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShowCraftingModal]);

  const onIncreaseMaterial = (event) => {
    setMaterialsToUse(event.target.value);
  };

  const closeOnEscapeKeyDown = (e) => {
    if ((e.charCode || e.keyCode) === 27) {
      setShowCraftingModal(false);
    }
  };

  const tryCrafting = async () => {
    if (!summonId) return;
    const id = toast.loading("Crafting...");
    try {
      const simulateCrafting = await RetryContractCall(
        context.contract_crafting.base.methods.simulate(
          summonId,
          itemToCraft.base,
          itemToCraft.id,
          materialsToUse
        )
      );

      if (!simulateCrafting.crafted) {
        toast.update(id, {
          render: `You cannot craft this item!`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      } else {
        await context.contract_crafting.base.methods
          .craft(summonId, itemToCraft.base, itemToCraft.id, materialsToUse)
          .send({ from: context.accounts[0] });

        toast.update(id, {
          render: `Item Crafted!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (ex) {
      console.log(ex);
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      <div className="modal" onClick={() => setShowCraftingModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="items-desc">
              <div className="items-desc title">
                You are about to craft{" "}
                <div className="items-desc title-name">{itemToCraft.name}</div>
              </div>
              <div className="total-materials">
                Total Materials: {totalMaterials - materialsToUse}
                <input
                  type="number"
                  min={0}
                  max={totalMaterials}
                  value={materialsToUse}
                  defaultValue={0}
                  disabled={totalMaterials - materialsToUse < 10}
                  step={10}
                  onInput={onIncreaseMaterial}
                />
              </div>
              <div className="difficulty">Difficulty: {dc}%</div>
              <div className="difficulty">Cost: {itemCost}</div>
              <div className="items-desc button-containers">
                {materialsToUse > 0 && (
                  <>
                    <button
                      onClick={() => setMaterialsToUse(0)}
                      className="items-reset-button"
                    >
                      Clear
                    </button>
                    <button
                      onClick={tryCrafting}
                      className="items-crafting-button"
                    >
                      Start Crafting
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CraftingModal;

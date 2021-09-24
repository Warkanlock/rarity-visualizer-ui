import React, { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { RarityContext } from "../context/RarityProvider";
import { RARITY_CRAFT } from "../utils/config";
import { RetryContractCall } from "../utils/fetchRetry";
import GenericItem from "./Items/GenericItem";

const totalGoods = 24;
const totalArmour = 18;
const totalWeapons = 59;

function Crafting({ summonData, summonId }) {
  const [goods, setGoods] = React.useState(null);
  const [armours, setArmours] = React.useState(null);
  const [weapons, setWeapons] = React.useState(null);
  const [goodsLoading, setGoodsLoading] = React.useState(true);
  const [armoursLoading, setArmoursLoading] = React.useState(true);
  const [weaponsLoading, setWeaponsLoading] = React.useState(true);
  const [loadingApproval, setLoadingApproval] = React.useState(true);
  const [context] = useContext(RarityContext);
  const [isCraftApproved, setCraftApproval] = React.useState(false);
  const [totalMaterials, setTotalMaterials] = React.useState(0);

  const onCraft = (itemId, base) => {
    console.log(itemId, base);
  };

  const onApprove = (itemId, base) => {
    console.log(itemId, base);
  };

  const fetchIsApprovedForAll = async () => {
    if (!context || !context.contract_base) return;
    try {
      setLoadingApproval(true);
      const response = await RetryContractCall(
        context.contract_base.methods.isApprovedForAll(
          context.accounts[0],
          RARITY_CRAFT.BASE.ADDRESS
        )
      );
      setCraftApproval(response);
    } catch (ex) {
      setCraftApproval(false);
      setLoadingApproval(true);
      toast.error(`Something went wrong! Try Again in a few seconds!`);
    } finally {
      setLoadingApproval(false);
    }
  };

  const approveCrafting = async () => {
    const id = toast.loading("Approving crafting...");
    try {
      await context.contract_base.methods
        .setApprovalForAll(RARITY_CRAFT.BASE.ADDRESS, true)
        .send({ from: context.accounts[0] });
      setCraftApproval(true);
      toast.update(id, {
        render: `Craft approved`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const getTotalMaterials = React.useCallback(async () => {
    if (!summonId) {
      return;
    }
    try {
      const amount = await RetryContractCall(
        context.contract_dungeons.methods.balanceOf(summonId)
      );
      setTotalMaterials(amount);
    } catch (ex) {
      toast.error(`Something went wrong! Try Again in a few seconds!`);
    }
  }, [context.contract_dungeons.methods, summonId]);

  const getItems = async ({ onLoading, key, totalItems, onMapping, onSet }) => {
    if (!summonData) {
      return;
    }
    try {
      onLoading(true);

      const allItemsPromise = [];
      for (let index = 1; index <= totalItems; index++) {
        allItemsPromise.push(
          RetryContractCall(
            context.contract_crafting[key].methods.item_by_id(index)
          )
        );
      }

      const results = await Promise.all(allItemsPromise);

      const humanizedObject = onMapping(results);

      onSet(humanizedObject);
    } catch (ex) {
      toast.error(`Something went wrong! Try Again in a few seconds!`);
    } finally {
      onLoading(false);
    }
  };

  useEffect(() => {
    fetchIsApprovedForAll();
    getItems({
      onLoading: setGoodsLoading,
      onSet: setGoods,
      totalItems: totalGoods,
      key: "goods",
      onMapping: (goods) =>
        goods.map(({ id, cost, weight, name, description }) => ({
          id,
          cost,
          weight,
          name,
          description,
          base: 1,
        })),
    });
    getItems({
      onLoading: setArmoursLoading,
      onSet: setArmours,
      totalItems: totalArmour,
      key: "armours",
      onMapping: (list) =>
        list.map(
          ({
            id,
            cost,
            proficiency,
            weight,
            armor_bonus,
            max_dex_bonus,
            penalty,
            spell_failure,
            name,
            description,
          }) => ({
            base: 2,
            id,
            name,
            cost,
            description,
            weight,
            armourStat: {
              proficiency,
              armor_bonus,
              max_dex_bonus,
              penalty,
              spell_failure,
            },
          })
        ),
    });
    getItems({
      onLoading: setWeaponsLoading,
      onSet: setWeapons,
      totalItems: totalWeapons,
      key: "weapons",
      onMapping: (list) =>
        list.map(
          ({
            id,
            cost,
            name,
            description,
            weight,
            proficiency,
            encumbrance,
            damage_type,
            damage,
            critical,
            critical_modifier,
            range_increment,
          }) => ({
            base: 3,
            id,
            name,
            cost,
            description,
            weight,
            weaponStat: {
              proficiency,
              encumbrance,
              damage_type,
              damage,
              critical,
              critical_modifier,
              range_increment,
            },
          })
        ),
    });
    getTotalMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="summon-skills-container">
        <div>
          {!isCraftApproved ? (
            <>
              <div className="craft-no-approved">
                <div className="items-title">
                  Crafting System not approved yet
                </div>
                <div className="items-desc">
                  <button
                    onClick={approveCrafting}
                    className="items-approve-button"
                  >
                    {loadingApproval ? (
                      <div className="skill-spinner">
                        <div className="spinner"></div>
                      </div>
                    ) : (
                      <>Approve Craft Contract</>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="items-title">Crafting system</div>
              <div className="items-desc">
                You have{" "}
                <span className="items-desc-good">{totalMaterials}</span>{" "}
                materials, use it to craft something!
              </div>
              <div className="items">
                <div className="goods">
                  {goodsLoading ? (
                    <>
                      <div className="skill-spinner">
                        <div className="spinner"></div>
                      </div>
                    </>
                  ) : (
                    <div className="items-goods-list">
                      <h2>Goods</h2>
                      {goods?.map((item) => (
                        <GenericItem
                          key={`base-goods-${item.id}`}
                          onCraft={onCraft}
                          onApprove={onApprove}
                          {...item}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="armours">
                  {armoursLoading ? (
                    <>
                      <div className="skill-spinner">
                        <div className="spinner"></div>
                      </div>
                    </>
                  ) : (
                    <div className="items-goods-list">
                      <h2>Armour</h2>
                      {armours?.map((item) => (
                        <GenericItem
                          key={`base-armours-${item.id}`}
                          onCraft={onCraft}
                          onApprove={onApprove}
                          {...item}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="weapons">
                  {weaponsLoading ? (
                    <>
                      <div className="skill-spinner">
                        <div className="spinner"></div>
                      </div>
                    </>
                  ) : (
                    <div className="items-goods-list">
                      <h2>Weapons</h2>
                      {weapons?.map((item) => (
                        <GenericItem
                          key={`base-weapons-${item.id}`}
                          onCraft={onCraft}
                          onApprove={onApprove}
                          {...item}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Crafting;

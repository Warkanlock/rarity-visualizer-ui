import React, { useCallback, useContext, useEffect, useState } from "react";
import { RarityContext } from "../context/RarityProvider";
import { RetryContractCall } from "../utils/fetchRetry";

const Inventory = ({ summonId }) => {
  const [context] = useContext(RarityContext);
  const [loading, setLoading] = useState(true);
  const [craftMaterial, setCraftMaterial] = useState({ symbol: "", amount: 0 });

  const getCellarItems = useCallback(async () => {
    try {
      const amount = await RetryContractCall(
        context.contract_dungeons.methods.balanceOf(summonId)
      );
      const symbol = await RetryContractCall(
        context.contract_dungeons.methods.symbol()
      );
      setCraftMaterial({ symbol, amount });
    } finally {
      setLoading(false);
    }
  }, [context.contract_dungeons.methods, summonId]);

  useEffect(() => {
    getCellarItems();
  }, [getCellarItems]);

  if (loading) return <div className="spinner"></div>;
  return (
    <div className="inventory-container">
      <div className="inventory-item">
        <img
          src={process.env.PUBLIC_URL + "/img/chest.png"}
          alt="chest-img"
          className="inventory-item-image"
        />
        <div className="inventory-item-info">
          <div className="inventory-item-symbol">{craftMaterial.symbol}</div>
          <div className="inventory-item-amount">{craftMaterial.amount}</div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;

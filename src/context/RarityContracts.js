import {
  RARITY_ABI,
  RARITY_ADDRESS,
  RARITY_ABI_ATTRIBUTES,
  RARITY_ADDRESS_ATTRIBUTES,
  RARITY_ABI_NAMES,
  RARITY_ADDRESS_NAMES,
  RARITY_ABI_DUNGEONS,
  RARITY_ADDRESS_DUNGEONS,
  RARITY_ABI_GOLD,
  RARITY_ADDRESS_GOLD,
} from "../utils/config";

export const setupContracts = async ({ provider }) => {
  const accounts = await provider.eth.getAccounts();

  const rarityContract = new provider.eth.Contract(RARITY_ABI, RARITY_ADDRESS);

  const attributesContract = new provider.eth.Contract(
    RARITY_ABI_ATTRIBUTES,
    RARITY_ADDRESS_ATTRIBUTES
  );
  const namesContract = new provider.eth.Contract(
    RARITY_ABI_NAMES,
    RARITY_ADDRESS_NAMES
  );
  const dungeonsContract = new provider.eth.Contract(
    RARITY_ABI_DUNGEONS,
    RARITY_ADDRESS_DUNGEONS
  );

  const goldContract = new provider.eth.Contract(
    RARITY_ABI_GOLD,
    RARITY_ADDRESS_GOLD
  );

  return {
    accounts: accounts,
    contract_base: rarityContract,
    contract_attributes: attributesContract,
    contract_names: namesContract,
    contract_dungeons: dungeonsContract,
    contract_gold: goldContract,
    walletAddress: accounts[0],
  };
};

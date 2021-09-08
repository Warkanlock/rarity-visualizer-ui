import {
  RARITY_ABI,
  RARITY_ADDRESS,
  RARITY_ABI_ATTRIBUTES,
  RARITY_ADDRESS_ATTRIBUTES,
  FANTOM_NETWORK,
  FANTOM_ID,
  RARITY_ABI_NAMES,
  RARITY_ADDRESS_NAMES,
} from "../utils/config";

export const setupContracts = async ({ provider, onError, onRefresh }) => {
  const webId = await provider.eth.net.getId();
  if (webId !== FANTOM_ID) {
    onError("Please, switch networks to use Fantom");
    await window.ethereum.request(FANTOM_NETWORK);
    onRefresh(true);
  } else {
    const accounts = await provider.eth.getAccounts();

    const rarityContract = new provider.eth.Contract(
      RARITY_ABI,
      RARITY_ADDRESS
    );

    const attributesContract = new provider.eth.Contract(
      RARITY_ABI_ATTRIBUTES,
      RARITY_ADDRESS_ATTRIBUTES
    );
    const namesContract = new provider.eth.Contract(
      RARITY_ABI_NAMES,
      RARITY_ADDRESS_NAMES
    );

    return {
      accounts: accounts,
      contract: rarityContract,
      contract_attributes: attributesContract,
      contract_names: namesContract,
    };
  }
};

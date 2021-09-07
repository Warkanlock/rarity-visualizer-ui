import Web3 from "web3";
import {
  WEB3_FANTOM_INSTANCE,
  RARITY_ABI,
  RARITY_ADDRESS,
  RARITY_ABI_ATTRIBUTES,
  RARITY_ADDRESS_ATTRIBUTES,
  FANTOM_NETWORK,
  FANTOM_ID,
  RARITY_ABI_NAMES,
  RARITY_ADDRESS_NAMES,
} from "../utils/config";

export const setupContracts = async ({ onError, onRefresh }) => {
  await window.ethereum.send("eth_requestAccounts");
  const web3 = new Web3(Web3.givenProvider || WEB3_FANTOM_INSTANCE);
  web3.eth.handleRevert = true;
  const webId = await web3.eth.net.getId();
  if (webId !== FANTOM_ID) {
    onError("Please, switch networks to use Fantom");
    await window.ethereum.request(FANTOM_NETWORK);
    onRefresh(true);
  } else {
    const accounts = await web3.eth.getAccounts();
    const rarityContract = new web3.eth.Contract(RARITY_ABI, RARITY_ADDRESS);
    const attributesContract = new web3.eth.Contract(
      RARITY_ABI_ATTRIBUTES,
      RARITY_ADDRESS_ATTRIBUTES
    );
    const namesContract = new web3.eth.Contract(
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

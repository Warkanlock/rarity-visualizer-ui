/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from "react";
import "./App.css";
import Web3 from "web3";
import {
  WEB3_FANTOM_INSTANCE,
  RARITY_ABI,
  RARITY_ADDRESS,
  RARITY_ABI_ATTRIBUTES,
  RARITY_ADDRESS_ATTRIBUTES,
  FANTOM_NETWORK,
  FANTOM_ID,
} from "./utils/config";
import { RarityContext } from "./context/RarityProvider";
import { Home } from "./components/Home";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";

function App() {
  const [error, setError] = useState({ isError: false, stack: null });
  const [, setContext] = useContext(RarityContext);
  const [refresh, refreshView] = useState(false);

  React.useEffect(() => {
    loadRarityData();
  }, [refresh]);

  const loadRarityData = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.send("eth_requestAccounts");
        const web3 = new Web3(Web3.givenProvider || WEB3_FANTOM_INSTANCE);
        web3.eth.handleRevert = true;
        const webId = await web3.eth.net.getId();
        if (webId !== FANTOM_ID) {
          NotificationManager.error("Please, switch networks to use Fantom");
          await window.ethereum.request(FANTOM_NETWORK);
          refreshView(true);
        } else {
          const accounts = await web3.eth.getAccounts();
          const rarityContract = new web3.eth.Contract(
            RARITY_ABI,
            RARITY_ADDRESS
          );
          const attributesContract = new web3.eth.Contract(
            RARITY_ABI_ATTRIBUTES,
            RARITY_ADDRESS_ATTRIBUTES
          );

          setContext({
            accounts: accounts,
            contract: rarityContract,
            contract_attributes: attributesContract,
          });
        }
      } else {
        NotificationManager.error(
          "Please, try to use Metamask or some client to connect your wallet"
        );
      }
    } catch (ex) {
      setError({ isError: true, stack: ex });
    }
  };

  return (
    <div className="App">
      <header className="App-header">Rarity Visualizer - WIP 0.1</header>
      {error.isError && (
        <div className="App-error">There was an error with your operations</div>
      )}
      <div className="container">
        <Home />
      </div>
      <NotificationContainer />
      <footer>
        Made with 💙 by <a href="https://twitter.com/@txxnano">@txxnano</a>{" "}
        (tips <code>0xC0a210490f9e0968D24372459780D694F18694D4</code>)
      </footer>
    </div>
  );
}

export default App;

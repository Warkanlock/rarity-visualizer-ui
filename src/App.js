/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from "react";
import "./App.css";
import Web3 from "web3";
import {
  WEB3_FANTOM_INSTANCE,
  RARITY_ABI,
  RARITY_ADDRESS,
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

  React.useEffect(() => {
    loadRarityData();
  }, []);

  const loadRarityData = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.send("eth_requestAccounts");
        const web3 = new Web3(Web3.givenProvider || WEB3_FANTOM_INSTANCE);
        web3.eth.handleRevert = true;
        const accounts = await web3.eth.getAccounts();
        const rarityContract = new web3.eth.Contract(
          RARITY_ABI,
          RARITY_ADDRESS
        );
        setContext({
          accounts: accounts,
          contract: rarityContract,
        });
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
        <>
          There was an error with your operations {JSON.stringify(error.stack)}
        </>
      )}
      <div>
        <Home />
      </div>
      <NotificationContainer />
      <footer>
        Made with 💙 by <a href="https://twitter.com/@txxnano">@txxnano</a>{" "}
        (tips <code>0x47cf12443248277E14E41886bA6e4885845c8345</code>)
      </footer>
    </div>
  );
}

export default App;

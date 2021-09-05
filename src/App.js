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
import { NotificationContainer } from "react-notifications";

function App() {
  const [error, setError] = useState({ isError: false, stack: null });
  const [context, setContext] = useContext(RarityContext);

  React.useEffect(() => {
    loadRarityData();
  }, []);

  const loadRarityData = async () => {
    try {
      const web3 = new Web3(Web3.givenProvider || WEB3_FANTOM_INSTANCE);
      web3.eth.handleRevert = true;
      const accounts = await web3.eth.getAccounts();
      const rarityContract = new web3.eth.Contract(RARITY_ABI, RARITY_ADDRESS);
      setContext({
        accounts: accounts,
        contract: rarityContract,
      });
    } catch (ex) {
      setError({ isError: true, stack: ex });
    }
  };

  console.log(context);

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
        Made with 💙 by <a href="https://twitter.com/@txxnano">@txxnano</a>
      </footer>
    </div>
  );
}

export default App;

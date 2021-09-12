/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from "react";
import "./App.css";
import { RarityContext } from "./context/RarityProvider";
import { Home } from "./components/Home";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { setupContracts } from "./context/RarityContracts";
import { useAuth } from "./hooks/useAuth";
import { FANTOM_ID, FANTOM_NETWORK } from "./utils/config";

function App() {
  const [error, setError] = useState({ isError: false, stack: null });
  const [context, setContext] = useContext(RarityContext);
  const [refresh, refreshView] = useState(false);
  const [provider, login, logout, update] = useAuth();

  React.useEffect(() => {
    loadRarityData();
  }, [refresh, update]);

  const loadRarityData = async () => {
    try {
      if (window.ethereum && provider) {
        const webId = await provider.eth.net.getId();
        if (webId !== FANTOM_ID) {
          NotificationManager.error("Please, use Fantom network");
          await window.ethereum.request(FANTOM_NETWORK);
          refreshView(!refresh);
        } else {
          const contracts = await setupContracts({
            provider,
          });
          if (contracts) {
            setContext(contracts);
          } else {
            NotificationManager.error(
              "Something bad happen. Please refresh the page."
            );
          }
        }
      } else {
        if (update) {
          NotificationManager.info("Wallet Disconnected");
        }
      }
    } catch (ex) {
      setError({ isError: true, stack: ex });
    }
  };

  const getWalletAddressSummary = () => {
    if (!context.accounts[0]) return "";
    return `${context.accounts[0].slice(0, 6)}...${context.accounts[0].slice(
      context.accounts[0].length - 4
    )}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        Rarity Visualizer - Beta
        <div className="wallet">
          <div className="wallet-address">
            <p>{getWalletAddressSummary(context.accounts[0])}</p>
          </div>
          <button className="wallet-button" onClick={provider ? logout : login}>
            {provider ? "Disconnect" : "Connect"}
          </button>
        </div>
      </header>
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

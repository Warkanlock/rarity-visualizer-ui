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

function App() {
  const [error, setError] = useState({ isError: false, stack: null });
  const [, setContext] = useContext(RarityContext);
  const [refresh, refreshView] = useState(false);
  const [provider, login, logout, update] = useAuth();

  React.useEffect(() => {
    loadRarityData();
  }, [refresh, update]);

  const loadRarityData = async () => {
    try {
      if (window.ethereum && provider) {
        const contracts = await setupContracts({
          provider,
          onError: () =>
            NotificationManager.error("Please, use Fantom network"),
          onRefresh: () => refreshView(!refresh),
        });
        setContext(contracts);
      } else {
        if (update) {
          NotificationManager.info("Wallet Disconnected");
        }
      }
    } catch (ex) {
      setError({ isError: true, stack: ex });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        Rarity Visualizer - Beta
        <button className="summon-new" onClick={provider ? logout : login}>
          {provider ? "Disconnect Wallet" : "Connect Wallet"}
        </button>
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

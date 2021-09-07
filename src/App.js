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
        const contracts = await setupContracts({
          onError: () =>
            NotificationManager.error("Please, use Fantom network"),
          onRefresh: () => refreshView(!refresh),
        });
        setContext(contracts);
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
      <header className="App-header">Rarity Visualizer - Beta</header>
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

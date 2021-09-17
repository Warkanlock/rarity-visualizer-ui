/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from "react";
import "./App.css";
import { RarityContext } from "./context/RarityProvider";
import { Home } from "./components/Home";
import { setupContracts } from "./context/RarityContracts";
import { useAuth } from "./hooks/useAuth";
import { FANTOM_ID, FANTOM_NETWORK } from "./utils/config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
          toast.error("Please, use Fantom network");

          await window.ethereum.request(FANTOM_NETWORK);
          refreshView(!refresh);
        } else {
          const contracts = await setupContracts({
            provider,
          });
          if (contracts) {
            setContext(contracts);
          } else {
            toast.error("Something bad happen. Please refresh the page.");
          }
        }
      } else {
        if (update) {
          toast.info("Wallet Disconnected");
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
      <img
        className="bg"
        src={`${process.env.PUBLIC_URL}/img/background.png`}
        alt="background"
      />
      <header className="App-header">
        Rarity Visualizer - Beta
        <div className="wallet">
          <div className="donate-button">
            <a
              href="https://ftmscan.com/address/0x8d8FC849Ba50C0BD2bbE59402abd994325d322e3"
              target="_blank"
              rel="noreferrer"
            >
              <p>DONATE</p>
            </a>
          </div>
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnHover
        theme={"dark"}
      />
      <footer>
        Made with 💙 by{" "}
        <a
          className="made-with-text"
          href="https://twitter.com/@txxnano"
          target="_blank"
          rel="noreferrer"
        >
          @txxnano
        </a>{" "}
        and{" "}
        <a
          className="made-with-text"
          href="https://twitter.com/@AndreCronjeTech"
          target="_blank"
          rel="noreferrer"
        >
          @AndreCronjeTech
        </a>
      </footer>
    </div>
  );
}

export default App;

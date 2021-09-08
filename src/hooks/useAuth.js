import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import React, { useEffect, useMemo, useState } from "react";

const loggingEnabled = false;

export function useAuth() {
  const [provider, setProvider] = useState();
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [update, makeUpdate] = useState(false);

  const web3Modal = useMemo(() => {
    return new Web3Modal({
      network: "fantom",
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
        },
      },
    });
  }, []);

  useEffect(() => {
    window.addEventListener("load", () => {
      // detect Metamask account change
      window.ethereum.on("accountsChanged", (accounts) => {
        if (loggingEnabled) console.log("Account changed:", accounts);
        window.location.reload();
      });
    });

    return () => {
      window.removeEventListener("load", () =>
        console.log("Removing load listener")
      );
    };
  }, [provider]);

  // Open wallet selection modal and set provider.
  const login = React.useCallback(async () => {
    const connection = await web3Modal.connect();
    const web3 = new Web3(connection);
    setProvider(web3);
    makeUpdate(!update);
  }, [update, web3Modal]);

  async function logout() {
    web3Modal.clearCachedProvider();
    window.location.reload();
  }

  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useEffect(() => {
    if (!autoLoaded && web3Modal.cachedProvider) {
      login();
      setAutoLoaded(true);
    }
  }, [autoLoaded, login, web3Modal.cachedProvider]);

  return [provider, login, logout, update];
}

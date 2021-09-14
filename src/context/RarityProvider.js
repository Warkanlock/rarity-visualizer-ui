import React from "react";

const RarityContext = React.createContext([{}, () => {}]);

function RarityProvider({ children }) {
  const [context, setContext] = React.useState({
    accounts: [],
    contract_base: null,
    contract_attributes: null,
    contract_names: null,
    contract_dungeons: null,
    contract_gold: null,
    walletAddress: "",
  });

  return (
    <RarityContext.Provider value={[context, setContext]}>
      {children}
    </RarityContext.Provider>
  );
}

export { RarityProvider, RarityContext };

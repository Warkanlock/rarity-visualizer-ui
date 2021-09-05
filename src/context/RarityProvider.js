import React from "react";

const RarityContext = React.createContext([{}, () => {}]);

function RarityProvider({ children }) {
  const [context, setContext] = React.useState({
    accounts: [],
    contract: null,
  });

  return (
    <RarityContext.Provider value={[context, setContext]}>
      {children}
    </RarityContext.Provider>
  );
}

export { RarityProvider, RarityContext };

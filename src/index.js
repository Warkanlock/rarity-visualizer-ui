import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { RarityProvider } from "./context/RarityProvider";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <RarityProvider>
      <App />
    </RarityProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

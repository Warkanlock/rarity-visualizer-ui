import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { RarityProvider } from "./context/RarityProvider";
import App from "./App";

ReactDOM.render(
  <RarityProvider>
    <App />
  </RarityProvider>,
  document.getElementById("root")
);

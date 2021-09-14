import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { RarityProvider } from "./context/RarityProvider";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.render(
  <RarityProvider>
    <Router>
      <App />
    </Router>
  </RarityProvider>,
  document.getElementById("root")
);

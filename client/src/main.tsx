import React from "react";
import ReactDOM from "react-dom/client";

import { Provider } from "react-redux";

import { HashRouter } from "react-router-dom";

import App from "./App";

import "./index.css";

import { store } from "./app/store";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PwaInstallProvider } from "./components/PwaInstall";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PwaInstallProvider><App /></PwaInstallProvider>
  </React.StrictMode>,
);


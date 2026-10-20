import React from "react";
import ReactDOM from "react-dom/client";
import Grade1CApp from "./Grade1CApp";
import { PwaInstallProvider } from "../../components/PwaInstall";
import "../../index.css";
import "./grade1c.css";
import "./ice-path.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><PwaInstallProvider><Grade1CApp /></PwaInstallProvider></React.StrictMode>,
);

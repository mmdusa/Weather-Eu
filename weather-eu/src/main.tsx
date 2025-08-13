import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // <-- important: ./App
import "./index.css";
import "./index.css"; // not a CSS module, just the plain CSS

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

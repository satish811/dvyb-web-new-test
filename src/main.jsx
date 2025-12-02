import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Import all CSS files
import "./styles/index.css";

// import "./styles/base/variables.css";
// import "./styles/base/reset.css";
// import "./styles/base/typography.css";
// import "./styles/components/buttons.css";
// import "./styles/components/cards.css";
// import "./styles/components/sections.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

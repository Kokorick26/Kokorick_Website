
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupMockAPI } from "./lib/api";

// Setup mock API for development
// setupMockAPI();

createRoot(document.getElementById("root")!).render(<App />);
  
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GlobalProvider } from "@/context/GlobalContext.tsx";
import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <GlobalProvider>
    <Toaster />
    <StrictMode>
      <App />
    </StrictMode>
  </GlobalProvider>
);

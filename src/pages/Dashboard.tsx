// src/pages/Dashboard.tsx
import { useGlobal } from "@/context/GlobalContext";
import Analytics from "./Analytics";
import Invoices from "./Invoice";
import Manage from "./Manage";

export default function Dashboard() {
  const { page } = useGlobal();
  const role = localStorage.getItem("role");
  return (
    <div className="p-2">
      {page === "analytics" && role == "admin" && <Analytics />}
      {page === "invoices" && <Invoices />}
      {page === "manage" && role == "admin" && <Manage />}
    </div>
  );
}

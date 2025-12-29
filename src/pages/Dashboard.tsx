// src/pages/Dashboard.tsx
import { useGlobal } from "@/context/GlobalContext";
import Analytics from "./Analytics";
import Manage from "./Manage";
import Vendors from "./Vendor";

export default function Dashboard() {
  const { page } = useGlobal();
  const role = localStorage.getItem("role");
  return (
    <div className="p-4 ">
      {page === "analytics" && role === "admin" && <Analytics />}
      {page === "vendor" && <Vendors />}
      {page === "manage" && role === "admin" && <Manage />}
    </div>
  );
}

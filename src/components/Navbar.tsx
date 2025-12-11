// src/components/Navbar.tsx
import MobileSidebar from "./MobileSidebar";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <div className="flex items-center justify-between px-4 h-16 border-b bg-white">
      <MobileSidebar />

      <h2 className="font-semibold text-lg hidden md:block">Dashboard</h2>

      <a onClick={handleLogout}>
        <LogOut />
      </a>
    </div>
  );
}

// src/components/Navbar.tsx
import MobileSidebar from "./MobileSidebar";
import { LogOut, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role"); // "admin" or "user"

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isAdmin = role === "admin";

  return (
    <div className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4">
      <MobileSidebar />

      <div className="flex items-center gap-4">
        {/* Role Avatar */}
        <div className="flex items-center gap-2">
          <Avatar
            className={
              isAdmin
                ? "bg-indigo-900 text-white ring-2 ring-indigo-700"
                : "bg-emerald-900 text-white ring-2 ring-emerald-700"
            }
          >
            <AvatarFallback>
              {isAdmin ? <Shield size={16} /> : <User size={16} />}
            </AvatarFallback>
          </Avatar>

          <span className="text-sm font-semibold tracking-wide">
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-full p-2 hover:bg-muted transition"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

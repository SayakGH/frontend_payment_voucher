import { Navigate } from "react-router-dom";
import { useEffect, useState, type JSX } from "react";
import { validate } from "@/api/auth";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const token = localStorage.getItem("authToken");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      return;
    }

    validate()
      .then(() => setIsValid(true))
      .catch(() => {
        localStorage.clear();
        setIsValid(false);
      });
  }, [token]);

  if (isValid === null) {
    return children;
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

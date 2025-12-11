import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginUser } from "@/api/auth";
import type { IAuthResponse } from "@/types/authType";

import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) navigate("/dashboard");
  }, [navigate]);

  // Form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend API
      const data: IAuthResponse = await loginUser(email, password);

      // Store token + role
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("role", data.user.role);

      // Success toast
      toast.custom((t: any) => (
        <div
          className={`${
            t.visible
              ? "animate-in fade-in slide-in-from-top-5"
              : "animate-out fade-out"
          } w-full max-w-sm bg-green-50 border border-green-300 text-green-800 rounded-xl shadow-md p-4 flex gap-3`}
        >
          <CheckCircle className="w-6 h-6 text-green-600 mt-1" />

          <div className="flex-1">
            <p className="font-semibold text-green-700">Login Successful 🎉</p>
            <p className="text-sm text-green-600">Welcome back!</p>
          </div>
        </div>
      ));

      // Redirect user
      navigate("/dashboard");
    } catch (err: any) {
      // Extract backend message
      const errorMessage =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";

      // Error toast
      toast.custom((t: any) => (
        <div
          className={`${
            t.visible
              ? "animate-in fade-in slide-in-from-top-5"
              : "animate-out fade-out"
          } w-full max-w-sm bg-red-50 border border-red-300 text-red-800 rounded-xl shadow-md p-4 flex gap-3`}
        >
          <XCircle className="w-6 h-6 text-red-600 mt-1" />

          <div className="flex-1">
            <p className="font-semibold text-red-700">Login Failed</p>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        </div>
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Login Button */}
            <Button className="w-full mt-2" disabled={loading} type="submit">
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-xs text-gray-600">
              Forgot password?{" "}
              <a href="#" className="text-blue-600">
                Reset
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

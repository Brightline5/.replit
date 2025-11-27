import { useState } from "react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        navigate("/dashboard");
      } else {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Invalid password");
      }
    } catch (err) {
      console.error(err);
      setError("Server error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4 text-center">ShiftSage Login</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Manager Password</label>
            <input
              type="password"
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              data-testid="input-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition disabled:bg-blue-300"
            data-testid="button-login"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

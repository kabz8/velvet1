import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const { setAuth } = useAuth();
  const login = useAdminLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login.mutateAsync({ email, password });
      setAuth(res.user as any, res.token);
      navigate("/admin");
    } catch {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0B0B0F" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold mb-2" style={{ color: "#E7D9C8" }}>Velvet Admin</h1>
          <p className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Sign in to your dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 rounded-2xl space-y-4" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
          {error && <div className="p-3 rounded-lg font-sans text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>{error}</div>}
          <div>
            <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Email</label>
            <input type="email" required className="w-full px-4 py-3 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" }} value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@velvetke.com" />
          </div>
          <div>
            <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Password</label>
            <input type="password" required className="w-full px-4 py-3 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" }} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={login.isPending} className="w-full py-4 rounded-xl font-sans font-semibold text-sm tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
            {login.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

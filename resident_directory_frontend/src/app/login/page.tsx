"use client";

/**
 * Login page – retro-themed auth form for username/password login.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AlertMessage from "@/components/ui/AlertMessage";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter username and password.");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-retro-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Terminal header */}
        <div className="border-4 border-retro-green bg-retro-dark p-6 shadow-[8px_8px_0_#00ff41]">
          <div className="font-mono text-retro-green text-center mb-6">
            <div className="text-xs uppercase tracking-widest text-retro-muted mb-2">
              ████ SYSTEM ACCESS ████
            </div>
            <div className="text-2xl font-bold">RESIDENT DIR</div>
            <div className="text-sm text-retro-yellow">v1.0.0 :: SECURE LOGIN</div>
            <div className="mt-3 text-xs text-retro-muted">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i}>● </span>
              ))}
              TERMINAL READY
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <AlertMessage
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-widest text-retro-green mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  placeholder="Enter username..."
                  className="w-full font-mono border-2 border-retro-green bg-retro-dark px-3 py-2 text-sm text-retro-green placeholder:text-retro-muted focus:outline-none focus:border-retro-yellow transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-widest text-retro-green mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Enter password..."
                  className="w-full font-mono border-2 border-retro-green bg-retro-dark px-3 py-2 text-sm text-retro-green placeholder:text-retro-muted focus:outline-none focus:border-retro-yellow transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-mono font-bold uppercase tracking-widest text-sm bg-retro-green text-retro-dark border-2 border-retro-green py-3 shadow-[3px_3px_0_#00ff41] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-retro-dark border-t-transparent" />
              )}
              ▶ LOGIN
            </button>
          </form>

          <div className="mt-4 text-center font-mono text-xs text-retro-muted">
            No account?{" "}
            <Link href="/register" className="text-retro-yellow hover:underline">
              Register here
            </Link>
          </div>
        </div>
        <div className="mt-2 font-mono text-xs text-retro-muted text-center">
          Default: admin / secret
        </div>
      </div>
    </div>
  );
}

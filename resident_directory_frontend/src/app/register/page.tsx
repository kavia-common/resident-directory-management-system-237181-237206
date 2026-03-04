"use client";

/**
 * Register page – retro-themed user registration form.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import AlertMessage from "@/components/ui/AlertMessage";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: "resident",
      });
      router.replace("/login?registered=1");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full font-mono border-2 border-retro-green bg-retro-dark px-3 py-2 text-sm text-retro-green placeholder:text-retro-muted focus:outline-none focus:border-retro-yellow transition-colors";
  const labelClass =
    "block font-mono text-xs font-bold uppercase tracking-widest text-retro-green mb-1";

  return (
    <div className="min-h-screen bg-retro-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="border-4 border-retro-green bg-retro-dark p-6 shadow-[8px_8px_0_#00ff41]">
          <div className="font-mono text-retro-green text-center mb-6">
            <div className="text-xs uppercase tracking-widest text-retro-muted mb-2">
              ████ NEW ACCOUNT ████
            </div>
            <div className="text-2xl font-bold">REGISTER</div>
            <div className="text-sm text-retro-yellow">USER REGISTRATION</div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <AlertMessage
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            <div>
              <label className={labelClass}>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                type="text"
                autoComplete="username"
                placeholder="Choose username..."
                className={fieldClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                className={fieldClass}
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                autoComplete="new-password"
                placeholder="Min 6 characters..."
                className={fieldClass}
              />
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password..."
                className={fieldClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-mono font-bold uppercase tracking-widest text-sm bg-retro-green text-retro-dark border-2 border-retro-green py-3 shadow-[3px_3px_0_#00ff41] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-retro-dark border-t-transparent" />
              )}
              ▶ CREATE ACCOUNT
            </button>
          </form>

          <div className="mt-4 text-center font-mono text-xs text-retro-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-retro-yellow hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

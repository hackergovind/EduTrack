"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Lock, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setDone(true);
        toast.success("Password reset! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.error || "Failed to reset password.");
        toast.error(data.error || "Failed to reset password.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-500/20">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Reset Password</h1>
          <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
            Enter your new password below.
          </p>
        </div>

        <div className="glass-card p-8">
          {/* Invalid link */}
          {error && !done && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <XCircle size={40} className="text-red-500" />
              <p className="text-red-500 font-medium">{error}</p>
              <button
                onClick={() => router.push("/login")}
                className="btn-primary mt-2"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Success state */}
          {done && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle size={40} className="text-emerald-500" />
              <p className="font-semibold text-lg">Password reset successfully!</p>
              <p style={{ color: "var(--text-secondary)" }} className="text-sm">
                Redirecting you to the login page…
              </p>
            </div>
          )}

          {/* Reset form */}
          {!error && !done && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="At least 8 characters"
                  />
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    size={18}
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Repeat your new password"
                  />
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    size={18}
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Set New Password
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          Remember your password?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

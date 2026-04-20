"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  X,
  Send,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

// ─── Forgot-password modal ────────────────────────────────────────────────────

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        // In a real app an email would be sent. For local dev we show the link.
        if (data.resetUrl) setResetUrl(data.resetUrl);
      } else {
        toast.error(data.error || "Something went wrong.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-card w-full max-w-sm p-8 animate-scale-in relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Close"
        >
          <X size={18} style={{ color: "var(--text-secondary)" }} />
        </button>

        {!sent ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                Forgot your password?
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    size={18}
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <CheckCircle size={44} className="text-emerald-500" />
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                Check your email
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                A password reset link has been sent to <strong>{email}</strong>.
              </p>
            </div>

            {/* Dev-mode reset link (in production this would only be in the email) */}
            {resetUrl && (
              <div
                className="w-full rounded-xl p-3 text-left"
                style={{ background: "var(--color-surface-100)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  🔧 Dev mode — reset link:
                </p>
                <a
                  href={resetUrl}
                  className="text-xs text-blue-500 break-all hover:underline"
                >
                  {resetUrl}
                </a>
              </div>
            )}

            <button onClick={onClose} className="btn-secondary w-full">
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Login / Sign-up page ────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const switchMode = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setFormData({ name: "", email: "", password: "" }); // reset form on toggle
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // ── Sign in ──────────────────────────────────────────────
        const res = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (res?.error) {
          toast.error("Invalid email or password. Please try again.");
        } else if (res?.ok) {
          toast.success("Welcome back!");
          router.push("/");
          router.refresh();
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        // ── Sign up ──────────────────────────────────────────────
        if (formData.password.length < 8) {
          toast.error("Password must be at least 8 characters.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to create account.");
          return;
        }

        toast.success("Account created! Signing you in…");

        // Auto sign-in after registration
        const signInRes = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (signInRes?.ok) {
          router.push("/");
          router.refresh();
        } else {
          // Account was created but auto-login failed — redirect to login
          toast("Account created! Please sign in.", { icon: "ℹ️" });
          switchMode(true);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Forgot password modal ── */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-500/20">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
              Welcome to EduTrack
            </h1>
            <p className="text-center" style={{ color: "var(--text-secondary)" }}>
              {isLogin
                ? "Sign in to continue your learning journey"
                : "Create an account to start tracking"}
            </p>
          </div>

          {/* Card */}
          <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>

            {/* Login / Sign-up tabs */}
            <div
              className="flex rounded-xl p-1 mb-6"
              style={{ background: "var(--color-surface-100)", border: "1px solid var(--border)" }}
            >
              <button
                type="button"
                onClick={() => switchMode(true)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={
                  isLogin
                    ? { background: "white", color: "var(--color-primary-600)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode(false)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={
                  !isLogin
                    ? { background: "white", color: "var(--color-primary-600)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name — sign-up only */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="signup-name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field pl-10"
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      size={18}
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Email
                </label>
                <div className="relative">
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    size={18}
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={isLogin ? undefined : 8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-10 pr-10"
                    placeholder={isLogin ? "••••••••" : "At least 8 characters"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    size={18}
                    style={{ color: "var(--text-muted)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword
                      ? <EyeOff size={16} style={{ color: "var(--text-muted)" }} />
                      : <Eye size={16} style={{ color: "var(--text-muted)" }} />
                    }
                  </button>
                </div>
                {!isLogin && formData.password && formData.password.length < 8 && (
                  <p className="text-xs text-amber-500">Must be at least 8 characters.</p>
                )}
              </div>

              {/* Submit */}
              <button
                id="auth-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Switch mode (below card) */}
          <p
            className="text-center text-sm mt-6 animate-fade-in"
            style={{ animationDelay: "0.2s", color: "var(--text-secondary)" }}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => switchMode(!isLogin)}
              className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
            >
              {isLogin ? "Sign up for free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleKeyLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/validate-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, email }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === "subscription_required") {
        window.location.href = "/subscribe";
        return;
      }
      setError(data.error || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/app/dashboard` },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AE</span>
            </div>
            <span className="text-white font-semibold text-lg">Aussie Estimator</span>
          </div>
          <p className="text-zinc-500 text-sm">
            {adminMode ? "Admin sign in" : "Enter your access key to continue"}
          </p>
        </div>

        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">Check your email</h3>
              <p className="text-zinc-400 text-sm">Magic link sent to <span className="text-white">{email}</span>.</p>
            </div>
          ) : adminMode ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="input-base w-full"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-md px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleKeyLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Your email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com.au"
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Access key</label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="AE3KM27P"
                  maxLength={8}
                  className="input-base w-full font-mono tracking-widest uppercase"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-md px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6 space-y-2">
          {!adminMode && !sent && (
            <p className="text-zinc-500 text-sm">
              Don&apos;t have a key?{" "}
              <Link href="/request-access" className="text-blue-400 hover:text-blue-300">
                Request access
              </Link>
            </p>
          )}
          <button
            onClick={() => { setAdminMode(!adminMode); setError(""); setSent(false); setKey(""); setEmail(""); }}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
          >
            {adminMode ? "← Back to key login" : "Admin sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

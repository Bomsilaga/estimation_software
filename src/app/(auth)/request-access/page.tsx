"use client";

import { useState } from "react";
import Link from "next/link";

const ROLES = ["Quantity Surveyor", "Builder / Contractor", "Project Manager", "Developer", "Architect", "Other"];
const AU_STATES = ["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export default function RequestAccessPage() {
  const [form, setForm] = useState({
    name: "", email: "", company: "", role: "", state: "", phone: "", message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/request-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to login
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AE</span>
            </div>
            <span className="text-white font-semibold text-lg">Aussie Estimator</span>
          </div>
          <h1 className="text-xl font-semibold text-white mb-1">Request access</h1>
          <p className="text-zinc-400 text-sm">
            Aussie Estimator is invite-only. Submit your details and we&apos;ll be in touch within 1 business day.
          </p>
        </div>

        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">Request submitted</h3>
              <p className="text-zinc-400 text-sm">
                Thanks {form.name.split(" ")[0]}! We&apos;ll review your request and send your access
                credentials to <span className="text-white">{form.email}</span>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Full name *</label>
                  <input required value={form.name} onChange={set("name")} placeholder="Jane Smith" className="input-base w-full" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Email *</label>
                  <input required type="email" value={form.email} onChange={set("email")} placeholder="jane@acme.com.au" className="input-base w-full" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Company / Firm *</label>
                <input required value={form.company} onChange={set("company")} placeholder="Acme Constructions" className="input-base w-full" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Role *</label>
                  <select required value={form.role} onChange={set("role")} className="input-base w-full">
                    <option value="">Select…</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">State *</label>
                  <select required value={form.state} onChange={set("state")} className="input-base w-full">
                    <option value="">Select…</option>
                    {AU_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Phone (optional)</label>
                <input value={form.phone} onChange={set("phone")} placeholder="0400 000 000" className="input-base w-full" />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">What will you use it for? (optional)</label>
                <textarea
                  value={form.message}
                  onChange={set("message")}
                  rows={3}
                  placeholder="e.g. Residential estimates for new builds in Melbourne…"
                  className="input-base w-full resize-none"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? "Submitting…" : "Request access"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

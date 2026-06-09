"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AccessRequest } from "@/types";

type AccessKey = {
  id: string;
  key: string;
  uses_remaining: number;
  total_uses: number;
  assigned_email: string | null;
  is_active: boolean;
  created_at: string;
};

type Tab = "requests" | "keys";

export default function AdminPanel({
  requests: initial,
  keys: initialKeys,
}: {
  requests: AccessRequest[];
  keys: AccessKey[];
}) {
  const [requests, setRequests] = useState(initial);
  const [keys] = useState(initialKeys);
  const [tab, setTab] = useState<Tab>("requests");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [copied, setCopied] = useState<string | null>(null);
  const supabase = createClient();

  async function reject(id: string) {
    await supabase.from("access_requests").update({ status: "rejected" }).eq("id", id);
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" as const } : r));
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const availableKeys = keys.filter((k) => k.uses_remaining > 0 && k.is_active);
  const exhaustedKeys = keys.filter((k) => k.uses_remaining === 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">Admin</h1>
        <p className="text-zinc-500 text-sm">
          {counts.pending} pending requests · {availableKeys.length} keys available
        </p>
      </div>

      {/* Main tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#2a2a2a]">
        {(["requests", "keys"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-500 hover:text-white"
            }`}
          >
            {t === "requests" ? (
              <span className="flex items-center gap-2">
                Access Requests
                {counts.pending > 0 && (
                  <span className="bg-amber-900/40 text-amber-400 text-xs px-1.5 py-0.5 rounded-full">
                    {counts.pending}
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Access Keys
                <span className="bg-[#222] text-zinc-500 text-xs px-1.5 py-0.5 rounded-full">
                  {availableKeys.length}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "requests" && (
        <>
          <div className="flex items-center gap-1 mb-6">
            {(["pending", "approved", "rejected", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors flex items-center gap-1.5 ${
                  filter === f ? "bg-[#1a1a1a] text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                {f}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  f === "pending" && counts.pending > 0 ? "bg-amber-900/40 text-amber-400" : "bg-[#222] text-zinc-600"
                }`}>
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>State</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td className="text-white">{r.name}</td>
                      <td className="text-zinc-300 font-mono text-xs">{r.email}</td>
                      <td className="text-zinc-400">{r.company}</td>
                      <td className="text-zinc-400">{r.role}</td>
                      <td className="text-zinc-500">{r.state}</td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          r.status === "approved" ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/40" :
                          r.status === "rejected" ? "bg-red-900/20 text-red-400 border-red-800/30" :
                          "bg-amber-900/20 text-amber-400 border-amber-800/30"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="text-zinc-600 text-xs">
                        {new Date(r.created_at).toLocaleDateString("en-AU")}
                      </td>
                      <td>
                        {r.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">Send a key →</span>
                            <button
                              onClick={() => reject(r.id)}
                              className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#111] border border-dashed border-[#2a2a2a] rounded-xl p-12 text-center">
              <p className="text-zinc-500 text-sm">No {filter === "all" ? "" : filter} requests.</p>
            </div>
          )}
        </>
      )}

      {tab === "keys" && (
        <div className="space-y-4">
          <p className="text-zinc-500 text-sm">
            Copy a key and send it to a user. Each key allows 3 sign-ins before requiring a subscription.
          </p>

          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Uses remaining</th>
                  <th>Assigned to</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td className="font-mono text-sm text-white tracking-widest">{k.key}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i <= k.uses_remaining ? "bg-blue-500" : "bg-[#2a2a2a]"
                            }`}
                          />
                        ))}
                        <span className="text-zinc-500 text-xs ml-1">{k.uses_remaining} / 3</span>
                      </div>
                    </td>
                    <td className="text-zinc-400 text-xs font-mono">
                      {k.assigned_email || <span className="text-zinc-600">unassigned</span>}
                    </td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        !k.is_active
                          ? "bg-zinc-800 text-zinc-600 border-zinc-700"
                          : k.uses_remaining === 0
                          ? "bg-red-900/20 text-red-400 border-red-800/30"
                          : k.total_uses > 0
                          ? "bg-amber-900/20 text-amber-400 border-amber-800/30"
                          : "bg-emerald-900/20 text-emerald-400 border-emerald-800/30"
                      }`}>
                        {!k.is_active ? "disabled" : k.uses_remaining === 0 ? "exhausted" : k.total_uses > 0 ? "in use" : "available"}
                      </span>
                    </td>
                    <td>
                      {k.is_active && k.uses_remaining > 0 && (
                        <button
                          onClick={() => copyKey(k.key)}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {copied === k.key ? "Copied!" : "Copy"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {availableKeys.filter(k => k.total_uses === 0).length} unused
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> {availableKeys.filter(k => k.total_uses > 0).length} in use
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {exhaustedKeys.length} exhausted
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

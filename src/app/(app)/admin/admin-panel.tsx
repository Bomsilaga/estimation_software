"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AccessRequest } from "@/types";

export default function AdminPanel({ requests: initial }: { requests: AccessRequest[] }) {
  const [requests, setRequests] = useState(initial);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const supabase = createClient();

  async function approve(req: AccessRequest) {
    // Send Supabase invite email
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: req.email, name: req.name, id: req.id }),
    });
    if (res.ok) {
      setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: "approved" as const } : r));
    }
  }

  async function reject(id: string) {
    await supabase.from("access_requests").update({ status: "rejected" }).eq("id", id);
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" as const } : r));
  }

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);
  const counts = { all: requests.length, pending: requests.filter((r) => r.status === "pending").length, approved: requests.filter((r) => r.status === "approved").length, rejected: requests.filter((r) => r.status === "rejected").length };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">Access Requests</h1>
        <p className="text-zinc-500 text-sm">{counts.pending} pending approvals</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors flex items-center gap-1.5 ${
              filter === tab ? "bg-[#1a1a1a] text-white" : "text-zinc-500 hover:text-white"
            }`}
          >
            {tab}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              tab === "pending" && counts.pending > 0 ? "bg-amber-900/40 text-amber-400" : "bg-[#222] text-zinc-600"
            }`}>
              {counts[tab]}
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
                        <button
                          onClick={() => approve(r)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Approve & invite
                        </button>
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
    </div>
  );
}

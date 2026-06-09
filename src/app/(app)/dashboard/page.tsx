export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: estimates } = await supabase
    .from("estimates")
    .select("id, name, status, total_cost, gfa, ncc_class, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: totalEstimates } = await supabase
    .from("estimates")
    .select("*", { count: "exact", head: true });

  const totalValue = estimates?.reduce((s, e) => s + (e.total_cost || 0), 0) ?? 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Welcome back, {user?.email?.split("@")[0]}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Estimates", value: totalEstimates ?? 0, unit: "" },
          { label: "Portfolio Value", value: `$${(totalValue / 1_000_000).toFixed(1)}M`, unit: "ex GST" },
          { label: "Rate Database", value: "100+", unit: "Melbourne rates" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
            <p className="text-zinc-500 text-xs mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              {stat.unit && <p className="text-zinc-600 text-xs">{stat.unit}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link
          href="/analyser"
          className="bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600/15 rounded-xl p-5 transition-colors group"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm mb-1">New Plan Analysis</p>
              <p className="text-zinc-500 text-xs">Upload a floor plan — AI extracts quantities, you cross-check, estimate auto-generates.</p>
            </div>
          </div>
        </Link>

        <Link
          href="/manual"
          className="bg-[#111] border border-[#2a2a2a] hover:bg-[#151515] rounded-xl p-5 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm mb-1">Manual Estimate</p>
              <p className="text-zinc-500 text-xs">Enter project type, GFA, and spec level — get an AIQS elemental cost plan instantly.</p>
            </div>
          </div>
        </Link>

        <Link
          href="/estimates"
          className="bg-[#111] border border-[#2a2a2a] hover:bg-[#151515] rounded-xl p-5 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm mb-1">View All Estimates</p>
              <p className="text-zinc-500 text-xs">Browse, edit, and export AIQS-format Bills of Quantities.</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent estimates */}
      {estimates && estimates.length > 0 && (
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent estimates</h2>
            <Link href="/estimates" className="text-xs text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>NCC Class</th>
                <th>GFA</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link href={`/estimates/${e.id}`} className="text-blue-400 hover:text-blue-300">
                      {e.name}
                    </Link>
                  </td>
                  <td className="text-zinc-400">Class {e.ncc_class}</td>
                  <td className="text-zinc-400">{e.gfa} m²</td>
                  <td className="font-medium text-white">
                    ${e.total_cost?.toLocaleString("en-AU", { minimumFractionDigits: 0 })}
                  </td>
                  <td>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${
                      e.status === "finalized"
                        ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/40"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="text-zinc-500">
                    {new Date(e.created_at).toLocaleDateString("en-AU")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(!estimates || estimates.length === 0) && (
        <div className="bg-[#111] border border-dashed border-[#2a2a2a] rounded-xl p-12 text-center">
          <p className="text-zinc-400 text-sm mb-4">No estimates yet — start with a plan analysis or manual estimate.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/analyser"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Plan analysis →
            </Link>
            <Link
              href="/manual"
              className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Manual estimate →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

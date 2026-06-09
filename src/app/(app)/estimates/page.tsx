import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = { title: "Estimates" };

export default async function EstimatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: estimates } = await supabase
    .from("estimates")
    .select("id, name, status, total_cost, gfa, ncc_class, created_at, updated_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const totalValue = estimates?.reduce((s, e) => s + (e.total_cost || 0), 0) ?? 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">Estimates</h1>
          <p className="text-zinc-500 text-sm">
            {estimates?.length ?? 0} estimates · ${(totalValue / 1_000_000).toFixed(2)}M portfolio value
          </p>
        </div>
        <Link
          href="/app/analyser"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New estimate
        </Link>
      </div>

      {estimates && estimates.length > 0 ? (
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>NCC Class</th>
                <th>GFA</th>
                <th>Total (ex GST)</th>
                <th>Rate/m²</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link href={`/app/estimates/${e.id}`} className="text-blue-400 hover:text-blue-300 font-medium">
                      {e.name}
                    </Link>
                  </td>
                  <td className="text-zinc-400">Class {e.ncc_class}</td>
                  <td className="font-mono text-zinc-300">{e.gfa} m²</td>
                  <td className="font-medium text-white">
                    ${e.total_cost?.toLocaleString("en-AU", { minimumFractionDigits: 0 })}
                  </td>
                  <td className="font-mono text-zinc-400">
                    ${e.gfa ? Math.round(e.total_cost / e.gfa).toLocaleString("en-AU") : "—"}/m²
                  </td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      e.status === "finalized"
                        ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/40"
                        : e.status === "archived"
                        ? "bg-zinc-800 text-zinc-600 border-zinc-700"
                        : "bg-blue-900/20 text-blue-400 border-blue-800/30"
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="text-zinc-500">
                    {new Date(e.created_at).toLocaleDateString("en-AU")}
                  </td>
                  <td>
                    <a
                      href={`/api/export-boq?id=${e.id}`}
                      className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      ↓ CSV
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#111] border border-dashed border-[#2a2a2a] rounded-xl p-16 text-center">
          <p className="text-zinc-400 text-sm mb-4">No estimates yet.</p>
          <Link
            href="/app/analyser"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Start with a plan analysis →
          </Link>
        </div>
      )}
    </div>
  );
}

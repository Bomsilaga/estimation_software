"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { calcEstimateTotals } from "@/lib/estimate-engine";
import type { Estimate, EstimateItem, EstimateSection } from "@/types";
import { useParams } from "next/navigation";

const SECTION_LABELS: Record<EstimateSection, string> = {
  trade_works: "Section 1 — Trade Works",
  pc_items: "Section 2 — Prime Cost (PC) Items",
  provisional_sums: "Section 3 — Provisional Sums",
  compliance: "Section 4 — Compliance & Statutory",
};

const SECTION_ORDER: EstimateSection[] = ["trade_works", "pc_items", "provisional_sums", "compliance"];

function fmt(n: number) {
  return n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EstimateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();

  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: est } = await supabase.from("estimates").select("*").eq("id", id).single();
    const { data: its } = await supabase.from("estimate_items").select("*").eq("estimate_id", id).order("sort_order");
    setEstimate(est as Estimate);
    setItems((its || []) as EstimateItem[]);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => { load(); }, [load]);

  async function updateItem(itemId: string, field: "quantity" | "rate", value: number) {
    const amount = field === "quantity"
      ? value * (items.find((i) => i.id === itemId)?.rate ?? 0)
      : value * (items.find((i) => i.id === itemId)?.quantity ?? 0);

    setItems((prev) =>
      prev.map((i) => i.id === itemId ? { ...i, [field]: value, amount: Math.round(amount * 100) / 100 } : i)
    );
  }

  async function saveChanges() {
    setSaving(true);
    const totals = calcEstimateTotals(items);

    // Update items
    for (const item of items) {
      await supabase.from("estimate_items").update({
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      }).eq("id", item.id!);
    }

    // Update estimate total
    await supabase.from("estimates").update({
      total_cost: totals.total,
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    setEstimate((prev) => prev ? { ...prev, total_cost: totals.total } : prev);
    setSaving(false);
    setEditingId(null);
  }

  async function finalizeEstimate() {
    await supabase.from("estimates").update({ status: "finalized" }).eq("id", id);
    setEstimate((prev) => prev ? { ...prev, status: "finalized" } : prev);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!estimate) {
    return <div className="p-8 text-zinc-500">Estimate not found.</div>;
  }

  const totals = calcEstimateTotals(items);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">{estimate.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-sm">NCC Class {estimate.ncc_class}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-500 text-sm">{estimate.gfa} m² GFA</span>
            <span className="text-zinc-700">·</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              estimate.status === "finalized"
                ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/40"
                : "bg-blue-900/20 text-blue-400 border-blue-800/30"
            }`}>
              {estimate.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editingId && (
            <button
              onClick={saveChanges}
              disabled={saving}
              className="text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          )}
          {estimate.status !== "finalized" && (
            <button
              onClick={finalizeEstimate}
              className="text-sm border border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/20 px-4 py-2 rounded-lg transition-colors"
            >
              Finalise
            </button>
          )}
          <a
            href={`/api/export-boq?id=${id}`}
            className="text-sm border border-[#2a2a2a] hover:bg-[#1a1a1a] text-zinc-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export AIQS CSV
          </a>
        </div>
      </div>

      {/* Cost summary cards */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {[
          { label: "Trade Works", value: totals.tradeWorks, accent: false },
          { label: "PC Items", value: totals.pcItems, accent: false },
          { label: "Provisional Sums", value: totals.provisionalSums, accent: false },
          { label: "Compliance", value: totals.compliance, accent: false },
          { label: "Total (ex GST)", value: totals.total, accent: true },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.accent ? "bg-blue-600/10 border-blue-600/20" : "bg-[#111] border-[#2a2a2a]"}`}>
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`font-semibold text-sm ${s.accent ? "text-blue-300" : "text-white"}`}>
              ${fmt(s.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 p-3 bg-[#111] border border-[#2a2a2a] rounded-lg flex items-center gap-2">
        <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <p className="text-zinc-400 text-xs">Click any quantity or rate cell to edit it. Changes recalculate amounts live.</p>
      </div>

      {/* Tables by section */}
      {SECTION_ORDER.map((section) => {
        const sectionItems = items.filter((i) => i.section === section);
        if (sectionItems.length === 0) return null;
        const sectionTotal = sectionItems.reduce((s, i) => s + i.amount, 0);

        return (
          <div key={section} className="mb-6 bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#2a2a2a] flex items-center justify-between">
              <p className="text-sm font-medium text-white">{SECTION_LABELS[section]}</p>
              <p className="text-sm font-medium text-white">${fmt(sectionTotal)}</p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-8">Ref</th>
                  <th>Trade</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Amount</th>
                  <th>Standard</th>
                </tr>
              </thead>
              <tbody>
                {sectionItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="text-zinc-600 font-mono text-xs">{idx + 1}</td>
                    <td className="text-zinc-400">{item.trade}</td>
                    <td>
                      <div>
                        <p className="text-zinc-200">{item.description}</p>
                        {item.notes && <p className="text-zinc-600 text-xs mt-0.5">{item.notes}</p>}
                      </div>
                    </td>
                    <td className="text-zinc-500">{item.unit}</td>
                    <td className="text-right">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id!, "quantity", parseFloat(e.target.value) || 0)}
                          className="input-base w-24 text-right text-xs py-1"
                        />
                      ) : (
                        <span
                          onClick={() => setEditingId(item.id!)}
                          className="font-mono text-zinc-300 cursor-pointer hover:text-white"
                        >
                          {item.quantity.toLocaleString("en-AU")}
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id!, "rate", parseFloat(e.target.value) || 0)}
                          className="input-base w-28 text-right text-xs py-1"
                        />
                      ) : (
                        <span
                          onClick={() => setEditingId(item.id!)}
                          className="font-mono text-zinc-300 cursor-pointer hover:text-white"
                        >
                          ${fmt(item.rate)}
                        </span>
                      )}
                    </td>
                    <td className="text-right font-medium text-white font-mono">
                      ${fmt(item.amount)}
                    </td>
                    <td className="text-zinc-600 text-xs">{item.as_standard}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="text-right text-xs font-medium text-zinc-500 pt-2">
                    {SECTION_LABELS[section].replace("Section", "Sec.")} subtotal
                  </td>
                  <td className="text-right font-bold text-white pt-2">${fmt(sectionTotal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}

      {/* Grand total */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Total estimated cost (ex GST)</span>
            <span className="font-bold text-white text-base">${fmt(totals.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">GST (10%)</span>
            <span className="text-zinc-300">${fmt(totals.total * 0.1)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-[#2a2a2a] pt-2 mt-2">
            <span className="text-zinc-300 font-medium">Total inc GST</span>
            <span className="font-bold text-white">${fmt(totals.total * 1.1)}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-[#1f1f1f] pt-2 mt-2">
            <span className="text-zinc-600">Rate / m² GFA (ex GST)</span>
            <span className="text-zinc-400 font-mono">
              ${estimate.gfa ? Math.round(totals.total / estimate.gfa).toLocaleString("en-AU") : "—"}/m²
            </span>
          </div>
        </div>
      </div>

      <p className="text-zinc-700 text-xs mt-4">
        Rates are Melbourne mid-market (2024-25). Comply with AIQS Australian Cost Management Manual. This is a budget estimate only — verify against current market and tender pricing.
      </p>
    </div>
  );
}

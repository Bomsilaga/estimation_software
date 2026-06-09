"use client";

import { useState, useMemo } from "react";
import { MELBOURNE_RATES, TRADE_CATEGORIES } from "@/lib/rates-data";

export default function RatesPage() {
  const [search, setSearch] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MELBOURNE_RATES.filter((r) => {
      const matchesTrade = selectedTrade === "All" || r.trade === selectedTrade;
      const matchesSearch =
        !q ||
        r.description.toLowerCase().includes(q) ||
        r.trade.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q) ||
        (r.as_standard || "").toLowerCase().includes(q);
      return matchesTrade && matchesSearch;
    });
  }, [search, selectedTrade]);

  function fmt(n: number) {
    return n.toLocaleString("en-AU", { minimumFractionDigits: 0 });
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">Rate Reference</h1>
        <p className="text-zinc-500 text-sm">
          {MELBOURNE_RATES.length} Melbourne construction rates — {TRADE_CATEGORIES.length} trade categories (2024-25)
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description, trade, AS standard…"
            className="input-base w-full pl-9"
          />
        </div>

        <select
          value={selectedTrade}
          onChange={(e) => setSelectedTrade(e.target.value)}
          className="input-base"
        >
          <option value="All">All trades</option>
          {TRADE_CATEGORIES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <span className="text-zinc-600 text-sm">{filtered.length} results</span>
      </div>

      {/* Rate table */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Trade</th>
              <th>Description</th>
              <th>Unit</th>
              <th className="text-right">Low</th>
              <th className="text-right">Mid</th>
              <th className="text-right">High</th>
              <th>Standard</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx}>
                <td>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#1a1a1a] text-zinc-400 border border-[#2a2a2a] whitespace-nowrap">
                    {r.trade}
                  </span>
                </td>
                <td className="text-zinc-200 max-w-xs">{r.description}</td>
                <td className="text-zinc-500 font-mono">{r.unit}</td>
                <td className="text-right font-mono text-zinc-500">${fmt(r.rate_low)}</td>
                <td className="text-right font-mono font-medium text-white">${fmt(r.rate_mid)}</td>
                <td className="text-right font-mono text-zinc-500">${fmt(r.rate_high)}</td>
                <td>
                  {r.as_standard && (
                    <span className="text-xs text-blue-400 font-mono whitespace-nowrap">{r.as_standard}</span>
                  )}
                </td>
                <td className="text-zinc-600 text-xs max-w-xs truncate">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">No rates match your search.</p>
        </div>
      )}

      <p className="text-zinc-700 text-xs mt-6">
        Rates are indicative Melbourne market mid-range (2024-25). Source: AIQS Cost Management Manual guidelines & market analysis.
        Verify with current supplier quotes. All rates exclude GST.
      </p>
    </div>
  );
}

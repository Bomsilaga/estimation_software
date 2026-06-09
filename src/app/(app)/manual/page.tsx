"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PROJECT_TYPES,
  SPEC_LEVELS,
  STATE_FACTORS,
  SITE_OPTIONS,
  generateManualEstimate,
  type ProjectTypeId,
  type SpecLevel,
  type ManualEstimateItem,
} from "@/lib/manual-estimate";

const NCC_MAP: Record<ProjectTypeId, string> = {
  residential: "1a",
  multires: "2",
  commercial: "5",
  industrial: "8",
  fitout: "5",
  tiling: "8",
  facades: "8",
};

function fmt(n: number) {
  return n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ManualEstimatePage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<ProjectTypeId | "">("");

  // Step 2
  const [subtype, setSubtype] = useState("");
  const [gfa, setGfa] = useState("");
  const [specLevel, setSpecLevel] = useState<SpecLevel>("standard");
  const [state, setState] = useState("VIC");
  const [siteComplexity, setSiteComplexity] = useState("flat");
  const [distanceKm, setDistanceKm] = useState("0");

  // Step 3 — editable items
  const [items, setItems] = useState<ManualEstimateItem[]>([]);
  const [generated, setGenerated] = useState(false);

  const selectedType = PROJECT_TYPES.find((t) => t.id === projectType);

  function handleTypeSelect(id: ProjectTypeId) {
    setProjectType(id);
    setSubtype("");
  }

  function generateEstimate() {
    if (!projectType) return;
    const result = generateManualEstimate({
      projectType: projectType as ProjectTypeId,
      specLevel,
      gfa: parseFloat(gfa) || 0,
      state,
      siteComplexity,
      distanceKm: parseFloat(distanceKm) || 0,
    });
    setItems(result.items);
    setGenerated(true);
    setStep(3);
  }

  const totals = useMemo(() => {
    const construction = items.reduce((s, i) => s + i.amount, 0);
    const contingency = construction * 0.05;
    const designFees = construction * 0.08;
    const gst = (construction + contingency + designFees) * 0.10;
    return { construction, contingency, designFees, gst, total: construction + contingency + designFees + gst };
  }, [items]);

  function updateItem(idx: number, field: "qty" | "rate", value: string) {
    const v = parseFloat(value) || 0;
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const qty = field === "qty" ? v : it.qty;
        const rate = field === "rate" ? v : it.rate;
        return { ...it, qty, rate, amount: parseFloat((qty * rate).toFixed(2)) };
      })
    );
  }

  async function save() {
    if (!projectName.trim()) { setError("Enter a project name."); return; }
    setSaving(true);
    setError("");

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: est, error: estErr } = await supabase
        .from("estimates")
        .insert({
          user_id: user.id,
          name: projectName.trim(),
          status: "draft",
          total_cost: parseFloat(totals.construction.toFixed(2)),
          gfa: parseFloat(gfa) || 0,
          ncc_class: NCC_MAP[projectType as ProjectTypeId] || "1a",
        })
        .select("id")
        .single();

      if (estErr || !est) throw new Error(estErr?.message || "Failed to create estimate");

      const dbItems = items.map((it, i) => ({
        estimate_id: est.id,
        section: "trade_works",
        trade: `Element ${it.el}`,
        description: it.name,
        unit: it.unit,
        quantity: it.qty,
        rate: it.rate,
        amount: it.amount,
        notes: it.notes,
        sort_order: i + 1,
      }));

      const { error: itemsErr } = await supabase.from("estimate_items").insert(dbItems);
      if (itemsErr) throw new Error(itemsErr.message);

      router.push(`/estimates/${est.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">Manual Estimate</h1>
        <p className="text-zinc-500 text-sm">Generate an AIQS-format estimate from project parameters</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              s < step ? "bg-blue-600 text-white" :
              s === step ? "bg-blue-600/20 text-blue-400 border border-blue-600/40" :
              "bg-[#1a1a1a] text-zinc-600"
            }`}>{s < step ? "✓" : s}</div>
            <span className={`text-xs ${s === step ? "text-white" : "text-zinc-600"}`}>
              {s === 1 ? "Project Type" : s === 2 ? "Parameters" : "Review & Save"}
            </span>
            {s < 3 && <div className="w-8 h-px bg-[#2a2a2a] ml-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Project type */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Project name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. 12 Smith St — New Dwelling"
              className="input-base w-full max-w-md"
            />
          </div>

          <div>
            <p className="text-sm text-zinc-400 mb-3">Select project type</p>
            <div className="grid grid-cols-4 gap-3">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTypeSelect(t.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    projectType === t.id
                      ? "border-blue-500/60 bg-blue-600/10"
                      : "border-[#2a2a2a] bg-[#111] hover:border-[#3a3a3a] hover:bg-[#151515]"
                  }`}
                >
                  <span className="text-2xl block mb-2">{t.icon}</span>
                  <span className={`text-sm font-medium ${projectType === t.id ? "text-blue-300" : "text-white"}`}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!projectName.trim() || !projectType}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 — Parameters */}
      {step === 2 && selectedType && (
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center gap-3 p-4 bg-[#111] border border-[#2a2a2a] rounded-xl">
            <span className="text-2xl">{selectedType.icon}</span>
            <div>
              <p className="text-white font-medium text-sm">{selectedType.label}</p>
              <button onClick={() => setStep(1)} className="text-xs text-zinc-500 hover:text-blue-400 transition-colors">
                ← Change type
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Subtype</label>
              <select
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                className="input-base w-full"
              >
                <option value="">Select…</option>
                {selectedType.subtypes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Gross Floor Area (m²)</label>
              <input
                type="number"
                value={gfa}
                onChange={(e) => setGfa(e.target.value)}
                placeholder="e.g. 250"
                min="1"
                className="input-base w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Specification Level</label>
              <select value={specLevel} onChange={(e) => setSpecLevel(e.target.value as SpecLevel)} className="input-base w-full">
                {SPEC_LEVELS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">State</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className="input-base w-full">
                {Object.keys(STATE_FACTORS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Site Complexity</label>
              <select value={siteComplexity} onChange={(e) => setSiteComplexity(e.target.value)} className="input-base w-full">
                {SITE_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Distance from CBD (km)</label>
              <input
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="0"
                min="0"
                className="input-base w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={generateEstimate}
              disabled={!gfa || parseFloat(gfa) <= 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Generate estimate →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Review & Save */}
      {step === 3 && generated && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{projectName}</p>
              <p className="text-zinc-500 text-sm">
                {selectedType?.label} · {gfa} m² · {SPEC_LEVELS.find(s => s.id === specLevel)?.label} · {state}
              </p>
            </div>
            <button
              onClick={() => { setStep(2); setGenerated(false); }}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              ← Adjust parameters
            </button>
          </div>

          {/* Rate summary */}
          <div className="grid grid-cols-3 gap-3">
            {(() => {
              const constructionRate = parseFloat(gfa) > 0 ? totals.construction / parseFloat(gfa) : 0;
              return [
                { label: "Construction Cost", value: `$${Math.round(totals.construction).toLocaleString("en-AU")}` },
                { label: "Rate per m²", value: `$${Math.round(constructionRate).toLocaleString("en-AU")}/m²` },
                { label: "Total (inc. GST)", value: `$${Math.round(totals.total).toLocaleString("en-AU")}` },
              ].map((s) => (
                <div key={s.label} className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4">
                  <p className="text-zinc-500 text-xs mb-1">{s.label}</p>
                  <p className="text-white font-semibold">{s.value}</p>
                </div>
              ));
            })()}
          </div>

          {/* Elemental table */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2a2a2a]">
              <p className="text-sm font-medium text-white">AIQS Elemental Cost Plan</p>
              <p className="text-zinc-500 text-xs mt-0.5">Quantities and rates are editable — adjust to suit</p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10">El.</th>
                  <th>Element</th>
                  <th className="w-16">Unit</th>
                  <th className="w-24">Qty</th>
                  <th className="w-28">Rate ($/m²)</th>
                  <th className="w-32 text-right pr-5">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.el}>
                    <td className="text-zinc-600 font-mono text-xs">{item.el}</td>
                    <td className="text-zinc-200">{item.name}</td>
                    <td className="text-zinc-500">{item.unit}</td>
                    <td>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(idx, "qty", e.target.value)}
                        className="w-20 bg-transparent text-zinc-300 font-mono text-sm focus:outline-none focus:text-white border-b border-transparent focus:border-blue-500/50 pb-0.5"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(idx, "rate", e.target.value)}
                        className="w-24 bg-transparent text-zinc-300 font-mono text-sm focus:outline-none focus:text-white border-b border-transparent focus:border-blue-500/50 pb-0.5"
                      />
                    </td>
                    <td className="text-right pr-5 font-mono text-sm text-zinc-200">
                      ${fmt(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#2a2a2a]">
                  <td colSpan={5} className="px-4 py-3 text-sm font-medium text-zinc-300">Construction Total</td>
                  <td className="text-right pr-5 py-3 font-semibold text-white font-mono">
                    ${fmt(totals.construction)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-4 py-1.5 text-xs text-zinc-500">Contingency (5%)</td>
                  <td className="text-right pr-5 py-1.5 text-sm text-zinc-400 font-mono">${fmt(totals.contingency)}</td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-4 py-1.5 text-xs text-zinc-500">Design & Professional Fees (8%)</td>
                  <td className="text-right pr-5 py-1.5 text-sm text-zinc-400 font-mono">${fmt(totals.designFees)}</td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-4 py-1.5 text-xs text-zinc-500">GST (10%)</td>
                  <td className="text-right pr-5 py-1.5 text-sm text-zinc-400 font-mono">${fmt(totals.gst)}</td>
                </tr>
                <tr className="border-t border-[#2a2a2a]">
                  <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-white">Total Project Cost (inc. GST)</td>
                  <td className="text-right pr-5 py-3 font-bold text-white font-mono text-base">
                    ${fmt(totals.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              {saving ? "Saving…" : "Save estimate →"}
            </button>
            <p className="text-zinc-600 text-xs">Saves as draft — you can edit rates later</p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateEstimateItems, calcEstimateTotals } from "@/lib/estimate-engine";
import type { PlanExtraction, EstimateItem } from "@/types";
import { useRouter } from "next/navigation";

type Step = "upload" | "analysing" | "review" | "generating" | "done";

interface ReviewField {
  key: keyof PlanExtraction;
  label: string;
  unit: string;
  value: number | string;
  confidence: "high" | "medium" | "low";
  accepted: boolean;
  override?: number | string;
}

const CONF_CLASS = {
  high: "conf-high",
  medium: "conf-medium",
  low: "conf-low",
} as const;

function ConfBadge({ c }: { c: "high" | "medium" | "low" }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${CONF_CLASS[c]}`}>
      {c}
    </span>
  );
}

export default function PlanAnalyserPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [projectName, setProjectName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<PlanExtraction | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [reviewFields, setReviewFields] = useState<ReviewField[]>([]);
  const [error, setError] = useState("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [savedEstimateId, setSavedEstimateId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) selectFile(f);
  }, []);

  function selectFile(f: File) {
    if (!["image/png", "image/jpeg", "image/webp", "image/jpg"].includes(f.type)) {
      setError("Please upload a PNG, JPEG, or WEBP image.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  async function runAnalysis() {
    if (!file) return;
    setStep("analysing");
    setError("");

    // Fake progress animation
    const interval = setInterval(() => {
      setAnalysisProgress((p) => Math.min(p + Math.random() * 12, 88));
    }, 600);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("project_name", projectName || "Untitled Project");

      const res = await fetch("/api/analyse-plan", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setAnalysisProgress(100);
      clearInterval(interval);

      setExtraction(data.extraction);
      setImageUrl(data.image_url);
      setReviewFields(buildReviewFields(data.extraction));
      setStep("review");
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStep("upload");
    }
  }

  function buildReviewFields(ext: PlanExtraction): ReviewField[] {
    const c = ext.gfa_confidence;
    return [
      { key: "gfa", label: "Gross Floor Area (GFA)", unit: "m²", value: ext.gfa, confidence: c, accepted: true },
      { key: "nfa", label: "Net Floor Area (NFA)", unit: "m²", value: ext.nfa, confidence: c, accepted: true },
      { key: "perimeter_m", label: "External Wall Perimeter", unit: "lm", value: ext.perimeter_m, confidence: ext.gfa_confidence, accepted: true },
      { key: "external_wall_area_m2", label: "External Wall Area", unit: "m²", value: ext.external_wall_area_m2, confidence: ext.gfa_confidence, accepted: true },
      { key: "internal_wall_lm", label: "Internal Wall Length", unit: "lm", value: ext.internal_wall_lm, confidence: ext.overall_confidence, accepted: true },
      { key: "wet_area_m2", label: "Wet Area (bath/kitchen/laundry)", unit: "m²", value: ext.wet_area_m2, confidence: ext.overall_confidence, accepted: true },
      { key: "external_doors", label: "External Doors", unit: "no.", value: ext.external_doors, confidence: ext.overall_confidence, accepted: true },
      { key: "internal_doors", label: "Internal Doors", unit: "no.", value: ext.internal_doors, confidence: ext.overall_confidence, accepted: true },
      { key: "windows", label: "Windows (total)", unit: "no.", value: ext.windows, confidence: ext.overall_confidence, accepted: true },
      { key: "garage_doors", label: "Garage Doors", unit: "no.", value: ext.garage_doors, confidence: ext.overall_confidence, accepted: true },
      { key: "bedrooms", label: "Bedrooms", unit: "no.", value: ext.bedrooms, confidence: ext.overall_confidence, accepted: true },
      { key: "bathrooms", label: "Bathrooms / WCs", unit: "no.", value: ext.bathrooms, confidence: ext.overall_confidence, accepted: true },
      { key: "storeys", label: "Number of Storeys", unit: "no.", value: ext.storeys, confidence: "high", accepted: true },
      { key: "ncc_class", label: "NCC Building Class", unit: "", value: ext.ncc_class, confidence: "high", accepted: true },
      { key: "wall_construction", label: "Wall Construction", unit: "", value: ext.wall_construction, confidence: ext.overall_confidence, accepted: true },
      { key: "roof_type", label: "Roof Type", unit: "", value: ext.roof_type, confidence: ext.overall_confidence, accepted: true },
    ];
  }

  function updateField(key: keyof PlanExtraction, override: string) {
    setReviewFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, override: override === "" ? undefined : override } : f))
    );
  }

  function toggleAccept(key: keyof PlanExtraction) {
    setReviewFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, accepted: !f.accepted } : f))
    );
  }

  async function generateEstimate() {
    if (!extraction) return;
    setStep("generating");

    // Build final data with overrides applied
    const finalData: PlanExtraction = { ...extraction };
    reviewFields.forEach((f) => {
      if (f.override !== undefined && f.accepted) {
        const val = typeof f.value === "number" ? Number(f.override) : f.override;
        (finalData as unknown as Record<string, unknown>)[f.key as string] = val;
      }
    });

    const items = generateEstimateItems(finalData);
    const totals = calcEstimateTotals(items);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save estimate to DB
    const { data: estimate, error: estErr } = await supabase
      .from("estimates")
      .insert({
        user_id: user.id,
        name: projectName || "Untitled Project",
        status: "draft",
        total_cost: totals.total,
        gfa: finalData.gfa,
        ncc_class: finalData.ncc_class,
        plan_image_url: imageUrl,
        extraction_data: finalData,
      })
      .select()
      .single();

    if (estErr || !estimate) {
      setError("Failed to save estimate: " + estErr?.message);
      setStep("review");
      return;
    }

    // Save items
    const itemsToInsert = items.map((item) => ({
      ...item,
      estimate_id: estimate.id,
    }));

    const { error: itemsErr } = await supabase.from("estimate_items").insert(itemsToInsert);
    if (itemsErr) {
      setError("Failed to save items: " + itemsErr.message);
      setStep("review");
      return;
    }

    setSavedEstimateId(estimate.id);
    setStep("done");
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">Plan Analyser</h1>
        <p className="text-zinc-500 text-sm">
          Upload a floor plan → AI extracts elements & measurements → you cross-check → estimate auto-generates
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { id: "upload", label: "Upload" },
          { id: "review", label: "Review" },
          { id: "done", label: "Estimate" },
        ].map((s, i) => {
          const stepOrder = { upload: 0, analysing: 0, review: 1, generating: 1, done: 2 };
          const current = stepOrder[step];
          const isActive = stepOrder[s.id as keyof typeof stepOrder] === current;
          const isDone = stepOrder[s.id as keyof typeof stepOrder] < current;
          return (
            <div key={s.id} className="flex items-center gap-2">
              {i > 0 && <div className={`w-12 h-px ${isDone ? "bg-blue-600" : "bg-[#2a2a2a]"}`} />}
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  isDone ? "bg-blue-600 text-white" :
                  isActive ? "bg-blue-600/20 text-blue-400 border border-blue-600/40" :
                  "bg-[#1a1a1a] text-zinc-600 border border-[#2a2a2a]"
                }`}>
                  {isDone ? "✓" : i + 1}
                </div>
                <span className={`text-sm ${isActive ? "text-white" : isDone ? "text-zinc-400" : "text-zinc-600"}`}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── STEP: UPLOAD ── */}
      {(step === "upload") && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Project name</label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. 45 Oak St, Balwyn — New Dwelling"
              className="input-base w-full max-w-md"
            />
          </div>

          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-[#2a2a2a] hover:border-blue-600/40 rounded-xl p-12 text-center cursor-pointer transition-colors"
          >
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
              onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])} />
            {preview ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Plan preview" className="max-h-64 mx-auto rounded-lg object-contain" />
                <p className="text-zinc-400 text-sm">{file?.name}</p>
                <p className="text-zinc-600 text-xs">Click to replace</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Drop your floor plan here</p>
                  <p className="text-zinc-500 text-xs mt-1">PNG, JPEG, WEBP — max 10MB</p>
                </div>
                <p className="text-zinc-600 text-xs">
                  Works best with: architectural drawings, hand-drawn plans, scanned plans
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={runAnalysis}
              disabled={!file}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              Analyse plan
            </button>
            <p className="text-zinc-600 text-xs">Powered by Claude claude-opus-4-8 Vision — typically &lt;30 seconds</p>
          </div>
        </div>
      )}

      {/* ── STEP: ANALYSING ── */}
      {step === "analysing" && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white font-medium mb-1">Analysing floor plan…</p>
            <p className="text-zinc-500 text-sm">Claude is reading measurements, identifying elements, and assessing compliance</p>
          </div>
          <div className="w-72 bg-[#1a1a1a] rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${analysisProgress}%` }} />
          </div>
          <p className="text-zinc-600 text-xs">{Math.round(analysisProgress)}%</p>
        </div>
      )}

      {/* ── STEP: REVIEW ── */}
      {step === "review" && extraction && (
        <div className="space-y-6">
          <div className="flex items-start gap-4 bg-amber-900/10 border border-amber-800/20 rounded-xl p-4">
            <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-amber-400 font-medium text-sm">Cross-check extracted values before generating the estimate</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Items marked <span className="text-red-400">low confidence</span> should be verified against your plan.
                Override any incorrect values — only accepted items are used in calculations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Plan image */}
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a2a2a]">
                <p className="text-sm font-medium text-white">Uploaded plan</p>
              </div>
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Plan" className="w-full object-contain max-h-96" />
              )}
            </div>

            {/* Notes from AI */}
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-3">AI analysis notes</p>
              <p className="text-zinc-400 text-sm leading-relaxed">{extraction.extraction_notes}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Overall confidence</span>
                  <ConfBadge c={extraction.overall_confidence} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Drawing scale detected</span>
                  <span className="text-zinc-300">{extraction.drawing_scale || "Not found"}</span>
                </div>
                {extraction.rooms.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                    <p className="text-zinc-500 text-xs mb-2">Room breakdown</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {extraction.rooms.map((r, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-zinc-400">{r.name}</span>
                          <span className="text-zinc-300">{r.area_m2} m²</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review table */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2a2a2a]">
              <p className="text-sm font-medium text-white">Extracted quantities — verify & correct</p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Extracted</th>
                  <th>Unit</th>
                  <th>Confidence</th>
                  <th>Override</th>
                  <th className="text-center">Accept</th>
                </tr>
              </thead>
              <tbody>
                {reviewFields.map((f) => (
                  <tr key={String(f.key)} className={f.confidence === "low" ? "bg-red-900/5" : ""}>
                    <td className="text-zinc-300">{f.label}</td>
                    <td className="font-mono text-white">{String(f.value)}</td>
                    <td className="text-zinc-500">{f.unit}</td>
                    <td><ConfBadge c={f.confidence} /></td>
                    <td>
                      <input
                        type={typeof f.value === "number" ? "number" : "text"}
                        value={f.override ?? ""}
                        onChange={(e) => updateField(f.key, e.target.value)}
                        placeholder="Override…"
                        className="input-base w-28 text-xs py-1"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={f.accepted}
                        onChange={() => toggleAccept(f.key)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Window details */}
          {extraction.window_details.length > 0 && (
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a2a]">
                <p className="text-sm font-medium text-white">Window schedule</p>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Type</th><th>W (mm)</th><th>H (mm)</th><th>Qty</th><th>Area (m²)</th></tr>
                </thead>
                <tbody>
                  {extraction.window_details.map((w, i) => (
                    <tr key={i}>
                      <td className="text-zinc-300 capitalize">{w.type}</td>
                      <td className="font-mono text-zinc-300">{w.width_mm}</td>
                      <td className="font-mono text-zinc-300">{w.height_mm}</td>
                      <td className="text-zinc-300">{w.quantity}</td>
                      <td className="text-zinc-400">{((w.width_mm / 1000) * (w.height_mm / 1000) * w.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Door details */}
          {extraction.door_details.length > 0 && (
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a2a]">
                <p className="text-sm font-medium text-white">Door schedule</p>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Type</th><th>W (mm)</th><th>H (mm)</th><th>Qty</th></tr>
                </thead>
                <tbody>
                  {extraction.door_details.map((d, i) => (
                    <tr key={i}>
                      <td className="text-zinc-300 capitalize">{d.type}</td>
                      <td className="font-mono text-zinc-300">{d.width_mm}</td>
                      <td className="font-mono text-zinc-300">{d.height_mm}</td>
                      <td className="text-zinc-300">{d.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={generateEstimate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              Generate estimate →
            </button>
            <button onClick={() => setStep("upload")} className="text-zinc-500 hover:text-white text-sm transition-colors">
              Re-upload plan
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: GENERATING ── */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-medium">Building your estimate…</p>
          <p className="text-zinc-500 text-sm">Calculating 30+ AIQS trade line items with Melbourne rates</p>
        </div>
      )}

      {/* ── STEP: DONE ── */}
      {step === "done" && savedEstimateId && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="w-16 h-16 bg-emerald-900/30 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white font-medium text-lg mb-1">Estimate ready</p>
            <p className="text-zinc-400 text-sm">30+ AIQS line items generated from your reviewed quantities</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/app/estimates/${savedEstimateId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              View estimate →
            </button>
            <button
              onClick={() => { setStep("upload"); setFile(null); setPreview(null); setProjectName(""); }}
              className="border border-[#2a2a2a] hover:bg-[#1a1a1a] text-zinc-300 font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              New analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

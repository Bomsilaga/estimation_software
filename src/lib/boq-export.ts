import type { EstimateItem, Estimate } from "@/types";
import { calcEstimateTotals } from "./estimate-engine";

function esc(v: string | number | undefined): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(...cells: (string | number | undefined)[]): string {
  return cells.map(esc).join(",") + "\r\n";
}

function sectionHeader(label: string): string {
  return `\r\n${label}\r\n` +
    row("Ref", "Trade", "Description", "Unit", "Qty", "Rate (AUD)", "Amount (AUD)", "Notes", "Standard");
}

function itemRow(item: EstimateItem, prefix: string, idx: number): string {
  return row(
    `${prefix}${String(idx).padStart(2, "0")}`,
    item.trade,
    item.description,
    item.unit,
    item.quantity,
    item.rate.toFixed(2),
    item.amount.toFixed(2),
    item.notes,
    item.as_standard ?? ""
  );
}

export function exportBoqCsv(estimate: Estimate, items: EstimateItem[]): string {
  const totals = calcEstimateTotals(items);
  const now = new Date().toLocaleDateString("en-AU");

  let csv = "";

  // ── Header ─────────────────────────────────────────────────────────────────
  csv += row("AUSSIE ESTIMATOR — BILL OF QUANTITIES");
  csv += row("Prepared by:", "Aussie Estimator", "Date:", now);
  csv += row("Project:", estimate.name);
  csv += row("NCC Class:", estimate.ncc_class, "GFA:", `${estimate.gfa} m²`);
  csv += row("Status:", estimate.status);
  csv += "\r\n";
  csv += row("Format: AIQS Standard Bill of Quantities");
  csv += row("Note: All rates are Melbourne market mid-range (2024-25). Verify with current suppliers.");
  csv += "\r\n";

  // ── Section 1 — Trade Works ────────────────────────────────────────────────
  csv += sectionHeader("SECTION 1 — TRADE WORKS");
  const tradeItems = items.filter((i) => i.section === "trade_works");
  tradeItems.forEach((item, idx) => { csv += itemRow(item, "1.", idx + 1); });
  csv += row("", "", "SECTION 1 SUBTOTAL", "", "", "", totals.tradeWorks.toFixed(2));
  csv += "\r\n";

  // ── Section 2 — PC Items ───────────────────────────────────────────────────
  csv += sectionHeader("SECTION 2 — PRIME COST (PC) ITEMS");
  const pcItems = items.filter((i) => i.section === "pc_items");
  pcItems.forEach((item, idx) => { csv += itemRow(item, "2.", idx + 1); });
  csv += row("", "", "SECTION 2 SUBTOTAL", "", "", "", totals.pcItems.toFixed(2));
  csv += "\r\n";

  // ── Section 3 — Provisional Sums ──────────────────────────────────────────
  csv += sectionHeader("SECTION 3 — PROVISIONAL SUMS");
  const psItems = items.filter((i) => i.section === "provisional_sums");
  psItems.forEach((item, idx) => { csv += itemRow(item, "3.", idx + 1); });
  csv += row("", "", "SECTION 3 SUBTOTAL", "", "", "", totals.provisionalSums.toFixed(2));
  csv += "\r\n";

  // ── Section 4 — Compliance ────────────────────────────────────────────────
  csv += sectionHeader("SECTION 4 — COMPLIANCE & STATUTORY COSTS");
  csv += row("", "", "(VIC Building Permit Fee: Building Regulations 2018, Sch 3)");
  csv += row("", "", "(CoINVEST LSL Levy: 0.35% — Long Service Leave (Portability) Act 2018)");
  csv += row("", "", "(Contract Works Insurance: recommended minimum 0.20% of contract value)");
  const compItems = items.filter((i) => i.section === "compliance");
  compItems.forEach((item, idx) => { csv += itemRow(item, "4.", idx + 1); });
  csv += row("", "", "SECTION 4 SUBTOTAL", "", "", "", totals.compliance.toFixed(2));
  csv += "\r\n";

  // ── Grand Total ────────────────────────────────────────────────────────────
  csv += row("", "", "═══════════════════════════════════");
  csv += row("", "", "TOTAL ESTIMATED COST (EX GST)", "", "", "", totals.total.toFixed(2));
  csv += row("", "", "GST (10%)", "", "", "", (totals.total * 0.1).toFixed(2));
  csv += row("", "", "TOTAL ESTIMATED COST (INC GST)", "", "", "", (totals.total * 1.1).toFixed(2));
  csv += "\r\n";
  csv += row("Rate / m² GFA (ex GST)", (totals.total / estimate.gfa).toFixed(0));
  csv += "\r\n";

  // ── Disclaimer ─────────────────────────────────────────────────────────────
  csv += row("DISCLAIMER");
  csv += row(
    "This estimate is prepared using Melbourne mid-market rates (2024-25) and should be treated as a budget guide only.",
    "Rates are indicative and may vary based on site conditions, finishes, market conditions, and contractor pricing.",
    "This document does not constitute a contract price or formal tender. Verify all quantities against current drawings.",
    "Prepared in accordance with AIQS Australian Cost Management Manual."
  );

  return csv;
}

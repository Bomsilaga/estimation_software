import type { EstimateItem, PlanExtraction } from "@/types";
import {
  calcVicPermitFee,
  calcLslLevy,
  calcContractWorksInsurance,
  calcPbsFee,
  calcWorksafeDbi,
} from "./permit-fee";

const STOREY_HEIGHT = 2.7; // metres — standard residential ceiling

export function generateEstimateItems(data: PlanExtraction): EstimateItem[] {
  const items: EstimateItem[] = [];
  let order = 0;

  const push = (
    section: EstimateItem["section"],
    trade: string,
    description: string,
    unit: string,
    qty: number,
    rate: number,
    notes = "",
    asStandard = ""
  ): void => {
    const quantity = Math.round(qty * 100) / 100;
    const amount = Math.round(quantity * rate * 100) / 100;
    items.push({
      section,
      trade,
      description,
      unit,
      quantity,
      rate,
      amount,
      notes,
      sort_order: ++order,
      as_standard: asStandard,
    });
  };

  // ─── Derived quantities ────────────────────────────────────────────────────
  const gfa = data.gfa;
  const perim = data.perimeter_m;
  const extWallArea = data.external_wall_area_m2 || perim * STOREY_HEIGHT;
  const intWallLm = data.internal_wall_lm || gfa * 0.8; // ~0.8 lm per m² GFA
  const intWallArea = intWallLm * STOREY_HEIGHT * 2; // both sides
  const wetAreaM2 = data.wet_area_m2 || data.bathrooms * 8 + (data.bathrooms > 0 ? 6 : 0); // ~8m²/bath + laundry
  const dryCeilArea = gfa; // ceiling = GFA roughly
  const extDoors = data.external_doors || 2;
  const intDoors = data.internal_doors || Math.max(4, data.bedrooms * 2);
  const windows = data.windows || Math.max(8, Math.round(gfa / 15));
  const avgWindowArea = 1.0; // m² default window area
  const windowArea = windows * avgWindowArea;
  const garageDoors = data.garage_doors || (data.has_garage ? 1 : 0);
  const bedrooms = data.bedrooms || 3;
  const bathrooms = data.bathrooms || 2;
  const storeys = data.storeys || 1;
  const roofArea = gfa * 1.22 * storeys; // 22% for pitch + overhang
  const isCommercial = !["1a", "1b"].includes(data.ncc_class);
  const wallTileArea = bathrooms * 18 + (data.bathrooms > 0 ? 12 : 0); // ~18m² per bathroom

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1 — TRADE WORKS
  // ──────────────────────────────────────────────────────────────────────────

  // Earthworks
  push("trade_works", "Earthworks", "Excavation & cut/fill to platform level", "m²", gfa * 1.1, 48, "GFA × 1.1 site coverage factor", "AS 3798");
  push("trade_works", "Earthworks", "Termite management system (chemical reticulation)", "m²", gfa, 22, "AS 3660.1 — required in VIC", "AS 3660.1");

  // Concrete
  const slabRate = data.slab_type === "suspended" ? 360 : 145;
  const slabDesc = data.slab_type === "suspended"
    ? "Suspended concrete slab — post-tensioned"
    : "Concrete slab on ground — waffle pod, N32";
  push("trade_works", "Concrete", slabDesc, "m²", gfa, slabRate, "AS 3600", "AS 3600");
  push("trade_works", "Concrete", "Strip footings — 450×300 reinforced N25", "lm", perim, 195, "External wall line footing", "AS 3600");

  // Masonry
  const brickRate = data.wall_construction === "double_brick" ? 465 : 280;
  const brickDesc = data.wall_construction === "double_brick"
    ? "Double brick cavity wall — 230mm"
    : "Brick veneer external wall — 110mm single leaf";
  push("trade_works", "Masonry", brickDesc, "m²", extWallArea, brickRate, "External envelope", "AS 3700");

  // Roof structure
  const roofFrameDesc = data.roof_type === "skillion" || data.roof_type === "flat"
    ? "Engineered roof rafters — skillion/flat"
    : "Timber roof trusses — prefabricated";
  push("trade_works", "Roof Structure", roofFrameDesc, "m²", gfa * storeys, 98, "Plan area basis", "AS 1684");
  push("trade_works", "Roofing", "Colorbond metal roofing — Lysaght Kliplok/Trimdek", "m²", roofArea, 112, "Includes sarking, ridge, flashings", "AS 1562.1");
  push("trade_works", "Roofing", "Roof sarking — reflective foil laminate", "m²", roofArea, 18, "NCC energy compliance", "AS/NZS 4200");
  push("trade_works", "Roofing", "Gutters & fascia — Colorbond", "lm", perim, 130, "", "AS/NZS 3500.3");
  push("trade_works", "Roofing", "Downpipes — Colorbond 90×90 sq", "no.", Math.max(2, Math.round(perim / 20)), 395, "1 per 20m eaves", "AS/NZS 3500.3");
  push("trade_works", "Roofing", "Eaves lining — 4.5mm FC sheet, painted", "m²", perim * 0.45, 75, "450mm eaves width", "");

  // External cladding & openings
  push("trade_works", "External Cladding", "Render & acrylic texture coat (rendered sections)", "m²", extWallArea * 0.35, 195, "35% of external wall rendered", "");
  push("trade_works", "Windows", "Aluminium windows — double-glazed 6-12-6 IGU", "m²", windowArea, 1_285, `${windows} windows × ${avgWindowArea}m² avg`, "AS 2047 / NCC J");
  push("trade_works", "External Doors", "External hinged doors — solid core, keyed entry", "no.", extDoors, 3_200, "", "AS 1905.1");
  if (garageDoors > 0) {
    push("trade_works", "External Doors", "Panel lift garage door — Colorbond + motor", "no.", garageDoors, 4_500, "", "AS 5511");
  }

  // Waterproofing
  push("trade_works", "Waterproofing", "Wet area waterproofing membrane — AS 3740", "m²", wetAreaM2 * 1.5, 110, "Floor + 1.8m wall upstand", "AS 3740");

  // Framing & linings
  push("trade_works", "Framing", "Timber wall framing — 90×45 MGP10 stud", "m²", (extWallArea + intWallArea) * 0.5, 72, "Wall area both sides / 2", "AS 1684");
  push("trade_works", "Plasterboard", "Plasterboard wall lining — 13mm standard", "m²", intWallArea, 78, "Internal wall both faces", "AS/NZS 2588");
  if (isCommercial) {
    push("trade_works", "Plasterboard", "Plasterboard — 13mm fire-rated party wall (FRL 60/60/60)", "m²", extWallArea * 0.2, 128, "20% of external wall", "AS 1530.4");
  }
  push("trade_works", "Plasterboard", "Plasterboard ceilings — 10mm standard", "m²", dryCeilArea, 68, "", "AS/NZS 2588");
  push("trade_works", "Plasterboard", "Cornice — 55mm cove", "lm", (gfa * 2.2), 24, "~2.2× GFA for room perimeters", "");

  // Internal doors
  push("trade_works", "Internal Doors", "Hollow core flush door — 820w, painted, with hardware", "no.", intDoors, 850, "", "AS 1905.1");

  // Stairs (if multi-storey)
  if (storeys > 1) {
    push("trade_works", "Stairs", "Timber stair — hardwood stringers, pine treads (per flight)", "flight", storeys - 1, 10_500, "", "AS 1657");
    push("trade_works", "Stairs", "Steel/glass balustrade — 1100mm high", "lm", 8 * (storeys - 1), 1_100, "8lm per flight", "AS 1170.1");
  }

  // Floor finishes
  push("trade_works", "Floor Finishes", "Wet area floor tiles — porcelain 300×300, slip-rated R10+", "m²", wetAreaM2, 155, "Bathrooms, laundry", "AS 4586 / AS 3958.1");
  push("trade_works", "Floor Finishes", "Engineered timber flooring — living areas", "m²", (gfa - wetAreaM2) * 0.55, 195, "~55% of non-wet areas", "");
  push("trade_works", "Floor Finishes", "Carpet — bedrooms & hallways", "m²", (gfa - wetAreaM2) * 0.35, 95, "~35% of non-wet areas", "");

  // Wall tiling (wet areas)
  push("trade_works", "Wall Finishes", "Wall tiles — ceramic/porcelain 300×600 (wet areas)", "m²", wallTileArea, 135, `${bathrooms} bathrooms`, "AS 3958.1");

  // Joinery (provisional sums in PC Items, but rough-in quantities here)
  // Insulation
  push("trade_works", "Insulation", "Wall batts — R2.5 glasswool (Climate Zone 6 Melbourne)", "m²", extWallArea, 32, "NCC Section J — CZ6 minimum", "NCC Section J");
  push("trade_works", "Insulation", "Ceiling batts — R5.0 glasswool", "m²", gfa, 26, "NCC CZ6 minimum R-value", "NCC Section J");

  // Painting
  push("trade_works", "Painting", "Interior painting — walls & ceilings (2 coats)", "m²", gfa, 28, "Per m² GFA (~4× wall multiplier in rate)", "AS/NZS 2311");
  push("trade_works", "Painting", "Exterior painting — walls & eaves", "m²", extWallArea, 40, "", "AS/NZS 2311");

  // Hydraulics
  push("trade_works", "Hydraulics", "Plumbing rough-in — hot, cold, waste, stormwater", "m²", gfa, 185, "Complete new dwelling", "AS/NZS 3500");
  push("trade_works", "Hydraulics", "Plumbing fit-off — fixtures", "fixture", bathrooms * 6 + 4, 1_650, `${bathrooms} bathrooms + kitchen + laundry`, "AS/NZS 3500");

  // HVAC
  push("trade_works", "HVAC", "Ducted reverse-cycle air conditioning — multi-zone", "item", 1, 18_500, `Sized for ${gfa}m² GFA`, "AS/NZS 3823");
  push("trade_works", "HVAC", "Mechanical ventilation — kitchen exhaust, bathroom fans", "m²", gfa, 18, "NCC Section F4", "NCC F4");

  // Electrical
  push("trade_works", "Electrical", "Electrical services — complete new dwelling", "m²", gfa, 165, "Power, lighting, switchboard, meter box", "AS/NZS 3000");

  // Fire protection (smoke alarms required for all NCC classes)
  const alarmCount = bedrooms + Math.ceil(gfa / 50);
  push("trade_works", "Fire Protection", "Smoke alarms — interlinked mains-powered NCC 3.7.2.3", "no.", alarmCount, 265, "", "AS 3786");
  if (isCommercial) {
    push("trade_works", "Fire Protection", "Fire sprinkler system — AS 2118.1", "m²", gfa, 95, "", "AS 2118.1");
    push("trade_works", "Fire Protection", "Fire hose reel — stainless 36m", "no.", Math.max(1, Math.ceil(gfa / 800)), 3_200, "1 per 800m² GFA", "AS 2441");
    push("trade_works", "Fire Protection", "Fire indicator panel (FIP) — conventional zone", "item", 1, 14_500, "", "AS 1670.1");
  }

  // External works
  push("trade_works", "External Works", "External concrete paths & paving", "m²", gfa * 0.15, 135, "15% of GFA for paths", "");
  push("trade_works", "External Works", "Colorbond fencing — 1800mm H", "lm", perim * 0.5, 245, "50% site perimeter", "");

  // Preliminaries (calculated as % of Trade Works subtotal)
  const tradeWorksSubtotal = items
    .filter((i) => i.section === "trade_works")
    .reduce((s, i) => s + i.amount, 0);
  const prelimRate = 0.10;
  items.unshift({
    section: "trade_works",
    trade: "Preliminary & General",
    description: "Project preliminaries — site establishment, supervision, temp services, insurances",
    unit: "%",
    quantity: prelimRate * 100,
    rate: tradeWorksSubtotal / 100,
    amount: Math.round(tradeWorksSubtotal * prelimRate * 100) / 100,
    notes: `10% of trade works ($${tradeWorksSubtotal.toLocaleString("en-AU")})`,
    sort_order: 1,
    as_standard: "",
  });
  // Adjust sort orders
  items.forEach((item, idx) => { item.sort_order = idx + 1; });
  order = items.length;

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2 — PC ITEMS
  // ──────────────────────────────────────────────────────────────────────────
  const pc = (trade: string, desc: string, unit: string, qty: number, rate: number, notes = "") =>
    push("pc_items", trade, desc, unit, qty, rate, notes);

  pc("Kitchen", "Kitchen appliances — PC allowance (oven, cooktop, dishwasher, rangehood)", "item", 1, 8_500, "Client to select. Adjust to spec.");
  pc("Plumbing", "Bathroom fixtures & fittings — PC allowance per bathroom", "no.", bathrooms, 4_200, "Toilet, basin, tapware, shower screen, towel rails");
  pc("Plumbing", "Laundry fixtures & taps — PC allowance", "item", 1, 2_200, "Trough, tapware, dryer provision");
  pc("Plumbing", "Hot water system — heat pump 270L (PC allowance)", "item", 1, 5_200, "Rheem HydroHeat or equiv. AS/NZS 4234");
  pc("Electrical", "External lighting — PC allowance", "item", 1, 2_800, "Driveway, alfresco, entry");
  pc("External Works", "Driveway — concrete/paving PC allowance", "item", 1, 6_500, "Adjust for area and finish");
  pc("External Works", "Letterbox & house numbers — PC allowance", "item", 1, 1_100, "Feature masonry or metal");
  pc("HVAC", "Clothesline — Hills Rotary or wall mounted", "item", 1, 450, "");

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3 — PROVISIONAL SUMS
  // ──────────────────────────────────────────────────────────────────────────
  const ps = (trade: string, desc: string, unit: string, qty: number, rate: number, notes = "") =>
    push("provisional_sums", trade, desc, unit, qty, rate, notes);

  ps("Consulting", "Soil test & geotechnical report", "item", 1, 3_500, "Required for footing design");
  ps("Consulting", "Site survey — contour & detail", "item", 1, 2_800, "Required for planning permit");
  ps("Consulting", "Structural engineer — design & inspections", "item", 1, 4_500, "Includes footing design, frame inspection");
  ps("Consulting", "Energy rater — NatHERS 7-star assessment", "item", 1, 1_800, "NCC 2022 7-star minimum");
  ps("Joinery", "Kitchen cabinetry — PS allowance (polyurethane doors, stone bench)", "item", 1, 28_000, "Adjust to specification. Appliances separate.");
  ps("Joinery", "Bathroom vanities — PS allowance per bathroom", "no.", bathrooms, 4_200, "Includes vanity, stone top, mirror cabinet");
  ps("Joinery", "Walk-in robe fitout — melamine shelving PS", "no.", bedrooms, 2_800, "Per bedroom with WIR");
  ps("Earthworks", "Rock breaking & extra excavation — PS allowance", "item", 1, 8_000, "Activate if geotech shows rock");
  ps("Hydraulics", "Stormwater retention/detention — WSUD PS", "item", 1, 6_500, "Council-specific requirement");
  ps("External Works", "Landscaping — turf, plants, irrigation", "item", 1, 12_000, "Excludes hard landscaping");
  ps("Internal", "Window furnishings — blinds/curtains PS", "item", 1, 6_500, "");

  const tradeWorksCost = items
    .filter((i) => i.section === "trade_works")
    .reduce((s, i) => s + i.amount, 0);
  const pcCost = items.filter((i) => i.section === "pc_items").reduce((s, i) => s + i.amount, 0);
  const psCost = items.filter((i) => i.section === "provisional_sums").reduce((s, i) => s + i.amount, 0);

  const builderMarginBase = tradeWorksCost + pcCost;
  ps("Margin", "Builder's profit & overheads (15% on trade + PC)", "item", 1, builderMarginBase * 0.15, "15% builders margin");
  const contingencyBase = tradeWorksCost + pcCost + psCost;
  ps("Contingency", "Contingency allowance (10%)", "item", 1, contingencyBase * 0.10, "Standard 10% design contingency");

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4 — COMPLIANCE
  // ──────────────────────────────────────────────────────────────────────────
  const constructionCost =
    items.filter((i) => i.section !== "compliance").reduce((s, i) => s + i.amount, 0);

  const permitFee = calcVicPermitFee(constructionCost);
  push("compliance", "Compliance", "VIC Building Permit Levy — tiered (Building Regs 2018 Sch 3)", "item", 1, permitFee, `Based on $${constructionCost.toLocaleString("en-AU")} construction cost`, "VIC Building Regs 2018");
  push("compliance", "Compliance", "CoINVEST LSL Levy — 0.35% (Portable Long Service Leave)", "item", 1, calcLslLevy(constructionCost), "CoINVEST VIC — all construction workers", "LSL Act 2018 VIC");
  push("compliance", "Compliance", "Contract Works Insurance — 0.20% of insured value", "item", 1, calcContractWorksInsurance(constructionCost), "Insured value = construction cost", "");
  push("compliance", "Compliance", "Private Building Surveyor — inspection fees", "item", 1, calcPbsFee(constructionCost), "Building permit, mandatory inspections, OC", "VIC Building Act 1993");
  push("compliance", "Compliance", "WorkSafe DBI Insurance Levy — 1.272% of labour", "item", 1, calcWorksafeDbi(constructionCost), "40% labour component assumed", "VIC WorkSafe Act");
  push("compliance", "Compliance", "Occupancy Permit / Certificate of Final Inspection", "item", 1, 650, "Council fee", "VIC Building Act 1993");

  return items;
}

export function calcEstimateTotals(items: EstimateItem[]) {
  const bySection = (s: EstimateItem["section"]) =>
    items.filter((i) => i.section === s).reduce((acc, i) => acc + i.amount, 0);

  const tradeWorks = bySection("trade_works");
  const pcItems = bySection("pc_items");
  const provisionalSums = bySection("provisional_sums");
  const compliance = bySection("compliance");
  const total = tradeWorks + pcItems + provisionalSums + compliance;

  return { tradeWorks, pcItems, provisionalSums, compliance, total };
}

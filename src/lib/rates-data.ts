import type { RateRecord } from "@/types";

export const MELBOURNE_RATES: Omit<RateRecord, "id" | "updated_at">[] = [
  // ─── EARTHWORKS & DEMOLITION ───────────────────────────────────────────────
  { trade: "Demolition", description: "Demolish existing dwelling, remove debris off-site", unit: "m²", rate_low: 25, rate_mid: 38, rate_high: 55, notes: "Per m² GFA. Includes skip bins, council tip fees.", source: "AIQS MEL 2024", as_standard: "AS 2601" },
  { trade: "Demolition", description: "Strip out — internal fit-out only", unit: "m²", rate_low: 15, rate_mid: 22, rate_high: 35, notes: "Per m² GFA. Walls/floors/ceilings, no structure.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Earthworks", description: "Bulk excavation — platform cut, export spoil", unit: "m³", rate_low: 55, rate_mid: 75, rate_high: 110, notes: "Per m³. Includes truck/tip fees. Add 30% for rock.", source: "AIQS MEL 2024", as_standard: "AS 3798" },
  { trade: "Earthworks", description: "Site cut & fill — level to platform", unit: "m²", rate_low: 30, rate_mid: 48, rate_high: 75, notes: "Per m² GFA. Moderate fall up to 1.5m.", source: "AIQS MEL 2024", as_standard: "AS 3798" },
  { trade: "Earthworks", description: "Rock breaking — hydraulic hammer", unit: "m³", rate_low: 180, rate_mid: 245, rate_high: 380, notes: "Provisional sum rate. Requires geotech confirmation.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Earthworks", description: "Retaining wall — concrete block (up to 1.2m)", unit: "lm", rate_low: 650, rate_mid: 950, rate_high: 1_350, notes: "Per linear metre. >1.2m requires engineer design.", source: "AIQS MEL 2024", as_standard: "AS 4678" },
  { trade: "Earthworks", description: "Retaining wall — treated pine sleepers (up to 0.9m)", unit: "lm", rate_low: 380, rate_mid: 520, rate_high: 750, notes: "Per lm. Class H4 treated pine.", source: "AIQS MEL 2024", as_standard: "" },

  // ─── CONCRETE ──────────────────────────────────────────────────────────────
  { trade: "Concrete", description: "Concrete slab on ground — Class N32 reinforced (waffle pod)", unit: "m²", rate_low: 115, rate_mid: 145, rate_high: 185, notes: "Per m² GFA. Includes mesh, N32 pod slab. Excludes termite.", source: "AIQS MEL 2024", as_standard: "AS 3600" },
  { trade: "Concrete", description: "Concrete slab on ground — Class N32 conventional raft", unit: "m²", rate_low: 135, rate_mid: 165, rate_high: 210, notes: "Per m² GFA. Thickened edge raft slab.", source: "AIQS MEL 2024", as_standard: "AS 3600" },
  { trade: "Concrete", description: "Strip footings — 450×300 reinforced", unit: "lm", rate_low: 155, rate_mid: 195, rate_high: 260, notes: "Per lm of footing. N25 concrete, 2×N12 bars.", source: "AIQS MEL 2024", as_standard: "AS 3600" },
  { trade: "Concrete", description: "Pier & beam footings — 300 dia bored pier", unit: "no.", rate_low: 380, rate_mid: 550, rate_high: 780, notes: "Per pier. Includes boring, concrete, reinforcement.", source: "AIQS MEL 2024", as_standard: "AS 3600" },
  { trade: "Concrete", description: "Suspended concrete slab — post-tensioned", unit: "m²", rate_low: 280, rate_mid: 360, rate_high: 480, notes: "Per m². Multi-storey. Includes PT tendons.", source: "AIQS MEL 2024", as_standard: "AS 3600" },
  { trade: "Concrete", description: "Concrete driveway — 100mm N25 reinforced", unit: "m²", rate_low: 95, rate_mid: 135, rate_high: 185, notes: "Per m². Exposed aggregate add $25/m².", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Concrete", description: "Concrete path — 75mm N20", unit: "m²", rate_low: 75, rate_mid: 105, rate_high: 145, notes: "Per m². Side paths, alfresco.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Concrete", description: "Precast concrete stairs — domestic", unit: "flight", rate_low: 3_800, rate_mid: 5_200, rate_high: 7_500, notes: "Per flight. Standard 900w, 10 risers.", source: "AIQS MEL 2024", as_standard: "AS 1657" },

  // ─── MASONRY ───────────────────────────────────────────────────────────────
  { trade: "Masonry", description: "Brick veneer — external wall (single leaf, 110mm)", unit: "m²", rate_low: 235, rate_mid: 280, rate_high: 345, notes: "Per m² wall. Includes labour, mortar, ties. Excludes insulation.", source: "AIQS MEL 2024", as_standard: "AS 3700" },
  { trade: "Masonry", description: "Double brick cavity wall — 230mm full brick", unit: "m²", rate_low: 395, rate_mid: 465, rate_high: 565, notes: "Per m². 2 leaves 110mm brick + 50mm cavity.", source: "AIQS MEL 2024", as_standard: "AS 3700" },
  { trade: "Masonry", description: "Rendered lightweight — FC sheet + render", unit: "m²", rate_low: 145, rate_mid: 195, rate_high: 265, notes: "Per m² wall. FC sheet, texture coat, paint.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Masonry", description: "Hebel / AAC block wall — 200mm", unit: "m²", rate_low: 185, rate_mid: 235, rate_high: 295, notes: "Per m². Includes render finish.", source: "AIQS MEL 2024", as_standard: "AS 3600" },
  { trade: "Masonry", description: "Besser block (control joint masonry) — 190mm", unit: "m²", rate_low: 165, rate_mid: 215, rate_high: 285, notes: "Per m². Reinforced. Boundary/retaining walls.", source: "AIQS MEL 2024", as_standard: "AS 3700" },

  // ─── STRUCTURAL STEEL ──────────────────────────────────────────────────────
  { trade: "Structural Steel", description: "Structural steel frame — light domestic (verandah/deck post/beam)", unit: "m²", rate_low: 145, rate_mid: 210, rate_high: 320, notes: "Per m² GFA. RHS posts, UB beams, plates.", source: "AIQS MEL 2024", as_standard: "AS 4100" },
  { trade: "Structural Steel", description: "Structural steel frame — commercial portal frame", unit: "m²", rate_low: 285, rate_mid: 380, rate_high: 520, notes: "Per m² GFA. Including purlins & girts.", source: "AIQS MEL 2024", as_standard: "AS 4100" },
  { trade: "Structural Steel", description: "Steel columns — 150 UC to 310 UC", unit: "tonne", rate_low: 4_200, rate_mid: 5_800, rate_high: 8_500, notes: "Per tonne fabricated & erected.", source: "AIQS MEL 2024", as_standard: "AS 4100" },
  { trade: "Structural Steel", description: "Lintel beam — 150 UB", unit: "lm", rate_low: 185, rate_mid: 265, rate_high: 395, notes: "Per lm. Door/window openings >1.8m.", source: "AIQS MEL 2024", as_standard: "AS 4100" },

  // ─── ROOF STRUCTURE & CLADDING ─────────────────────────────────────────────
  { trade: "Roofing", description: "Timber roof framing — conventional truss system", unit: "m²", rate_low: 75, rate_mid: 98, rate_high: 130, notes: "Per m² plan area. MGP10 trusses @ 600 ctrs.", source: "AIQS MEL 2024", as_standard: "AS 1684" },
  { trade: "Roofing", description: "Timber roof framing — cut roof (rafter/hip/valley)", unit: "m²", rate_low: 95, rate_mid: 128, rate_high: 175, notes: "Per m² plan area. More complex, handcut.", source: "AIQS MEL 2024", as_standard: "AS 1684" },
  { trade: "Roofing", description: "Colorbond metal roofing — Lysaght Trimdek/Kliplok", unit: "m²", rate_low: 85, rate_mid: 112, rate_high: 155, notes: "Per m² roof area. Supply & fix, flashings, ridge.", source: "AIQS MEL 2024", as_standard: "AS 1562.1" },
  { trade: "Roofing", description: "Concrete roof tile — Monier Marseille/Elabana", unit: "m²", rate_low: 75, rate_mid: 95, rate_high: 130, notes: "Per m² roof area. Supply & fix, mortar, ridge.", source: "AIQS MEL 2024", as_standard: "AS 2049" },
  { trade: "Roofing", description: "Terracotta roof tile — Monier Dune/Federation", unit: "m²", rate_low: 105, rate_mid: 145, rate_high: 205, notes: "Per m² roof area. Supply & fix, ridge.", source: "AIQS MEL 2024", as_standard: "AS 2049" },
  { trade: "Roofing", description: "Roof sarking — reflective foil laminate (RFL)", unit: "m²", rate_low: 12, rate_mid: 18, rate_high: 25, notes: "Per m² roof area. Bradford Anticon or equiv.", source: "AIQS MEL 2024", as_standard: "AS/NZS 4200" },
  { trade: "Roofing", description: "Eaves lining — 4.5mm compressed sheet, painted", unit: "m²", rate_low: 55, rate_mid: 75, rate_high: 105, notes: "Per m². FC sheet, quad mould.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Roofing", description: "Gutters & fascia — Colorbond quad/fascia", unit: "lm", rate_low: 95, rate_mid: 130, rate_high: 185, notes: "Per lm. Includes fascia board, gutter, outlet.", source: "AIQS MEL 2024", as_standard: "AS/NZS 3500.3" },
  { trade: "Roofing", description: "Downpipes — Colorbond 90×90 sq (to 2 storeys)", unit: "no.", rate_low: 285, rate_mid: 395, rate_high: 565, notes: "Per downpipe. Includes offset, shoe, connection.", source: "AIQS MEL 2024", as_standard: "AS/NZS 3500.3" },
  { trade: "Roofing", description: "Skylight — fixed double-glazed (1200×1200)", unit: "no.", rate_low: 1_850, rate_mid: 2_650, rate_high: 4_200, notes: "Per skylight. Velux or equiv. Supply & install.", source: "AIQS MEL 2024", as_standard: "AS 4285" },

  // ─── WINDOWS & EXTERNAL DOORS ──────────────────────────────────────────────
  { trade: "Windows", description: "Aluminium sliding window — standard residential", unit: "m²", rate_low: 650, rate_mid: 875, rate_high: 1_250, notes: "Per m² window area. Powdercoated, float glass.", source: "AIQS MEL 2024", as_standard: "AS 2047" },
  { trade: "Windows", description: "Aluminium awning window — standard residential", unit: "m²", rate_low: 700, rate_mid: 950, rate_high: 1_350, notes: "Per m² window area. Powdercoated, float glass.", source: "AIQS MEL 2024", as_standard: "AS 2047" },
  { trade: "Windows", description: "Aluminium casement window — standard residential", unit: "m²", rate_low: 720, rate_mid: 985, rate_high: 1_400, notes: "Per m² window area. Powdercoated, float glass.", source: "AIQS MEL 2024", as_standard: "AS 2047" },
  { trade: "Windows", description: "Double-glazed window unit (6-12-6 IGU)", unit: "m²", rate_low: 950, rate_mid: 1_285, rate_high: 1_750, notes: "Per m². Premium thermal performance. NCC Section J.", source: "AIQS MEL 2024", as_standard: "AS 4667" },
  { trade: "Windows", description: "Bi-fold door — aluminium, double-glazed", unit: "m²", rate_low: 1_450, rate_mid: 1_950, rate_high: 2_850, notes: "Per m². 4+ panel, internal/alfresco opening.", source: "AIQS MEL 2024", as_standard: "AS 2047" },
  { trade: "Windows", description: "Sliding stacker door — aluminium, double-glazed", unit: "m²", rate_low: 1_200, rate_mid: 1_650, rate_high: 2_400, notes: "Per m².", source: "AIQS MEL 2024", as_standard: "AS 2047" },
  { trade: "External Doors", description: "Hinged external entry door — solid core, keyed", unit: "no.", rate_low: 2_200, rate_mid: 3_200, rate_high: 5_500, notes: "Per door. Includes frame, hardware, deadbolt.", source: "AIQS MEL 2024", as_standard: "AS 1905.1" },
  { trade: "External Doors", description: "Hinged external entry door — feature/pivot (steel/timber)", unit: "no.", rate_low: 4_500, rate_mid: 7_500, rate_high: 14_000, notes: "Per door. Premium entry. Locksmith hardware.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "External Doors", description: "Panel lift garage door — Colorbond, single (2440w)", unit: "no.", rate_low: 2_800, rate_mid: 3_800, rate_high: 5_500, notes: "Per door. Includes motor, remote, safety.", source: "AIQS MEL 2024", as_standard: "AS 5511" },
  { trade: "External Doors", description: "Panel lift garage door — Colorbond, double (5000w)", unit: "no.", rate_low: 4_500, rate_mid: 6_200, rate_high: 8_500, notes: "Per door. Includes motor, remote, safety.", source: "AIQS MEL 2024", as_standard: "AS 5511" },

  // ─── INTERNAL FITOUT ───────────────────────────────────────────────────────
  { trade: "Framing", description: "Timber wall framing — 90×45 MGP10 stud @ 450 ctrs", unit: "m²", rate_low: 55, rate_mid: 72, rate_high: 95, notes: "Per m² wall elevation. Labour + material.", source: "AIQS MEL 2024", as_standard: "AS 1684" },
  { trade: "Framing", description: "Steel stud framing — 64mm Rondo", unit: "m²", rate_low: 65, rate_mid: 88, rate_high: 118, notes: "Per m² wall elevation. Commercial/Class 2+.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Plasterboard", description: "Plasterboard wall lining — 13mm standard single layer", unit: "m²", rate_low: 58, rate_mid: 78, rate_high: 102, notes: "Per m². Includes set, sand, prime ready for paint.", source: "AIQS MEL 2024", as_standard: "AS/NZS 2588" },
  { trade: "Plasterboard", description: "Plasterboard ceiling — 10mm standard single layer", unit: "m²", rate_low: 52, rate_mid: 68, rate_high: 92, notes: "Per m². Includes set, sand. Bulkheads extra.", source: "AIQS MEL 2024", as_standard: "AS/NZS 2588" },
  { trade: "Plasterboard", description: "Plasterboard — 13mm fire-rated (FRL 60/60/60)", unit: "m²", rate_low: 95, rate_mid: 128, rate_high: 175, notes: "Per m². Class 2/3+ party walls, penetrations.", source: "AIQS MEL 2024", as_standard: "AS 1530.4" },
  { trade: "Plasterboard", description: "Cornice — 55mm cove", unit: "lm", rate_low: 18, rate_mid: 24, rate_high: 35, notes: "Per lm. Supply and fix, painted.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Internal Doors", description: "Hollow core flush door — 820w, painted", unit: "no.", rate_low: 650, rate_mid: 850, rate_high: 1_200, notes: "Per door. Includes frame, jambs, lever handle.", source: "AIQS MEL 2024", as_standard: "AS 1905.1" },
  { trade: "Internal Doors", description: "Solid core flush door — 820w, painted", unit: "no.", rate_low: 950, rate_mid: 1_250, rate_high: 1_750, notes: "Per door. Better acoustic performance.", source: "AIQS MEL 2024", as_standard: "AS 1905.1" },
  { trade: "Internal Doors", description: "Cavity sliding door — 820w, single", unit: "no.", rate_low: 1_200, rate_mid: 1_600, rate_high: 2_200, notes: "Per door. Includes cavity frame kit.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Internal Doors", description: "Barn door — timber, 820w, track hardware", unit: "no.", rate_low: 1_500, rate_mid: 2_100, rate_high: 3_200, notes: "Per door. Includes track, rollers, guide.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Stairs", description: "Timber stairs — hardwood stringers, pine treads", unit: "flight", rate_low: 7_500, rate_mid: 10_500, rate_high: 15_000, notes: "Per flight (up to 12 risers). Handrail extra.", source: "AIQS MEL 2024", as_standard: "AS 1657" },
  { trade: "Stairs", description: "Timber stairs — premium (spotted gum/vic ash)", unit: "flight", rate_low: 12_000, rate_mid: 18_000, rate_high: 28_000, notes: "Per flight. Open riser, feature stair.", source: "AIQS MEL 2024", as_standard: "AS 1657" },
  { trade: "Stairs", description: "Steel/glass balustrade — 1100mm high", unit: "lm", rate_low: 750, rate_mid: 1_100, rate_high: 1_650, notes: "Per lm. Frameless glass extra.", source: "AIQS MEL 2024", as_standard: "AS 1170.1" },

  // ─── FLOOR FINISHES ────────────────────────────────────────────────────────
  { trade: "Floor Finishes", description: "Porcelain floor tiles — 600×600 (non-wet areas)", unit: "m²", rate_low: 95, rate_mid: 135, rate_high: 195, notes: "Per m². Includes adhesive, grout, levelling compound.", source: "AIQS MEL 2024", as_standard: "AS 3958.1" },
  { trade: "Floor Finishes", description: "Engineered timber flooring — 1200mm board", unit: "m²", rate_low: 145, rate_mid: 195, rate_high: 285, notes: "Per m². Supply & fix, incl. underlay.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Floor Finishes", description: "Solid hardwood flooring — spotted gum / vic ash", unit: "m²", rate_low: 195, rate_mid: 265, rate_high: 385, notes: "Per m². Sand & finish extra $35-50/m².", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Floor Finishes", description: "Carpet — polypropylene loop pile with underlay", unit: "m²", rate_low: 65, rate_mid: 95, rate_high: 145, notes: "Per m². Includes underlay, gripper, fitting.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Floor Finishes", description: "Luxury vinyl plank (LVP) — 4mm wear layer", unit: "m²", rate_low: 55, rate_mid: 80, rate_high: 125, notes: "Per m². Floating installation. Waterproof.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Floor Finishes", description: "Wet area floor tiles — porcelain, 300×300, slip-rated", unit: "m²", rate_low: 115, rate_mid: 155, rate_high: 225, notes: "Per m². R10+ slip rating. Includes waterproofing.", source: "AIQS MEL 2024", as_standard: "AS 4586" },

  // ─── WALL FINISHES ─────────────────────────────────────────────────────────
  { trade: "Wall Finishes", description: "Wall tiles — ceramic/porcelain 300×600", unit: "m²", rate_low: 95, rate_mid: 135, rate_high: 195, notes: "Per m². Adhesive, grout, edging trims.", source: "AIQS MEL 2024", as_standard: "AS 3958.1" },
  { trade: "Wall Finishes", description: "Stone feature wall — travertine/marble cladding", unit: "m²", rate_low: 285, rate_mid: 425, rate_high: 650, notes: "Per m². Internal feature. Adhesive fix.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Waterproofing", description: "Wet area waterproofing — membrane to AS 3740", unit: "m²", rate_low: 75, rate_mid: 110, rate_high: 155, notes: "Per m². Shower recess, bath surround, laundry. 2-coat system.", source: "AIQS MEL 2024", as_standard: "AS 3740" },
  { trade: "Waterproofing", description: "External deck waterproofing — trafficable membrane", unit: "m²", rate_low: 145, rate_mid: 195, rate_high: 285, notes: "Per m². Includes substrate prep, membrane, screed.", source: "AIQS MEL 2024", as_standard: "AS 4654.2" },

  // ─── JOINERY ───────────────────────────────────────────────────────────────
  { trade: "Joinery", description: "Kitchen cabinetry — polyurethane doors, 20mm stone benchtop", unit: "item", rate_low: 18_000, rate_mid: 28_000, rate_high: 45_000, notes: "Per kitchen. Medium/large. Stone benchtops included.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Joinery", description: "Kitchen cabinetry — laminate doors, 20mm stone benchtop", unit: "item", rate_low: 12_000, rate_mid: 18_000, rate_high: 28_000, notes: "Per kitchen. Entry/mid level.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Joinery", description: "Bathroom vanity — 900mm, 1 basin, mirror cabinet", unit: "no.", rate_low: 2_800, rate_mid: 4_200, rate_high: 6_500, notes: "Per vanity unit. Includes stone top, tapware.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Joinery", description: "Walk-in robe fitout — melamine shelving", unit: "m²", rate_low: 650, rate_mid: 950, rate_high: 1_450, notes: "Per m² of WIR floor area.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Joinery", description: "Built-in wardrobe — sliding doors, internal shelving", unit: "lm", rate_low: 1_200, rate_mid: 1_750, rate_high: 2_600, notes: "Per lm of wardrobe width.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Joinery", description: "Laundry cabinetry — 1500mm, trough, overhead", unit: "item", rate_low: 2_800, rate_mid: 4_200, rate_high: 6_500, notes: "Per laundry fit-out. Includes trough, overhead cabinets.", source: "AIQS MEL 2024", as_standard: "" },

  // ─── INSULATION ────────────────────────────────────────────────────────────
  { trade: "Insulation", description: "Wall batts — R2.0 glasswool (external walls)", unit: "m²", rate_low: 18, rate_mid: 26, rate_high: 38, notes: "Per m² wall. Bradford Gold or equiv. NCC Section J.", source: "AIQS MEL 2024", as_standard: "NCC Section J" },
  { trade: "Insulation", description: "Wall batts — R2.5 glasswool (external walls)", unit: "m²", rate_low: 22, rate_mid: 32, rate_high: 46, notes: "Per m² wall. Required Climate Zone 6 (Melbourne).", source: "AIQS MEL 2024", as_standard: "NCC Section J" },
  { trade: "Insulation", description: "Ceiling batts — R5.0 glasswool", unit: "m²", rate_low: 18, rate_mid: 26, rate_high: 38, notes: "Per m² ceiling. NCC minimum for Mel CZ6.", source: "AIQS MEL 2024", as_standard: "NCC Section J" },
  { trade: "Insulation", description: "Ceiling batts — R6.0 glasswool (upgraded)", unit: "m²", rate_low: 22, rate_mid: 32, rate_high: 46, notes: "Per m² ceiling. Above NatHERS minimum.", source: "AIQS MEL 2024", as_standard: "NCC Section J" },
  { trade: "Insulation", description: "Underfloor insulation — R2.5 polyester (suspended floor)", unit: "m²", rate_low: 28, rate_mid: 40, rate_high: 58, notes: "Per m² floor. Clips & netting included.", source: "AIQS MEL 2024", as_standard: "NCC Section J" },
  { trade: "Insulation", description: "Rigid foam insulation board — 50mm XPS (slab edge)", unit: "lm", rate_low: 28, rate_mid: 42, rate_high: 62, notes: "Per lm perimeter. Slab edge thermal break.", source: "AIQS MEL 2024", as_standard: "NCC Section J" },

  // ─── PAINTING ──────────────────────────────────────────────────────────────
  { trade: "Painting", description: "Interior painting — walls & ceilings (2 coats)", unit: "m²", rate_low: 20, rate_mid: 28, rate_high: 42, notes: "Per m² floor area. ~4× multiplier for wall area.", source: "AIQS MEL 2024", as_standard: "AS/NZS 2311" },
  { trade: "Painting", description: "Interior painting — premium (3 coats, dark colours)", unit: "m²", rate_low: 30, rate_mid: 42, rate_high: 62, notes: "Per m² floor area. Designer finishes.", source: "AIQS MEL 2024", as_standard: "AS/NZS 2311" },
  { trade: "Painting", description: "Exterior painting — walls (1 prime, 2 topcoat)", unit: "m²", rate_low: 28, rate_mid: 40, rate_high: 62, notes: "Per m² wall area. Excludes windows.", source: "AIQS MEL 2024", as_standard: "AS/NZS 2311" },
  { trade: "Painting", description: "Exterior painting — feature render/texture coat", unit: "m²", rate_low: 35, rate_mid: 52, rate_high: 78, notes: "Per m². Texture coat or Dulux AcraTex.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Painting", description: "Stain & seal — hardwood floors (3 coats polyurethane)", unit: "m²", rate_low: 28, rate_mid: 40, rate_high: 58, notes: "Per m² floor area. Includes sand & prep.", source: "AIQS MEL 2024", as_standard: "" },

  // ─── PLUMBING / HYDRAULICS ─────────────────────────────────────────────────
  { trade: "Hydraulics", description: "Plumbing rough-in — complete new dwelling", unit: "m²", rate_low: 145, rate_mid: 185, rate_high: 250, notes: "Per m² GFA. Hot, cold, waste, stormwater.", source: "AIQS MEL 2024", as_standard: "AS/NZS 3500" },
  { trade: "Hydraulics", description: "Plumbing fit-off — fixtures per item", unit: "fixture", rate_low: 1_200, rate_mid: 1_650, rate_high: 2_400, notes: "Per fixture. Toilet, basin, shower, bath, sink, tap.", source: "AIQS MEL 2024", as_standard: "AS/NZS 3500" },
  { trade: "Hydraulics", description: "Hot water system — heat pump 270L (A-rated)", unit: "item", rate_low: 3_800, rate_mid: 5_200, rate_high: 7_500, notes: "Per system. Incl. controller, electrical connection.", source: "AIQS MEL 2024", as_standard: "AS/NZS 4234" },
  { trade: "Hydraulics", description: "Hot water system — gas continuous flow 26L/min", unit: "item", rate_low: 2_200, rate_mid: 3_200, rate_high: 4_800, notes: "Per system. Rheem/Rinnai, incl. flue.", source: "AIQS MEL 2024", as_standard: "AS 3814" },
  { trade: "Hydraulics", description: "Rainwater tank — 5000L poly w/ pump to toilet/laundry", unit: "item", rate_low: 3_500, rate_mid: 5_200, rate_high: 7_800, notes: "Per system. Incl. pump, plumbing connections.", source: "AIQS MEL 2024", as_standard: "AS/NZS 3500.1" },
  { trade: "Hydraulics", description: "Stormwater retention/detention system", unit: "item", rate_low: 3_800, rate_mid: 6_500, rate_high: 12_000, notes: "Provisional. Council WSUD requirement.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Hydraulics", description: "Sewer connection — new dwelling to existing main", unit: "item", rate_low: 4_500, rate_mid: 6_800, rate_high: 12_000, notes: "Per connection. Includes permit, inspection.", source: "AIQS MEL 2024", as_standard: "AS/NZS 3500.2" },

  // ─── MECHANICAL / HVAC ─────────────────────────────────────────────────────
  { trade: "HVAC", description: "Ducted reverse-cycle air conditioning — 3-zone", unit: "item", rate_low: 12_000, rate_mid: 18_500, rate_high: 28_000, notes: "Per system. Up to 250m² home. Daikin/Actron.", source: "AIQS MEL 2024", as_standard: "AS/NZS 3823" },
  { trade: "HVAC", description: "Split system air conditioning — 2.5-5kW wall unit", unit: "no.", rate_low: 2_200, rate_mid: 3_200, rate_high: 4_800, notes: "Per unit. Installed, electrical connection.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "HVAC", description: "Hydronic heating — radiator panel system", unit: "m²", rate_low: 185, rate_mid: 245, rate_high: 345, notes: "Per m² GFA. Gas boiler, radiators, pipework.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "HVAC", description: "Gas ducted heating — evaporative cooling combo", unit: "item", rate_low: 9_500, rate_mid: 13_500, rate_high: 19_500, notes: "Per system. 2+ systems for large homes.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "HVAC", description: "Mechanical ventilation — kitchen exhaust & bathroom fans", unit: "m²", rate_low: 12, rate_mid: 18, rate_high: 28, notes: "Per m² GFA. NCC Section F4 compliant.", source: "AIQS MEL 2024", as_standard: "NCC F4" },
  { trade: "HVAC", description: "ERV/HRV whole-house ventilation system", unit: "item", rate_low: 4_500, rate_mid: 6_800, rate_high: 10_500, notes: "Per system. Passive House / high-performance.", source: "AIQS MEL 2024", as_standard: "" },

  // ─── ELECTRICAL ────────────────────────────────────────────────────────────
  { trade: "Electrical", description: "Electrical services — complete new dwelling", unit: "m²", rate_low: 125, rate_mid: 165, rate_high: 225, notes: "Per m² GFA. Power, lighting, switchboard, meter.", source: "AIQS MEL 2024", as_standard: "AS/NZS 3000" },
  { trade: "Electrical", description: "Solar PV system — 6.6kW (18 × 370W panels)", unit: "item", rate_low: 6_500, rate_mid: 9_800, rate_high: 14_500, notes: "Per system. Incl. inverter, wiring, grid connect.", source: "AIQS MEL 2024", as_standard: "AS/NZS 5033" },
  { trade: "Electrical", description: "Solar battery storage — 10kWh (Powerwall/Sungrow)", unit: "item", rate_low: 11_000, rate_mid: 15_500, rate_high: 22_000, notes: "Per system. Installed, BMS, wiring.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Electrical", description: "EV car charger — Level 2 (7.2kW wall charger)", unit: "no.", rate_low: 1_800, rate_mid: 2_600, rate_high: 4_200, notes: "Per charger. Includes dedicated circuit, conduit.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Electrical", description: "Smart home wiring — lighting controls, CAT6, security", unit: "m²", rate_low: 35, rate_mid: 52, rate_high: 85, notes: "Per m² GFA. Lutron/Clipsal C-Bus or equiv.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "Electrical", description: "Security system — alarm, CCTV (4 cameras), intercom", unit: "item", rate_low: 4_500, rate_mid: 6_800, rate_high: 12_000, notes: "Per system. Monitored alarm.", source: "AIQS MEL 2024", as_standard: "" },

  // ─── FIRE PROTECTION ───────────────────────────────────────────────────────
  { trade: "Fire Protection", description: "Smoke alarms — interlinked mains-powered (per NCC)", unit: "no.", rate_low: 185, rate_mid: 265, rate_high: 385, notes: "Per alarm. NCC 3.7.2.3 & AS 3786.", source: "AIQS MEL 2024", as_standard: "AS 3786" },
  { trade: "Fire Protection", description: "Fire sprinkler system — residential NFPA 13R", unit: "m²", rate_low: 38, rate_mid: 55, rate_high: 82, notes: "Per m² GFA. Class 2/3 buildings.", source: "AIQS MEL 2024", as_standard: "AS 2118.4" },
  { trade: "Fire Protection", description: "Fire sprinkler system — commercial AS 2118.1", unit: "m²", rate_low: 65, rate_mid: 95, rate_high: 145, notes: "Per m² GFA. Class 5-9 buildings.", source: "AIQS MEL 2024", as_standard: "AS 2118.1" },
  { trade: "Fire Protection", description: "Fire hose reel — stainless 36m", unit: "no.", rate_low: 2_200, rate_mid: 3_200, rate_high: 4_800, notes: "Per hose reel. Class 5-9 buildings.", source: "AIQS MEL 2024", as_standard: "AS 2441" },
  { trade: "Fire Protection", description: "Portable fire extinguisher — 4.5kg ABE + bracket", unit: "no.", rate_low: 185, rate_mid: 265, rate_high: 385, notes: "Per extinguisher.", source: "AIQS MEL 2024", as_standard: "AS/NZS 1841" },
  { trade: "Fire Protection", description: "Fire indicator panel (FIP) — conventional zone", unit: "item", rate_low: 8_500, rate_mid: 14_500, rate_high: 22_000, notes: "Per system. Class 2/3 building.", source: "AIQS MEL 2024", as_standard: "AS 1670.1" },

  // ─── EXTERNAL WORKS ────────────────────────────────────────────────────────
  { trade: "External Works", description: "Colorbond fencing — 1800mm H, includes posts", unit: "lm", rate_low: 185, rate_mid: 245, rate_high: 335, notes: "Per lm. BladeForce or equiv. Galv posts.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "External Works", description: "Timber paling fence — 1800mm H, hardwood", unit: "lm", rate_low: 145, rate_mid: 195, rate_high: 285, notes: "Per lm. H4 treated posts, hardwood rails.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "External Works", description: "Timber deck — hardwood, elevated <1.8m", unit: "m²", rate_low: 550, rate_mid: 750, rate_high: 1_100, notes: "Per m². 90×19 decking, posts, bearers, joists.", source: "AIQS MEL 2024", as_standard: "AS 1720.1" },
  { trade: "External Works", description: "Alfresco pergola — steel posts, timber beams, polycarbonate", unit: "m²", rate_low: 650, rate_mid: 950, rate_high: 1_450, notes: "Per m². Includes footing, posts, structure, roof.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "External Works", description: "Landscaping — soft landscaping, turf, plants", unit: "m²", rate_low: 65, rate_mid: 95, rate_high: 155, notes: "Per m² of landscaped area.", source: "AIQS MEL 2024", as_standard: "" },
  { trade: "External Works", description: "Swimming pool — concrete in-ground (standard 8×4m)", unit: "item", rate_low: 55_000, rate_mid: 80_000, rate_high: 135_000, notes: "Per pool. Fibreglass cheaper. Heating/fencing extra.", source: "AIQS MEL 2024", as_standard: "AS 1926.1" },
  { trade: "External Works", description: "Letterbox & house numbers — feature masonry", unit: "item", rate_low: 650, rate_mid: 1_100, rate_high: 2_200, notes: "Per item. Includes footing.", source: "AIQS MEL 2024", as_standard: "" },
];

export function getRatesByTrade(trade: string): typeof MELBOURNE_RATES {
  return MELBOURNE_RATES.filter((r) => r.trade.toLowerCase() === trade.toLowerCase());
}

export function searchRates(query: string): typeof MELBOURNE_RATES {
  const q = query.toLowerCase();
  return MELBOURNE_RATES.filter(
    (r) =>
      r.trade.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.notes.toLowerCase().includes(q) ||
      (r.as_standard || "").toLowerCase().includes(q)
  );
}

export const TRADE_CATEGORIES = [...new Set(MELBOURNE_RATES.map((r) => r.trade))].sort();

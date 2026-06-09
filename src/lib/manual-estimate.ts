export const PROJECT_TYPES = [
  { id: 'residential',  label: 'Residential',       icon: '🏠', subtypes: ['New House', 'Renovation / Extension', 'Knock Down Rebuild', 'Dual Occupancy'] },
  { id: 'multires',     label: 'Multi-Residential',  icon: '🏢', subtypes: ['Townhouses', 'Apartments (Class 2)', 'Aged Care', 'Student Accommodation'] },
  { id: 'commercial',   label: 'Commercial',         icon: '🏗️', subtypes: ['Office', 'Retail', 'Mixed Use', 'Hotel / Motel'] },
  { id: 'industrial',   label: 'Industrial',         icon: '🏭', subtypes: ['Warehouse Low Bay', 'Warehouse High Bay', 'Cold Store / Freezer', 'Factory'] },
  { id: 'fitout',       label: 'Fitout',             icon: '🛋️', subtypes: ['Office Fitout', 'Retail Fitout', 'Hospitality / F&B', 'Medical / Allied Health'] },
  { id: 'tiling',       label: 'Tiling',             icon: '🔲', subtypes: ['Floor Tiling', 'Wall Tiling', 'Combined Floor & Wall'] },
  { id: 'facades',      label: 'Facades & Cladding', icon: '🏛️', subtypes: ['Brick Veneer', 'ACP Cladding', 'Curtain Wall', 'Precast Concrete'] },
] as const;

export type ProjectTypeId = typeof PROJECT_TYPES[number]['id'];
export type SpecLevel = 'entry' | 'standard' | 'mid' | 'premium' | 'highend';

export const SPEC_LEVELS: { id: SpecLevel; label: string }[] = [
  { id: 'entry',    label: 'Entry' },
  { id: 'standard', label: 'Standard' },
  { id: 'mid',      label: 'Mid' },
  { id: 'premium',  label: 'Premium' },
  { id: 'highend',  label: 'High End' },
];

export const STATE_FACTORS: Record<string, number> = {
  VIC: 1.00, NSW: 1.05, QLD: 0.95, WA: 1.08, SA: 0.92, ACT: 1.10, NT: 1.15, TAS: 0.97,
};

export const SITE_OPTIONS = [
  { id: 'flat',         label: 'Flat / Level',       factor: 1.00 },
  { id: 'sloped',       label: 'Sloped',              factor: 1.05 },
  { id: 'steep',        label: 'Steep',               factor: 1.12 },
  { id: 'rock',         label: 'Rock / Difficult',    factor: 1.18 },
  { id: 'contaminated', label: 'Contaminated',        factor: 1.25 },
];

function distanceFactor(km: number): number {
  if (!km || km < 20) return 1.00;
  if (km < 40) return 1.02;
  if (km < 70) return 1.04;
  if (km < 100) return 1.07;
  return 1.10;
}

// Melbourne 2026 base rates — Rawlinsons 2021 × BCI 1.31
const BASE_RATES: Record<string, Record<SpecLevel, { rate_low: number; rate_high: number; desc: string }>> = {
  residential: {
    entry:    { rate_low: 1475, rate_high: 1590, desc: 'Project house, timber framed 90–110m²' },
    standard: { rate_low: 1875, rate_high: 2025, desc: 'Individual house, timber framed, standard' },
    mid:      { rate_low: 2100, rate_high: 2260, desc: 'Individual house, brick veneer' },
    premium:  { rate_low: 2950, rate_high: 3180, desc: '2-storey, brick veneer' },
    highend:  { rate_low: 5000, rate_high: 9000, desc: 'Prestige / High-end' },
  },
  multires: {
    entry:    { rate_low: 1800, rate_high: 2000, desc: 'Townhouses, standard' },
    standard: { rate_low: 2100, rate_high: 2400, desc: 'Units/Townhouses, mid' },
    mid:      { rate_low: 2500, rate_high: 2900, desc: 'Apartments, Class 2' },
    premium:  { rate_low: 3200, rate_high: 3800, desc: 'Apartments, premium finish' },
    highend:  { rate_low: 4500, rate_high: 6000, desc: 'Apartments, high-end' },
  },
  commercial: {
    entry:    { rate_low: 1790, rate_high: 1935, desc: 'Single storey office, no A/C' },
    standard: { rate_low: 2250, rate_high: 2425, desc: 'Single storey office, A/C' },
    mid:      { rate_low: 2555, rate_high: 2750, desc: 'Two storey office, A/C, no lift' },
    premium:  { rate_low: 3065, rate_high: 3300, desc: 'Admin office, A/C, subdivided' },
    highend:  { rate_low: 3800, rate_high: 5000, desc: 'High-spec commercial' },
  },
  industrial: {
    entry:    { rate_low: 780,  rate_high: 845,  desc: 'Warehouse low bay, tilt-up' },
    standard: { rate_low: 845,  rate_high: 910,  desc: 'Warehouse low bay, brick' },
    mid:      { rate_low: 925,  rate_high: 1000, desc: 'Warehouse high bay, tilt-up' },
    premium:  { rate_low: 1000, rate_high: 1075, desc: 'Warehouse high bay, brick' },
    highend:  { rate_low: 1200, rate_high: 1600, desc: 'Cold store / special industrial' },
  },
  fitout: {
    entry:    { rate_low: 500,  rate_high: 650,  desc: 'Basic fitout' },
    standard: { rate_low: 650,  rate_high: 800,  desc: 'Standard commercial fitout' },
    mid:      { rate_low: 900,  rate_high: 1200, desc: 'Mid-quality fitout' },
    premium:  { rate_low: 1400, rate_high: 1900, desc: 'Premium fitout' },
    highend:  { rate_low: 2200, rate_high: 3500, desc: 'High-end fitout' },
  },
  tiling: {
    entry:    { rate_low: 120, rate_high: 140,  desc: 'Standard ceramic 300×300mm supply+fix' },
    standard: { rate_low: 140, rate_high: 175,  desc: 'Porcelain 600×600mm supply+fix' },
    mid:      { rate_low: 180, rate_high: 230,  desc: 'Polished porcelain supply+fix' },
    premium:  { rate_low: 300, rate_high: 450,  desc: 'Natural stone / marble supply+fix' },
    highend:  { rate_low: 545, rate_high: 700,  desc: 'Travertine filled + polished' },
  },
  facades: {
    entry:    { rate_low: 95,  rate_high: 180,  desc: 'Fibre cement sheet cladding' },
    standard: { rate_low: 230, rate_high: 310,  desc: 'Brick veneer, common' },
    mid:      { rate_low: 255, rate_high: 450,  desc: 'ACP cladding' },
    premium:  { rate_low: 450, rate_high: 770,  desc: 'Precast concrete panel' },
    highend:  { rate_low: 770, rate_high: 1795, desc: 'Glazed curtain wall' },
  },
};

const ELEMENTAL_SPLIT: Record<string, Array<{ el: string; name: string; pct: number }>> = {
  residential: [
    { el: '01', name: 'Preliminary & General (P&G)',                          pct: 0.10 },
    { el: '02', name: 'Demolition & Site Preparation',                        pct: 0.02 },
    { el: '03', name: 'Substructure — Excavation, Footings & Ground Slab',    pct: 0.12 },
    { el: '04', name: 'Superstructure / Frame',                                pct: 0.13 },
    { el: '05', name: 'Roof Structure & Covering',                             pct: 0.08 },
    { el: '06', name: 'External Walls, Cladding & Facades',                   pct: 0.09 },
    { el: '07', name: 'External Windows & Doors',                              pct: 0.05 },
    { el: '08', name: 'Internal Walls & Partitions',                           pct: 0.04 },
    { el: '09', name: 'Internal Doors & Frames',                               pct: 0.02 },
    { el: '10', name: 'Floor Finishes (incl. Tiling)',                         pct: 0.04 },
    { el: '11', name: 'Wall Finishes (incl. Tiling)',                          pct: 0.03 },
    { el: '12', name: 'Ceiling Finishes',                                      pct: 0.02 },
    { el: '13', name: 'Fittings, Fixtures & Equipment (FF&E)',                 pct: 0.05 },
    { el: '14', name: 'Hydraulic Services',                                    pct: 0.06 },
    { el: '15', name: 'Electrical Services',                                   pct: 0.06 },
    { el: '16', name: 'Mechanical / HVAC Services',                            pct: 0.03 },
    { el: '17', name: 'Fire Services',                                         pct: 0.01 },
    { el: '19', name: 'External Works & Landscaping',                          pct: 0.05 },
  ],
  commercial: [
    { el: '01', name: 'Preliminary & General (P&G)',                           pct: 0.12 },
    { el: '02', name: 'Demolition & Site Preparation',                         pct: 0.03 },
    { el: '03', name: 'Substructure — Excavation, Footings & Ground Slab',     pct: 0.11 },
    { el: '04', name: 'Superstructure / Frame',                                 pct: 0.14 },
    { el: '05', name: 'Roof Structure & Covering',                              pct: 0.05 },
    { el: '06', name: 'External Walls, Cladding & Facades',                    pct: 0.09 },
    { el: '07', name: 'External Windows & Doors',                               pct: 0.06 },
    { el: '08', name: 'Internal Walls & Partitions',                            pct: 0.05 },
    { el: '09', name: 'Internal Doors & Frames',                                pct: 0.02 },
    { el: '10', name: 'Floor Finishes (incl. Tiling)',                          pct: 0.03 },
    { el: '11', name: 'Wall Finishes (incl. Tiling)',                           pct: 0.02 },
    { el: '12', name: 'Ceiling Finishes',                                       pct: 0.03 },
    { el: '13', name: 'Fittings, Fixtures & Equipment (FF&E)',                  pct: 0.04 },
    { el: '14', name: 'Hydraulic Services',                                     pct: 0.07 },
    { el: '15', name: 'Electrical Services',                                    pct: 0.08 },
    { el: '16', name: 'Mechanical / HVAC Services',                             pct: 0.09 },
    { el: '17', name: 'Fire Services',                                          pct: 0.04 },
    { el: '19', name: 'External Works & Landscaping',                           pct: 0.03 },
  ],
  industrial: [
    { el: '01', name: 'Preliminary & General (P&G)',                            pct: 0.10 },
    { el: '02', name: 'Demolition & Site Preparation',                          pct: 0.03 },
    { el: '03', name: 'Substructure — Excavation, Footings & Ground Slab',      pct: 0.14 },
    { el: '04', name: 'Superstructure / Frame (Steel / Tilt-Up)',               pct: 0.20 },
    { el: '05', name: 'Roof Structure & Covering',                               pct: 0.12 },
    { el: '06', name: 'External Walls, Cladding & Facades',                     pct: 0.10 },
    { el: '07', name: 'External Windows & Doors (Roller Doors incl.)',          pct: 0.05 },
    { el: '08', name: 'Internal Walls & Partitions (Office Component)',         pct: 0.03 },
    { el: '09', name: 'Internal Doors & Frames',                                 pct: 0.01 },
    { el: '10', name: 'Floor Finishes',                                          pct: 0.03 },
    { el: '11', name: 'Wall Finishes',                                           pct: 0.01 },
    { el: '12', name: 'Ceiling Finishes',                                        pct: 0.01 },
    { el: '13', name: 'Fittings, Fixtures & Equipment (FF&E)',                   pct: 0.02 },
    { el: '14', name: 'Hydraulic Services',                                      pct: 0.04 },
    { el: '15', name: 'Electrical Services',                                     pct: 0.06 },
    { el: '16', name: 'Mechanical / HVAC Services',                              pct: 0.02 },
    { el: '17', name: 'Fire Services (Sprinklers)',                               pct: 0.04 },
    { el: '19', name: 'External Works & Landscaping (Hardstand / Yard)',         pct: 0.05 },
  ],
  fitout: [
    { el: '01', name: 'Preliminary & General',                                   pct: 0.08 },
    { el: '02', name: 'Demolition & Make-Good',                                  pct: 0.05 },
    { el: '03', name: 'Partitions & Framing',                                    pct: 0.12 },
    { el: '04', name: 'Ceilings',                                                 pct: 0.10 },
    { el: '05', name: 'Floor Finishes (carpet, tiles, timber)',                   pct: 0.12 },
    { el: '06', name: 'Wall Finishes & Feature Walls',                            pct: 0.07 },
    { el: '07', name: 'Joinery & Cabinetry',                                      pct: 0.12 },
    { el: '08', name: 'Internal Doors & Hardware',                                pct: 0.04 },
    { el: '09', name: 'Glazing & Frameless Screens',                              pct: 0.05 },
    { el: '10', name: 'FF&E — Furniture, Fittings & Equipment',                   pct: 0.07 },
    { el: '11', name: 'Hydraulic & Wet Areas',                                    pct: 0.06 },
    { el: '12', name: 'Electrical, Data & AV',                                    pct: 0.10 },
    { el: '13', name: 'Mechanical / HVAC',                                        pct: 0.08 },
    { el: '14', name: 'Fire Services',                                            pct: 0.02 },
    { el: '15', name: 'Signage & Branding',                                       pct: 0.02 },
  ],
  tiling: [
    { el: '01', name: 'Preliminary & General (mobilisation, protection, cleaning)', pct: 0.08 },
    { el: '02', name: 'Substrate Preparation — grinding, levelling, waterproofing', pct: 0.12 },
    { el: '03', name: 'Tile Supply (PC rate — confirm with supplier)',               pct: 0.42 },
    { el: '04', name: 'Tile Fix — adhesive, bed, grout, spacers',                   pct: 0.28 },
    { el: '05', name: 'Trims, Edge Strips & Movement Joints',                       pct: 0.05 },
    { el: '06', name: 'Final Clean & Seal',                                         pct: 0.05 },
  ],
  facades: [
    { el: '01', name: 'Preliminary & General',                                      pct: 0.08 },
    { el: '02', name: 'Substrate / Framing Preparation',                            pct: 0.12 },
    { el: '03', name: 'Facade System Supply (PC rate)',                             pct: 0.40 },
    { el: '04', name: 'Facade Fix & Installation',                                  pct: 0.28 },
    { el: '05', name: 'Sealants, Flashings & Trims',                               pct: 0.07 },
    { el: '06', name: 'Waterproofing / Membranes',                                  pct: 0.05 },
  ],
};

ELEMENTAL_SPLIT.multires = ELEMENTAL_SPLIT.residential;

export type ManualEstimateItem = {
  el: string;
  name: string;
  unit: string;
  qty: number;
  rate: number;
  amount: number;
  notes: string;
};

export type ManualEstimateParams = {
  projectType: ProjectTypeId;
  specLevel: SpecLevel;
  gfa: number;
  state: string;
  siteComplexity: string;
  distanceKm: number;
};

export type ManualEstimateResult = {
  items: ManualEstimateItem[];
  constructionTotal: number;
  midRate: number;
  rateLow: number;
  rateHigh: number;
  rateDesc: string;
  stateFactor: number;
  siteFactor: number;
  distanceFactor: number;
};

export function generateManualEstimate(params: ManualEstimateParams): ManualEstimateResult {
  const { projectType, specLevel, gfa, state, siteComplexity, distanceKm } = params;

  const typeRates = BASE_RATES[projectType] || BASE_RATES.residential;
  const specRates = typeRates[specLevel] || typeRates.standard;
  const sf = STATE_FACTORS[state] || 1.00;
  const siteOpt = SITE_OPTIONS.find(s => s.id === siteComplexity);
  const sitef = siteOpt?.factor || 1.00;
  const df = distanceFactor(distanceKm || 0);
  const midRate = ((specRates.rate_low + specRates.rate_high) / 2) * sf * df * sitef;
  const constructionTotal = midRate * gfa;

  const split = ELEMENTAL_SPLIT[projectType] || ELEMENTAL_SPLIT.residential;
  const items: ManualEstimateItem[] = split
    .filter(e => e.pct > 0)
    .map(e => {
      const amount = constructionTotal * e.pct;
      const rate = gfa > 0 ? amount / gfa : 0;
      return {
        el: e.el,
        name: e.name,
        unit: 'm²',
        qty: gfa,
        rate: parseFloat(rate.toFixed(2)),
        amount: parseFloat(amount.toFixed(2)),
        notes: `${(e.pct * 100).toFixed(0)}% of construction cost`,
      };
    });

  return {
    items,
    constructionTotal,
    midRate: parseFloat(midRate.toFixed(0)),
    rateLow: parseFloat((specRates.rate_low * sf * df * sitef).toFixed(0)),
    rateHigh: parseFloat((specRates.rate_high * sf * df * sitef).toFixed(0)),
    rateDesc: specRates.desc,
    stateFactor: sf,
    siteFactor: sitef,
    distanceFactor: df,
  };
}

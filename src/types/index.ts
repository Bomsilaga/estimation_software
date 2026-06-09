export type NccClass =
  | "1a" | "1b" | "2" | "3" | "4" | "5" | "6" | "7a" | "7b" | "8" | "9a" | "9b" | "9c" | "10a" | "10b" | "10c";

export type WallConstruction = "brick_veneer" | "double_brick" | "lightweight" | "concrete" | "unknown";
export type RoofType = "hip" | "gable" | "skillion" | "flat" | "combination" | "unknown";
export type SlabType = "ground" | "suspended" | "unknown";
export type Confidence = "high" | "medium" | "low";

export interface DoorDetail {
  type: "external" | "internal" | "garage";
  width_mm: number;
  height_mm: number;
  quantity: number;
}

export interface WindowDetail {
  type: "awning" | "casement" | "fixed" | "sliding" | "bifold" | "unknown";
  width_mm: number;
  height_mm: number;
  quantity: number;
}

export interface RoomDetail {
  name: string;
  area_m2: number;
}

/** Raw output from Claude Vision — all fields the AI extracts */
export interface PlanExtraction {
  gfa: number;
  gfa_confidence: Confidence;
  nfa: number;
  perimeter_m: number;
  external_wall_area_m2: number;
  internal_wall_lm: number;
  wet_area_m2: number;
  rooms: RoomDetail[];
  external_doors: number;
  door_details: DoorDetail[];
  internal_doors: number;
  windows: number;
  window_details: WindowDetail[];
  garage_doors: number;
  ncc_class: NccClass;
  storeys: number;
  bedrooms: number;
  bathrooms: number;
  has_garage: boolean;
  has_alfresco: boolean;
  has_pool: boolean;
  wall_construction: WallConstruction;
  roof_type: RoofType;
  slab_type: SlabType;
  structural_steel: boolean;
  drawing_scale: string;
  site_area: number | null;
  overall_confidence: Confidence;
  extraction_notes: string;
}

/** User-reviewed/corrected version of PlanExtraction */
export interface ReviewedPlanData extends PlanExtraction {
  overrides: Partial<Record<keyof PlanExtraction, number | string | boolean>>;
  accepted_fields: Set<string>;
}

export type EstimateSection = "trade_works" | "pc_items" | "provisional_sums" | "compliance";

export interface EstimateItem {
  id?: string;
  estimate_id?: string;
  section: EstimateSection;
  trade: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  notes: string;
  sort_order: number;
  as_standard?: string;
}

export interface Estimate {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  status: "draft" | "finalized" | "archived";
  total_cost: number;
  gfa: number;
  ncc_class: NccClass;
  plan_image_url?: string;
  extraction_data?: PlanExtraction;
  created_at: string;
  updated_at: string;
  items?: EstimateItem[];
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  address: string;
  ncc_class: NccClass;
  created_at: string;
}

export interface RateRecord {
  id: string;
  trade: string;
  description: string;
  unit: string;
  rate_low: number;
  rate_mid: number;
  rate_high: number;
  notes: string;
  source: string;
  as_standard?: string;
  updated_at: string;
}

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  state: string;
  phone?: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic();

const EXTRACTION_PROMPT = `You are an expert Australian construction quantity surveyor and registered building practitioner analysing a floor plan drawing.

Your task is to extract PRECISE measurements and identify ALL building elements from this floor plan with the rigour expected of an AIQS-registered QS.

EXTRACTION REQUIREMENTS:

1. AREAS (measure to inside face of external walls unless noted)
   - Gross Floor Area (GFA) in m² — total enclosed floor area, all levels shown
   - Net Floor Area (NFA) in m² — GFA minus wall thickness (~150mm walls)
   - Wet area m² — total floor area of all: bathrooms, ensuites, WC, powder room, laundry, kitchen wet zone
   - Room-by-room breakdown: list every labeled room with its area in m²

2. WALLS
   - Total external wall perimeter (m) — measured to OUTSIDE face of external walls
   - External wall area (m²) — perimeter × storey height (use dimensions if shown, else assume 2.7m)
   - Internal wall total length (lm) — sum of all internal partition wall centrelines
   - Wall construction if noted on plan (brick veneer / double brick / lightweight / concrete / tilt panel)

3. OPENINGS — list every opening individually
   - External doors: count and size (W×H in mm) — include sliding, hinged, bi-fold
   - Internal doors: count and size
   - Garage doors: count and size
   - Windows: count, type (awning/casement/fixed/sliding/bi-fold/louvre), and size for each
   - Note: if no dimensions shown, estimate from scale

4. STRUCTURE
   - Number of storeys/levels visible in this plan
   - Columns, posts, or structural supports marked
   - Steel beams/lintels noted on plan
   - Roof type if indicated (hip/gable/skillion/flat/combination)
   - Slab on ground vs suspended slab (if noted)

5. COMPLIANCE & NCC
   - NCC 2022 Building Class:
     1a = detached house or one of a group of attached dwellings (includes duplex if separate titles)
     1b = boarding/guest house ≤12 people or ≤300m²
     2 = apartment building (sole-occupancy units stacked)
     3 = residential (hotel, motel, hostel, backpacker)
     4 = caretaker dwelling within Class 5-9
     5 = office
     6 = shop/cafe/restaurant/retail
     7a = carpark
     7b = warehouse/storage
     8 = factory/production
     9a = health-care
     9b = assembly (school, theatre, sports)
     9c = aged care
     10a = non-habitable (shed, garage, carport, fence)
     10b = structure (mast, antenna, retaining wall, swimming pool)
   - Number of bedrooms (count bedroom labels)
   - Number of bathrooms/ensuites/WCs (count wet room labels)
   - DDA/accessibility features noted
   - Separation distances to boundaries if shown

6. SCALE CALIBRATION
   - Drawing scale (e.g. 1:100) if shown
   - Scale bar if present — note its length
   - Any numerical dimension annotations on the plan — USE THESE to calibrate your measurements
   - If dimensions are shown, use them as ground truth; do NOT rely solely on visual proportion

CONFIDENCE SCORING for each measurement:
   "high" = dimension annotation on plan or scale bar confirmed
   "medium" = scaled from drawing scale ratio, reasonable certainty
   "low" = estimated by proportion, no scale or dimension confirmation

Return ONLY a single valid JSON object matching this EXACT schema (no markdown, no commentary):
{
  "gfa": number,
  "gfa_confidence": "high"|"medium"|"low",
  "nfa": number,
  "perimeter_m": number,
  "external_wall_area_m2": number,
  "internal_wall_lm": number,
  "wet_area_m2": number,
  "rooms": [{"name": "string", "area_m2": number}],
  "external_doors": number,
  "door_details": [{"type": "external"|"internal"|"garage", "width_mm": number, "height_mm": number, "quantity": number}],
  "internal_doors": number,
  "windows": number,
  "window_details": [{"type": "awning"|"casement"|"fixed"|"sliding"|"bifold"|"louvre"|"unknown", "width_mm": number, "height_mm": number, "quantity": number}],
  "garage_doors": number,
  "ncc_class": "1a"|"1b"|"2"|"3"|"4"|"5"|"6"|"7a"|"7b"|"8"|"9a"|"9b"|"9c"|"10a"|"10b"|"10c",
  "storeys": number,
  "bedrooms": number,
  "bathrooms": number,
  "has_garage": boolean,
  "has_alfresco": boolean,
  "has_pool": boolean,
  "wall_construction": "brick_veneer"|"double_brick"|"lightweight"|"concrete"|"unknown",
  "roof_type": "hip"|"gable"|"skillion"|"flat"|"combination"|"unknown",
  "slab_type": "ground"|"suspended"|"unknown",
  "structural_steel": boolean,
  "drawing_scale": "string",
  "site_area": number|null,
  "overall_confidence": "high"|"medium"|"low",
  "extraction_notes": "string"
}`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectName = formData.get("project_name") as string || "Untitled Project";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File must be PNG, JPEG, or WEBP" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
    }

    // Convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mediaType = file.type as "image/png" | "image/jpeg" | "image/webp";

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData } = await supabase.storage
      .from("plan-images")
      .upload(fileName, file, { contentType: file.type, upsert: false });

    const imageUrl = uploadData
      ? supabase.storage.from("plan-images").getPublicUrl(fileName).data.publicUrl
      : null;

    // Call Claude Vision
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON — strip any accidental markdown fences
    const jsonStr = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const extraction = JSON.parse(jsonStr);

    return NextResponse.json({ extraction, image_url: imageUrl, project_name: projectName });
  } catch (err) {
    console.error("Plan analysis error:", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exportBoqCsv } from "@/lib/boq-export";
import type { Estimate, EstimateItem } from "@/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const estimateId = searchParams.get("id");
  if (!estimateId) return NextResponse.json({ error: "Missing estimate ID" }, { status: 400 });

  const { data: estimate } = await supabase
    .from("estimates")
    .select("*")
    .eq("id", estimateId)
    .eq("user_id", user.id)
    .single();

  if (!estimate) return NextResponse.json({ error: "Estimate not found" }, { status: 404 });

  const { data: items } = await supabase
    .from("estimate_items")
    .select("*")
    .eq("estimate_id", estimateId)
    .order("sort_order");

  const csv = exportBoqCsv(estimate as Estimate, (items || []) as EstimateItem[]);
  const filename = `${estimate.name.replace(/\s+/g, "_")}_BoQ.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

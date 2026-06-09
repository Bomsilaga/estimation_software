import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, role, state, phone, message } = body;

    if (!name || !email || !company || !role || !state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use service role client to bypass RLS
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("access_requests").insert({
      name,
      email,
      company,
      role,
      state,
      phone: phone || null,
      message: message || null,
      status: "pending",
    });

    if (error) {
      console.error("Access request insert error:", error);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Request access error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

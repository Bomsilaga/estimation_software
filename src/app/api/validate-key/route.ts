import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { key, email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Admin bypass — no key required
  const isAdmin = cleanEmail === process.env.ADMIN_EMAIL?.toLowerCase().trim();

  if (!isAdmin) {
    if (!key) {
      return NextResponse.json({ error: "Access key is required" }, { status: 400 });
    }

    const { data: accessKey, error: keyError } = await supabase
      .from("access_keys")
      .select("*")
      .eq("key", key.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (keyError) {
      console.error("Key lookup error:", JSON.stringify(keyError));
    }

    if (!accessKey) {
      return NextResponse.json({ error: "Invalid access key. Please check and try again." }, { status: 401 });
    }

    if (accessKey.uses_remaining <= 0) {
      return NextResponse.json({ error: "subscription_required" }, { status: 403 });
    }

    // Decrement uses
    await supabase
      .from("access_keys")
      .update({
        uses_remaining: accessKey.uses_remaining - 1,
        total_uses: accessKey.total_uses + 1,
        assigned_email: accessKey.assigned_email || cleanEmail,
      })
      .eq("id", accessKey.id);
  }

  // Generate a sign-in link (creates the user if they don't exist)
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: cleanEmail,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("Link generation error:", JSON.stringify(linkError));
    return NextResponse.json({ error: "Failed to generate sign-in link" }, { status: 500 });
  }

  return NextResponse.json({ url: linkData.properties.action_link });
}

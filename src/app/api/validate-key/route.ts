import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { key, email } = await req.json();

  if (!key || !email) {
    return NextResponse.json({ error: "Access key and email are required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: accessKey } = await supabase
    .from("access_keys")
    .select("*")
    .eq("key", key.toUpperCase().trim())
    .eq("is_active", true)
    .single();

  if (!accessKey) {
    return NextResponse.json({ error: "Invalid access key. Please check and try again." }, { status: 401 });
  }

  if (accessKey.uses_remaining <= 0) {
    return NextResponse.json({ error: "subscription_required" }, { status: 403 });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Decrement uses
  await supabase
    .from("access_keys")
    .update({
      uses_remaining: accessKey.uses_remaining - 1,
      total_uses: accessKey.total_uses + 1,
      assigned_email: accessKey.assigned_email || cleanEmail,
    })
    .eq("id", accessKey.id);

  // Generate a sign-in link (creates the user if they don't exist)
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: cleanEmail,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    // Undo the use decrement if link generation failed
    await supabase
      .from("access_keys")
      .update({
        uses_remaining: accessKey.uses_remaining,
        total_uses: accessKey.total_uses,
      })
      .eq("id", accessKey.id);
    return NextResponse.json({ error: "Failed to generate sign-in link" }, { status: 500 });
  }

  return NextResponse.json({
    url: linkData.properties.action_link,
    uses_remaining: accessKey.uses_remaining - 1,
  });
}

export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminPanel from "./admin-panel";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdmin = user.email === process.env.ADMIN_EMAIL || user.app_metadata?.role === "admin";
  if (!isAdmin) redirect("/app/dashboard");

  const [{ data: requests }, { data: keys }] = await Promise.all([
    supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("access_keys")
      .select("*")
      .order("total_uses", { ascending: false })
      .order("created_at", { ascending: true }),
  ]);

  return <AdminPanel requests={requests || []} keys={keys || []} />;
}

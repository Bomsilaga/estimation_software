export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdmin = user.email === process.env.ADMIN_EMAIL ||
    user.app_metadata?.role === "admin";

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      <Sidebar isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

import { AdminDashboardShell } from "@/components/admin/admin-dashboard-shell";
import { SummerShadowBackground } from "@/components/site/summer-shadow-background";

export default async function DashboardPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f5f0e4]">
      <SummerShadowBackground />
      <div className="relative z-10">
        <AdminDashboardShell />
      </div>
    </main>
  );
}
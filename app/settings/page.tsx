import { SiteSettingsShell } from "@/components/site-settings/site-settings-shell";
import { getAdminSession } from "@/lib/api/admin-client";

export default async function SettingsPage() {
  const session = await getAdminSession();

  if (!session.authenticated) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
        <div className="flex min-h-[400px] items-center justify-center rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft">
          <div className="text-center">
            <h1 className="font-display text-4xl text-ink">需要登录</h1>
            <p className="mt-4 text-sm text-ink/70">请先访问上传页面完成管理员登录。</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <SiteSettingsShell />
    </main>
  );
}

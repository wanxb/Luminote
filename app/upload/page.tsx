import { UploadShell } from "@/components/upload/upload-shell";
import { getSite } from "@/lib/api/client";

export default async function UploadPage() {
  const site = await getSite();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">管理员面板</h1>
        <a
          href="/settings"
          className="rounded-full border border-black/10 px-5 py-2 text-sm uppercase tracking-[0.2em] text-ink transition hover:bg-mist"
        >
          站点配置
        </a>
      </div>
      <UploadShell watermarkText={site.watermarkText} />
    </main>
  );
}

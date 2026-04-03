import { UploadShell } from "@/components/upload/upload-shell";
import { getSite } from "@/lib/api/client";

export default async function UploadPage() {
  const site = await getSite();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <UploadShell watermarkText={site.watermarkText} />
    </main>
  );
}

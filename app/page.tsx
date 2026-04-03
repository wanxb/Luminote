import { GalleryExperience } from "@/components/gallery/gallery-experience";
import { getPhotos, getSite } from "@/lib/api/client";

export default async function HomePage() {
  const [site, photos] = await Promise.all([getSite(), getPhotos()]);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-10 md:px-10">
      <section className="rounded-[36px] border border-black/5 bg-white/70 p-8 shadow-soft backdrop-blur md:p-12">
        <p className="text-xs uppercase tracking-[0.35em] text-ember/70">{site.siteTitle}</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight text-ink md:text-7xl">
          A lightweight home for photography that lets the work breathe.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-ink/70 md:text-lg">
          {site.siteDescription}
        </p>
      </section>

      <GalleryExperience photos={photos} />
    </main>
  );
}

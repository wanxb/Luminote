"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10 md:px-10">
      <section className="w-full rounded-[32px] border border-black/5 bg-white/85 p-8 shadow-soft backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-ember/70">Application Error</p>
        <h1 className="mt-4 font-display text-4xl text-ink">页面暂时不可用</h1>
        <p className="mt-4 text-sm leading-7 text-ink/70">
          {error.message || "渲染页面时发生异常，请稍后重试。"}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-full bg-ink px-5 py-3 text-sm text-paper transition hover:bg-black"
        >
          重新加载
        </button>
      </section>
    </main>
  );
}
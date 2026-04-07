"use client";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10 md:px-10">
          <section className="w-full rounded-[32px] border border-black/5 bg-white/90 p-8 shadow-soft">
            <p className="text-xs uppercase tracking-[0.28em] text-ember/70">Fatal Error</p>
            <h1 className="mt-4 font-display text-4xl text-ink">应用启动失败</h1>
            <p className="mt-4 text-sm leading-7 text-ink/70">
              {error.message || "应用初始化过程中发生异常，请重试。"}
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 rounded-full bg-ink px-5 py-3 text-sm text-paper transition hover:bg-black"
            >
              再试一次
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
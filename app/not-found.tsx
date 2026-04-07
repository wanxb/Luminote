export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10 md:px-10">
      <section className="w-full rounded-[32px] border border-black/5 bg-white/85 p-8 shadow-soft backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-ember/70">404</p>
        <h1 className="mt-4 font-display text-4xl text-ink">页面不存在</h1>
        <p className="mt-4 text-sm leading-7 text-ink/70">请求的页面不存在，或者地址已经变更。</p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm text-paper transition hover:bg-black"
        >
          返回首页
        </a>
      </section>
    </main>
  );
}
type LightboxShellProps = {
  enabled?: boolean;
};

export function LightboxShell({ enabled = false }: LightboxShellProps) {
  return (
    <section className="rounded-[32px] border border-black/5 bg-white/70 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ember/70">Lightbox</p>
          <h2 className="mt-2 font-display text-2xl text-ink">大图查看模块预留</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs tracking-[0.2em] ${
            enabled ? "bg-ink text-paper" : "bg-mist text-ink/70"
          }`}
        >
          {enabled ? "READY" : "SCAFFOLD"}
        </span>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/70">
        后续会在这里接入全屏弹层、键盘切换、滑动切换和 EXIF 信息侧栏。当前先保留结构占位，
        方便我们下一步直接接功能。
      </p>
    </section>
  );
}

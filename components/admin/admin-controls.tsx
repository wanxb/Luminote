"use client";

import { useEffect, useRef, useState } from "react";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

function SelectCaret({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`h-3.5 w-3.5 text-[#9c7655] transition duration-200 ${open ? "rotate-180" : "rotate-0"}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SoftSelect<T extends string>({
  value,
  onChange,
  options,
  className = "",
  buttonClassName = "",
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  className?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`group flex min-h-[38px] w-full items-center justify-between gap-2 rounded-[10px] border border-[rgba(186,152,120,0.18)] bg-[linear-gradient(180deg,rgba(255,252,248,0.98),rgba(248,241,232,0.98))] px-2.5 py-1.5 text-left text-[13px] text-[#5b4634] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_4px_12px_rgba(123,99,71,0.04)] outline-none transition duration-200 hover:border-[rgba(199,143,99,0.28)] hover:bg-[linear-gradient(180deg,rgba(255,253,249,0.98),rgba(250,244,236,0.98))] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_6px_14px_rgba(123,99,71,0.05)] focus-visible:border-[#d39a6d] focus-visible:ring-2 focus-visible:ring-[#f0dec9]/80 ${buttonClassName}`}
      >
        <span className="truncate font-medium text-[#5a4330]">{selected?.label}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgba(199,143,99,0.12)] bg-[rgba(255,250,245,0.96)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] transition group-hover:border-[rgba(199,143,99,0.22)] group-hover:bg-[rgba(255,246,236,0.98)]">
          <SelectCaret open={open} />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-20 overflow-hidden rounded-[20px] border border-[rgba(186,152,120,0.14)] bg-[linear-gradient(180deg,rgba(255,253,249,0.99),rgba(247,240,231,0.98))] p-1.5 shadow-[0_16px_32px_rgba(91,70,45,0.1)] backdrop-blur-md">
          <div role="listbox" aria-activedescendant={`select-option-${String(selected?.value ?? "")}`} className="max-h-56 space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(215,170,127,0.95)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(215,170,127,0.95)] [&::-webkit-scrollbar-track]:bg-transparent">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  id={`select-option-${String(option.value)}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-[13px] transition duration-150 ${
                    isSelected
                      ? "border border-[rgba(199,143,99,0.16)] bg-[linear-gradient(180deg,rgba(251,238,221,0.72),rgba(245,227,201,0.52))] text-[#7a5a40] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                      : "border border-transparent bg-transparent text-[#6a5340] hover:border-[rgba(199,143,99,0.1)] hover:bg-[rgba(236,214,188,0.2)] hover:text-[#5a4330]"
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className={`h-2 w-2 rounded-full transition ${isSelected ? "bg-[#d49a6d] shadow-[0_0_0_4px_rgba(212,154,109,0.12)]" : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function NumberStepperField({
  value,
  onChange,
  min = 1,
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  className?: string;
}) {
  function normalize(nextValue: number) {
    if (!Number.isFinite(nextValue)) {
      return min;
    }

    return Math.max(min, Math.trunc(nextValue));
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-[18px] border border-[rgba(92,68,48,0.12)] bg-[linear-gradient(180deg,rgba(247,241,232,0.98),rgba(242,234,222,0.94))] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_18px_rgba(123,99,71,0.05)] ${className}`}>
      <button
        type="button"
        onClick={() => onChange(normalize(value - 1))}
        aria-label="减少数值"
        className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-[rgba(92,68,48,0.1)] bg-white/72 text-base leading-none text-[#8b6b4f] transition hover:border-[rgba(180,136,95,0.28)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c8a8]/60"
      >
        -
      </button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(normalize(Number(event.target.value)))}
        className="w-12 appearance-none border-0 bg-transparent px-1 py-1 text-center text-sm text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(normalize(value + 1))}
        aria-label="增加数值"
        className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-[rgba(92,68,48,0.1)] bg-white/72 text-base leading-none text-[#8b6b4f] transition hover:border-[rgba(180,136,95,0.28)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c8a8]/60"
      >
        +
      </button>
    </div>
  );
}

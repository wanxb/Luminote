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
      className={`h-4 w-4 text-[#9c7655] transition duration-200 ${open ? "rotate-180" : "rotate-0"}`}
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
        className={`flex w-full items-center justify-between gap-3 rounded-[20px] border border-[rgba(92,68,48,0.14)] bg-[linear-gradient(180deg,rgba(247,241,232,0.98),rgba(242,234,222,0.96))] px-4 py-3 text-left text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_24px_rgba(123,99,71,0.06)] outline-none transition duration-200 hover:border-[rgba(180,136,95,0.34)] focus-visible:border-[#c78f63] focus-visible:ring-2 focus-visible:ring-[#e8c8a8]/60 ${buttonClassName}`}
      >
        <span className="truncate">{selected?.label}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(214,185,152,0.18)]">
          <SelectCaret open={open} />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-[24px] border border-[rgba(92,68,48,0.12)] bg-[rgba(249,244,236,0.98)] p-1.5 shadow-[0_22px_54px_rgba(91,70,45,0.16)] backdrop-blur-sm">
          <div role="listbox" aria-activedescendant={`select-option-${String(selected?.value ?? "")}`} className="space-y-1">
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
                  className={`flex w-full items-center justify-between rounded-[18px] px-4 py-2.5 text-sm transition duration-150 ${
                    isSelected
                      ? "bg-[linear-gradient(180deg,rgba(214,178,142,0.26),rgba(201,145,99,0.18))] text-[#5c4330]"
                      : "text-ink/80 hover:bg-[rgba(214,178,142,0.16)] hover:text-ink"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className={`h-2.5 w-2.5 rounded-full transition ${isSelected ? "bg-[#c78f63]" : "bg-transparent"}`} />
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

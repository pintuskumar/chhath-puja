"use client";

/** Accessible modal / side-sheet: focus trap, Escape to close, focus restore, scroll lock. */
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  variant?: "sheet" | "center";
  labelledBy?: string;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, children, variant = "sheet" }: Props) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? el)?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && el) {
        const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
        if (!items.length) return;
        const a = items[0];
        const b = items[items.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restore.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-night/60 backdrop-blur-[2px]" aria-hidden="true" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={
          variant === "sheet"
            ? "relative ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden bg-cream text-night shadow-warm animate-[sheetIn_.35s_ease-out] max-sm:mt-auto max-sm:h-[88dvh] max-sm:rounded-t-3xl"
            : "relative m-auto flex max-h-[90dvh] w-[min(92vw,34rem)] flex-col overflow-hidden rounded-3xl bg-cream text-night shadow-warm"
        }
      >
        <div className="flex items-start justify-between gap-4 border-b border-maroon/15 px-5 py-4">
          <h2 id={titleId} className="font-display text-2xl leading-snug text-maroon">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="btn-icon shrink-0" aria-label={t("close")}>
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

import { useEffect } from "react";

// Full-screen panel that slides up from the bottom, like opening a chat.
// Stays mounted while closed so a scratchpad keeps its drawing.
export default function Sheet({ open, onClose, title, actions, narrow = false, children }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-out ${
        open ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className="flex items-center justify-between gap-2 border-b border-neutral-200 px-4 pb-2"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
      >
        <p className="font-semibold">{title}</p>
        <div className="flex items-center gap-2">
          {actions}
          <button onClick={onClose} className="rounded-full px-3 py-1.5 text-sm font-medium bg-neutral-900 text-white">
            ✕
          </button>
        </div>
      </div>
      <div className={`flex min-h-0 w-full flex-1 flex-col ${narrow ? "mx-auto max-w-xl" : ""}`}>{children}</div>
    </div>
  );
}

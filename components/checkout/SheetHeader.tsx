"use client";

export function SheetHeader({ onBack, onClose, progress }: { onBack?: () => void; onClose: () => void; progress: number }) {
  return (
    <>
      <div className="shead">
        <button className="x" type="button" aria-label="Back" style={{ visibility: onBack ? "visible" : "hidden" }} onClick={onBack}>‹</button>
        <span className="mark">owambe<i>.</i></span>
        <button className="x" type="button" aria-label="Close" onClick={onClose}>✕</button>
      </div>
      <div className="steps" aria-hidden="true">
        {[1, 2, 3].map((n) => <i key={n} className={n <= progress ? "on" : ""} />)}
      </div>
    </>
  );
}

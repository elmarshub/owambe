"use client";
import { useEffect } from "react";
import { useUi } from "@/store/ui";

export function Toast() {
  const { toast, hideToast, openBag } = useUi();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 3200);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  return (
    <div className={toast ? "toast show" : "toast"} role="status">
      <span>{toast?.text}</span>
      {toast?.text.includes("bag") && <button onClick={openBag}>View bag</button>}
    </div>
  );
}

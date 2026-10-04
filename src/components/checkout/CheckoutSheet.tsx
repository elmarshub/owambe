"use client";
import { useEffect, useState } from "react";
import { AUTH_LIVE } from "@/lib/config";
import type { DeliveryDetails, PaidOrder } from "@/lib/shop-client";
import { useUi } from "@/store/ui";
import { CodeStep, DetailsStep, DoneStep, EmailStep, PayStep } from "./steps";

export type Step = "email" | "code" | "details" | "pay" | "done";
const PROGRESS: Record<Step, number> = { email: 1, code: 1, details: 2, pay: 3, done: 3 };
const BACK: Partial<Record<Step, Step>> = { code: "email", details: "code", pay: "details" };

export function CheckoutSheet() {
  const { sheetOpen, closeSheet, user } = useUi();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState<DeliveryDetails>({ name: "", phone: "", address: "", area: "Lekki", speed: "std" });
  const [order, setOrder] = useState<PaidOrder | null>(null);

  // Reset the step whenever the sheet opens; adjusting state during render avoids an extra effect pass.
  const [wasOpen, setWasOpen] = useState(false);
  if (sheetOpen !== wasOpen) {
    setWasOpen(sheetOpen);
    if (sheetOpen) setStep(user ? "details" : "email");
  }

  useEffect(() => {
    if (!sheetOpen) return;
    const t = setTimeout(() => document.querySelector<HTMLElement>(".sheet .step input, .sheet .step button")?.focus(), 80);
    return () => clearTimeout(t);
  }, [sheetOpen, step]);

  const back = BACK[step];
  const canGoBack = back && !(step === "details" && (user?.google || AUTH_LIVE));

  return (
    <section className={sheetOpen ? "sheet show" : "sheet"} role="dialog" aria-modal="true" aria-labelledby="sheet-title" aria-hidden={!sheetOpen} inert={!sheetOpen}>
      <div className="shead">
        <button className="x" aria-label="Back" style={{ visibility: canGoBack ? "visible" : "hidden" }} onClick={() => back && setStep(back)}>‹</button>
        <span className="mark">owambe<i>.</i></span>
        <button className="x" aria-label="Close" onClick={closeSheet}>✕</button>
      </div>
      <div className="steps" aria-hidden="true">
        {[0, 1, 2].map((i) => <i key={i} className={i < PROGRESS[step] ? "on" : ""} />)}
      </div>

      {step === "email" && <EmailStep email={email} setEmail={setEmail} onSent={() => setStep("code")} onGoogle={() => setStep("details")} />}
      {step === "code" && <CodeStep email={email} onVerified={() => setStep("details")} onChangeEmail={() => setStep("email")} />}
      {step === "details" && <DetailsStep details={details} setDetails={setDetails} onNext={() => setStep("pay")} />}
      {step === "pay" && <PayStep details={details} onPaid={(o) => { setOrder(o); setStep("done"); }} />}
      {step === "done" && order && <DoneStep order={order} />}
    </section>
  );
}

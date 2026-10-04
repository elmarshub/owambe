"use client";
import { useEffect, useState } from "react";
import { AUTH_LIVE } from "@/lib/config";
import type { DeliveryDetails, PaidOrder } from "@/lib/client/payment";
import { useUi } from "@/store/ui";
import { SheetHeader } from "@/components/checkout/SheetHeader";
import { CodeStep } from "@/components/checkout/steps/CodeStep";
import { DetailsStep } from "@/components/checkout/steps/DetailsStep";
import { DoneStep } from "@/components/checkout/steps/DoneStep";
import { EmailStep } from "@/components/checkout/steps/EmailStep";
import { PayStep } from "@/components/checkout/steps/PayStep";

type Step = "email" | "code" | "details" | "pay" | "done";
const PROGRESS: Record<Step, number> = { email: 1, code: 1, details: 2, pay: 3, done: 3 };
const BACK: Partial<Record<Step, Step>> = { code: "email", details: "code", pay: "details" };
const EMPTY_DETAILS: DeliveryDetails = { name: "", phone: "", address: "", area: "Lekki", speed: "std" };

export function CheckoutSheet() {
  const { sheetOpen, closeSheet, user } = useUi();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState<DeliveryDetails>(EMPTY_DETAILS);
  const [order, setOrder] = useState<PaidOrder | null>(null);

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
  const signedInPastEmail = step === "details" && (user?.google || AUTH_LIVE);
  const onBack = back && !signedInPastEmail ? () => setStep(back) : undefined;

  const views: Record<Step, React.ReactNode> = {
    email: <EmailStep email={email} setEmail={setEmail} onSent={() => setStep("code")} onGoogle={() => setStep("details")} />,
    code: <CodeStep email={email} onVerified={() => setStep("details")} onChangeEmail={() => setStep("email")} />,
    details: <DetailsStep details={details} setDetails={setDetails} onNext={() => setStep("pay")} />,
    pay: <PayStep details={details} onPaid={(o) => { setOrder(o); setStep("done"); }} />,
    done: order && <DoneStep order={order} />,
  };

  return (
    <section className={sheetOpen ? "sheet show" : "sheet"} role="dialog" aria-modal="true" aria-labelledby="sheet-title" aria-hidden={!sheetOpen} inert={!sheetOpen}>
      <SheetHeader onBack={onBack} onClose={closeSheet} progress={PROGRESS[step]} />
      {views[step]}
    </section>
  );
}

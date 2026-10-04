"use client";
import { useState, type FormEvent } from "react";
import { DELIVERY, accLabel, findPiece, naira, unitPrice } from "@/lib/catalog";
import { PAY_LIVE } from "@/lib/config";
import { PaymentCancelled, pay, type DeliveryDetails, type PaidOrder } from "@/lib/client/payment";
import { bagSubtotal, useBag } from "@/store/bag";
import { Busy } from "@/components/ui/Busy";

export function PayStep({ details, onPaid }: { details: DeliveryDetails; onPaid: (o: PaidOrder) => void }) {
  const items = useBag((b) => b.items);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const sub = bagSubtotal(items);
  const fee = DELIVERY[details.speed].fee;

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true); setErr("");
    try { onPaid(await pay(items, details)); }
    catch (e) { setErr(e instanceof PaymentCancelled ? e.message : (e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <form className="step" noValidate onSubmit={submit}>
      <h4 id="sheet-title">One last look.</h4>
      <div>
        {items.map((b) => {
          const p = findPiece(b.id)!;
          return (
            <div className="row payline" key={`${b.id}-${b.size}-${b.acc}`}>
              <span><b>{p.name}</b><br /><span className="muted">{p.colour} · {b.size}{b.acc ? ` · ${accLabel(b.id, b.acc)}` : ""} · Qty {b.qty}</span></span>
              <b>{naira(unitPrice(p, b.acc) * b.qty)}</b>
            </div>
          );
        })}
      </div>
      <div className="totals">
        <div className="row"><span>Subtotal</span><span>{naira(sub)}</span></div>
        <div className="row"><span>Delivery</span><span>{naira(fee)}</span></div>
        <div className="row big"><span>Total</span><span>{naira(sub + fee)}</span></div>
      </div>
      <p className="small">Delivering to {details.name}, {details.address}, {details.area}. {details.speed === "exp" ? "Express, next day." : "Standard, 2 to 4 days."}</p>
      <p className="err" role="alert">{err}</p>
      <button className="primary" type="submit" disabled={busy || !items.length}>{busy ? <Busy label="Opening Paystack…" /> : `Pay ${naira(sub + fee)} with Paystack`}</button>
      <p className="small center">{PAY_LIVE ? "Paystack opens its own secure window. Test mode: use Paystack's test card, no money is taken." : "Demo mode: payment is simulated, no money is taken."}</p>
    </form>
  );
}

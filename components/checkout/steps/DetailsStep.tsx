"use client";
import { useState, type FormEvent } from "react";
import { AREAS, DELIVERY, naira, type Speed } from "@/lib/catalog";
import type { DeliveryDetails } from "@/lib/client/payment";
import { useUi } from "@/store/ui";

export function DetailsStep({ details, setDetails, onNext }: { details: DeliveryDetails; setDetails: (d: DeliveryDetails) => void; onNext: () => void }) {
  const user = useUi((u) => u.user);
  const [err, setErr] = useState<{ field: keyof DeliveryDetails; text: string } | null>(null);
  const set = (k: keyof DeliveryDetails, v: string) => { setDetails({ ...details, [k]: v }); setErr(null); };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const phone = details.phone.replace(/\D/g, "");
    const need: [keyof DeliveryDetails, string][] = [["name", "your name"], ["phone", "a phone number for the rider"], ["address", "your street address"]];
    for (const [k, what] of need) if (!String(details[k]).trim()) { setErr({ field: k, text: `Add ${what} so we can deliver.` }); return; }
    const local = phone.length === 11 && phone.startsWith("0") ? phone.slice(1) : phone;
    if (local.length !== 10) { setErr({ field: "phone", text: "Add a full 10-digit phone number so we can deliver." }); return; }
    setDetails({ ...details, phone: local, name: details.name.trim(), address: details.address.trim() });
    onNext();
  };
  const cls = (k: keyof DeliveryDetails) => (err?.field === k ? "inp bad" : "inp");

  return (
    <form className="step" noValidate onSubmit={submit}>
      <h4 id="sheet-title">Where should it go?</h4>
      <p className="small">{user ? `Signed in${user.google ? " with Google" : ""} as ${user.email}.` : "Signed in."}</p>
      <div className="grid2">
        <label className="f">Full name<input className={cls("name")} autoComplete="name" placeholder="Ada Okafor" value={details.name} onChange={(e) => set("name", e.target.value)} /></label>
        <label className="f">Phone<span className="phone"><span>+234</span><input className={cls("phone")} inputMode="tel" autoComplete="tel-national" placeholder="803 000 0000" value={details.phone} onChange={(e) => set("phone", e.target.value)} /></span></label>
      </div>
      <label className="f">Address<input className={cls("address")} autoComplete="street-address" placeholder="House number and street" value={details.address} onChange={(e) => set("address", e.target.value)} /></label>
      <label className="f">Area in Lagos
        <select className="inp" value={details.area} onChange={(e) => set("area", e.target.value)}>
          {AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </label>
      <div className="opts">
        {(Object.keys(DELIVERY) as Speed[]).map((k) => (
          <label className="opt" key={k}>
            <input type="radio" name="speed" checked={details.speed === k} onChange={() => set("speed", k)} />
            <span><b>{DELIVERY[k].label}</b> · {DELIVERY[k].note}</span><b>{naira(DELIVERY[k].fee)}</b>
          </label>
        ))}
      </div>
      <p className="err" role="alert">{err?.text}</p>
      <button className="primary" type="submit">Continue to payment</button>
    </form>
  );
}

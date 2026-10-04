// POST /api/checkout: re-prices the bag, saves a pending order and starts a Paystack transaction.
import { NextResponse } from "next/server";
import { PAY_LIVE } from "@/lib/config";
import { CheckoutInput, orderRef, priceOrder } from "@/lib/orders";
import { initializeTransaction } from "@/lib/paystack";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!PAY_LIVE) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Sign in to check out" }, { status: 401 });

  const parsed = CheckoutInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check your bag and delivery details", issues: parsed.error.issues }, { status: 400 });

  let priced;
  try {
    priced = priceOrder(parsed.data);
  } catch {
    return NextResponse.json({ error: "A piece in your bag is no longer available" }, { status: 400 });
  }

  const ref = orderRef();
  const { error } = await supabaseAdmin().from("orders").insert({
    ref,
    user_id: user.id,
    email: user.email,
    items: priced.lines,
    subtotal: priced.subtotal,
    delivery_fee: priced.delivery,
    total: priced.total,
    delivery: parsed.data.delivery,
  });
  if (error) {
    console.error("checkout: insert failed", error);
    return NextResponse.json({ error: "Couldn't save your order. Try again." }, { status: 500 });
  }

  try {
    const tx = await initializeTransaction({
      email: user.email,
      amountNaira: priced.total,
      reference: ref,
      metadata: { order_ref: ref, items: priced.lines.map((l) => `${l.name} · ${l.size} × ${l.qty}`).join(", ") },
    });
    return NextResponse.json({ reference: ref, accessCode: tx.access_code, total: priced.total });
  } catch (e) {
    console.error("checkout: paystack initialize failed", e);
    await supabaseAdmin().from("orders").update({ status: "failed" }).eq("ref", ref);
    return NextResponse.json({ error: "Paystack couldn't start the payment. Try again." }, { status: 502 });
  }
}

// POST /api/checkout: re-prices the bag, saves a pending order and starts a Paystack transaction.
import { NextResponse } from "next/server";
import { accLabel } from "@/lib/catalog";
import { PAY_LIVE } from "@/lib/config";
import { CheckoutInput, orderRef, priceOrder } from "@/lib/orders";
import { initializeTransaction } from "@/lib/paystack";
import { createOrder, markFailed } from "@/lib/orders-server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!PAY_LIVE || !process.env.DATABASE_URL) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });

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
  try {
    await createOrder({
      ref,
      userId: user.id,
      email: user.email,
      lines: priced.lines,
      subtotal: priced.subtotal,
      deliveryFee: priced.delivery,
      total: priced.total,
      delivery: parsed.data.delivery,
    });
  } catch (error) {
    console.error("checkout: insert failed", error);
    return NextResponse.json({ error: "Couldn't save your order. Try again." }, { status: 500 });
  }

  try {
    const tx = await initializeTransaction({
      email: user.email,
      amountNaira: priced.total,
      reference: ref,
      metadata: { order_ref: ref, items: priced.lines.map((l) => `${l.name} · ${l.size}${l.acc ? ` + ${accLabel(l.id, true)}` : ""} × ${l.qty}`).join(", ") },
    });
    return NextResponse.json({ reference: ref, accessCode: tx.access_code, total: priced.total });
  } catch (e) {
    console.error("checkout: paystack initialize failed", e);
    await markFailed(ref).catch((err) => console.error("checkout: couldn't mark order failed", err));
    return NextResponse.json({ error: "Paystack couldn't start the payment. Try again." }, { status: 502 });
  }
}

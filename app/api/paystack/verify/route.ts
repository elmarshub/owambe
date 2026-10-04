// POST /api/paystack/verify { reference }: called by the browser after the Paystack popup says "success".
// We ask Paystack ourselves before marking the order paid.
import { NextResponse } from "next/server";
import { z } from "zod";
import { PAY_LIVE } from "@/lib/config";
import { getOrder, publicOrder, settleOrder } from "@/lib/server/orders";
import { verifyTransaction } from "@/lib/server/paystack";
import { supabaseServer } from "@/lib/server/supabase";

const Body = z.object({ reference: z.string().regex(/^OW-[A-Z0-9]+$/) });

export async function POST(request: Request) {
  if (!PAY_LIVE || !process.env.DATABASE_URL) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in again to finish" }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad reference" }, { status: 400 });

  try {
    const order = await getOrder(parsed.data.reference);
    if (!order || order.userId !== user.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const tx = await verifyTransaction(order.ref);
    const result = await settleOrder(order, tx);
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 402 });
    return NextResponse.json({ order: publicOrder(result.order) });
  } catch (e) {
    console.error("verify failed", e);
    return NextResponse.json({ error: "Couldn't confirm the payment yet. It will update shortly." }, { status: 502 });
  }
}

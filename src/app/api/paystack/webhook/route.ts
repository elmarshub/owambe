// POST /api/paystack/webhook: Paystack's server-to-server confirmation, the backup in case the
// shopper closes the tab before the browser's verify call. Set this URL in the Paystack dashboard.
import { NextResponse } from "next/server";
import { getOrder, settleOrder } from "@/lib/orders-server";
import { validWebhookSignature, verifyTransaction } from "@/lib/paystack";

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validWebhookSignature(raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as { event: string; data?: { reference?: string } };
  const ref = event.data?.reference;
  if (event.event === "charge.success" && ref?.startsWith("OW-")) {
    try {
      const order = await getOrder(ref);
      if (order) await settleOrder(order, await verifyTransaction(ref));
    } catch (e) {
      console.error("webhook: settle failed", e);
      return NextResponse.json({ error: "Retry later" }, { status: 500 }); // Paystack retries non-200s
    }
  }
  return NextResponse.json({ received: true });
}

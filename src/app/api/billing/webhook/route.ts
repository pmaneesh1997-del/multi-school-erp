import { createHmac, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { eq } from "drizzle-orm";
import { getPlanFromId, planPrices } from "@/lib/billing/razorpay";
import { getDb } from "@/lib/db";
import { billingInvoices, subscriptions } from "@/lib/db/schema";

type RazorpaySubscription = {
  id: string;
  plan_id: string;
  status: string;
  current_start?: number | null;
  current_end?: number | null;
  notes?: Record<string, string>;
};

type RazorpayPayment = {
  id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: string;
  created_at?: number;
  notes?: Record<string, string>;
};

type RazorpayWebhookEvent = {
  event: string;
  payload?: {
    subscription?: { entity?: RazorpaySubscription };
    payment?: { entity?: RazorpayPayment };
  };
};

function fromUnixSeconds(value: number | null | undefined) {
  return value ? new Date(value * 1000) : null;
}

function verifySignature(body: string, receivedHex: string, secret: string) {
  const expected = createHmac("sha256", secret).update(body).digest();
  const received = Buffer.from(receivedHex, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

async function syncSubscription(value: RazorpaySubscription) {
  const [existing] = await getDb().select().from(subscriptions).where(eq(subscriptions.razorpaySubscriptionId, value.id)).limit(1);
  const rawGroupId = value.notes?.schoolGroupId ?? String(existing?.groupId ?? "");
  const groupId = Number(rawGroupId);
  if (!Number.isFinite(groupId)) return;

  const status = value.status === "active" ? "active" : value.status === "halted" ? "past_due" : value.status === "cancelled" || value.status === "completed" || value.status === "expired" ? "canceled" : value.status === "authenticated" ? "active" : "incomplete";
  const interval = planInterval(value.plan_id);
  await getDb().insert(subscriptions).values({
    groupId,
    plan: getPlanFromId(value.plan_id),
    status,
    billingInterval: interval,
    razorpaySubscriptionId: value.id,
    currentPeriodStart: fromUnixSeconds(value.current_start),
    currentPeriodEnd: fromUnixSeconds(value.current_end),
    cancelAtPeriodEnd: status === "canceled" ? 1 : 0,
  }).onDuplicateKeyUpdate({
    set: {
      plan: getPlanFromId(value.plan_id),
      status,
      billingInterval: interval,
      currentPeriodStart: fromUnixSeconds(value.current_start),
      currentPeriodEnd: fromUnixSeconds(value.current_end),
      cancelAtPeriodEnd: status === "canceled" ? 1 : 0,
      updatedAt: new Date(),
    },
  });
}

function planInterval(planId: string): "month" | "year" {
  for (const prices of Object.values(planPrices)) {
    if (prices.year === planId) return "year";
    if (prices.month === planId) return "month";
  }
  return "month";
}

async function syncPayment(value: RazorpayPayment) {
  const subscriptionId = value.subscription_id ?? value.notes?.razorpaySubscriptionId;
  if (!subscriptionId) return;
  const [subscription] = await getDb().select().from(subscriptions).where(eq(subscriptions.razorpaySubscriptionId, subscriptionId)).limit(1);
  if (!subscription) return;

  await getDb().insert(billingInvoices).values({
    groupId: subscription.groupId,
    razorpayPaymentId: value.id,
    amountPaid: value.amount,
    currency: value.currency.toLowerCase(),
    status: value.status,
    paidAt: value.status === "captured" ? fromUnixSeconds(value.created_at) : null,
  }).onDuplicateKeyUpdate({
    set: {
      amountPaid: value.amount,
      status: value.status,
      paidAt: value.status === "captured" ? fromUnixSeconds(value.created_at) : null,
    },
  });
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !process.env.DATABASE_URL) return new Response("Billing webhook is not configured", { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature || !verifySignature(rawBody, signature, secret)) return new Response("Invalid Razorpay signature", { status: 400 });

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return new Response("Invalid event payload", { status: 400 });
  }

  try {
    if (event.event.startsWith("subscription.") && event.payload?.subscription?.entity) {
      await syncSubscription(event.payload.subscription.entity);
    }
    if (["payment.captured", "payment.failed", "subscription.charged"].includes(event.event) && event.payload?.payment?.entity) {
      await syncPayment(event.payload.payment.entity);
    }
  } catch (error) {
    console.error("Razorpay webhook processing failed", error);
    return new Response("Webhook processing failed", { status: 500 });
  }

  return Response.json({ received: true });
}

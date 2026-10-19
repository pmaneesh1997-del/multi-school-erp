'use server';

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getRazorpay, isPlanKey, planPrices, type BillingInterval } from "@/lib/billing/razorpay";
import { getDb } from "@/lib/db";
import { schoolGroups, subscriptions } from "@/lib/db/schema";

const billingRoles = new Set(["group_owner", "group_admin", "platform_admin"]);

async function getBillingAdmin() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!billingRoles.has(session.role)) redirect("/billing?notice=contact-admin");
  return session;
}

export async function startSubscription(formData: FormData) {
  const session = await getBillingAdmin();
  const plan = String(formData.get("plan"));
  const interval = String(formData.get("interval"));
  if (!isPlanKey(plan) || (interval !== "month" && interval !== "year")) redirect("/billing?notice=invalid-plan");

  const planId = planPrices[plan][interval as BillingInterval];
  if (!planId || !process.env.RAZORPAY_KEY_ID || !process.env.NEXT_PUBLIC_APP_URL) {
    redirect("/billing?notice=configure-billing");
  }

  const database = getDb();
  const [group] = await database.select().from(schoolGroups).where(eq(schoolGroups.id, session.groupId)).limit(1);
  if (!group) redirect("/billing?notice=group-not-found");

  const [existing] = await database.select().from(subscriptions).where(eq(subscriptions.groupId, session.groupId)).limit(1);
  if (existing?.status === "active") redirect("/billing?notice=contact-plan-change");
  const created = await getRazorpay().subscriptions.create({
    plan_id: planId,
    total_count: interval === "year" ? 10 : 120,
    quantity: 1,
    customer_notify: true,
    expire_by: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    notes: { schoolGroupId: session.groupId, plan, interval },
  });

  if (existing) {
    await database.update(subscriptions).set({
      plan,
      billingInterval: interval,
      razorpaySubscriptionId: created.id,
      status: "incomplete",
      updatedAt: new Date(),
    }).where(eq(subscriptions.groupId, session.groupId));
  } else {
    await database.insert(subscriptions).values({
      groupId: session.groupId,
      plan,
      billingInterval: interval,
      razorpaySubscriptionId: created.id,
      status: "incomplete",
    });
  }

  if (!created.short_url) redirect("/billing?notice=checkout-error");
  redirect(created.short_url);
}

export async function cancelSubscription() {
  const session = await getBillingAdmin();
  const [subscription] = await getDb().select().from(subscriptions).where(and(
    eq(subscriptions.groupId, session.groupId),
    eq(subscriptions.status, "active"),
  )).limit(1);
  if (!subscription?.razorpaySubscriptionId) redirect("/billing?notice=configure-billing");

  await getRazorpay().subscriptions.cancel(subscription.razorpaySubscriptionId, true);
  await getDb().update(subscriptions).set({ cancelAtPeriodEnd: 1, updatedAt: new Date() }).where(eq(subscriptions.id, subscription.id));
  redirect("/billing?notice=cancel-scheduled");
}

import "server-only";

import Razorpay from "razorpay";

let razorpay: Razorpay | undefined;

export function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay is not configured.");
  }
  razorpay ??= new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  return razorpay;
}

export const planPrices = {
  starter: {
    month: process.env.RAZORPAY_PLAN_STARTER_MONTH,
    year: process.env.RAZORPAY_PLAN_STARTER_YEAR,
  },
  growth: {
    month: process.env.RAZORPAY_PLAN_GROWTH_MONTH,
    year: process.env.RAZORPAY_PLAN_GROWTH_YEAR,
  },
  enterprise: {
    month: process.env.RAZORPAY_PLAN_ENTERPRISE_MONTH,
    year: process.env.RAZORPAY_PLAN_ENTERPRISE_YEAR,
  },
} as const;

export type PlanKey = keyof typeof planPrices;
export type BillingInterval = "month" | "year";

export function getPlanFromId(planId: string): PlanKey {
  for (const [plan, plans] of Object.entries(planPrices) as [PlanKey, (typeof planPrices)[PlanKey]][]) {
    if (plans.month === planId || plans.year === planId) return plan;
  }
  return "starter";
}

export function isPlanKey(value: string): value is PlanKey {
  return value in planPrices;
}

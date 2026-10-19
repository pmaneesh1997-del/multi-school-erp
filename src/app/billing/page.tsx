import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  CreditCard,
  GraduationCap,
  Headphones,
  LockKeyhole,
  Sparkles,
  XCircle,
} from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cancelSubscription, startSubscription } from "@/app/actions/billing";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { billingInvoices, subscriptions } from "@/lib/db/schema";

const planDetails = [
  {
    key: "starter",
    name: "Starter",
    description: "A calm, capable start for one campus.",
    monthly: 4999,
    yearly: 3999,
    campuses: "1 campus",
    students: "Up to 500 students",
    features: ["Student records & admissions", "Attendance and class rosters", "Family communication", "Email support"],
  },
  {
    key: "growth",
    name: "Growth",
    description: "More visibility as your school group grows.",
    monthly: 12999,
    yearly: 10399,
    campuses: "Up to 5 campuses",
    students: "Up to 3,000 students",
    features: ["Everything in Starter", "Cross-campus reporting", "Staff and academic management", "Priority support"],
    featured: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    description: "Flexible operations for larger networks.",
    monthly: 29999,
    yearly: 23999,
    campuses: "Unlimited campuses",
    students: "Unlimited students",
    features: ["Everything in Growth", "Advanced permissions & audit logs", "Data exports and integrations", "Dedicated success manager"],
  },
] as const;

const statusLabels: Record<string, string> = {
  active: "Active",
  past_due: "Payment due",
  canceled: "Canceled",
  incomplete: "Awaiting authorization",
};

export default function BillingPage({ searchParams }: { searchParams: Promise<{ interval?: string; notice?: string }> }) {
  return <Suspense fallback={<div className="billing-loading">Loading billing details...</div>}><BillingContent searchParams={searchParams} /></Suspense>;
}

async function BillingContent({ searchParams }: { searchParams: Promise<{ interval?: string; notice?: string }> }) {
  const [{ interval, notice }, session] = await Promise.all([searchParams, getSession()]);
  if (!session) redirect("/sign-in");

  const isBillingAdmin = ["group_owner", "group_admin", "platform_admin"].includes(session.role);
  const billingData = process.env.DATABASE_URL
    ? await Promise.all([
        getDb().select().from(subscriptions).where(eq(subscriptions.groupId, session.groupId)).limit(1),
        getDb().select().from(billingInvoices).where(eq(billingInvoices.groupId, session.groupId)).orderBy(desc(billingInvoices.createdAt)).limit(6),
      ])
    : [[], []] as const;
  const subscription = billingData[0][0];
  const invoices = billingData[1];
  const selectedInterval = interval === "year" ? "year" : "month";
  const currentPlan = subscription?.plan ?? "starter";
    const active = subscription?.status === "active";

  return (
    <main className="billing-shell">
      <header className="billing-topbar">
          <Link className="billing-brand" href="/"><span className="billing-brand-mark"><span /><span /><span /><span /></span>Kartik <strong>Education</strong></Link>
        <div className="billing-top-actions"><span><Building2 size={15} /> {session.name} · {session.role.replaceAll("_", " ")}</span><Link href="/" className="billing-back"><ArrowLeft size={15} /> Back to workspace</Link></div>
      </header>

      <div className="billing-content">
        <div className="billing-breadcrumb"><Link href="/">Workspace</Link><span>/</span><strong>Billing &amp; plan</strong></div>
        <section className="billing-heading">
          <div><span className="billing-kicker"><Sparkles size={13} /> SCHOOL GROUP SUBSCRIPTIONS</span><h1>Plans that grow with your schools.</h1><p>One subscription for your school group. Change plans as your community grows.</p></div>
          <div className="billing-trust"><LockKeyhole size={16} /><span>Secure billing<br /><strong>Powered by Razorpay</strong></span></div>
        </section>

        {notice && <div className={`billing-notice ${notice === "configure-billing" || notice === "contact-admin" || notice === "contact-plan-change" ? "notice-warn" : ""}`} role="status">
          {notice === "checkout-success" ? "Authorization received. Your plan will become active after Razorpay confirms it." :
            notice === "checkout-canceled" ? "Checkout was canceled. Your current plan has not changed." :
              notice === "cancel-scheduled" ? "Cancellation is scheduled for the end of the current billing period." :
                notice === "contact-plan-change" ? "To change an active plan, contact your account manager. This prevents duplicate charges while plan changes are arranged." :
              notice === "contact-admin" ? "Ask a school group owner or group administrator to manage billing." :
                notice === "configure-billing" ? "Online checkout is not configured yet. Contact your administrator to finish billing setup." :
                  notice === "invalid-plan" ? "That plan selection was not valid. Please choose a plan below." :
                    notice === "group-not-found" ? "Your account is not connected to a school group yet." : "We could not start checkout. Please try again or contact support."}
        </div>}

        <section className="current-plan-bar">
          <div className="current-plan-icon"><BadgeCheck size={20} /></div>
          <div className="current-plan-info"><span>YOUR CURRENT PLAN</span><strong>{subscription ? `${currentPlan[0].toUpperCase()}${currentPlan.slice(1)} · ${statusLabels[subscription.status] ?? subscription.status}` : "Starter · No active subscription"}</strong></div>
          <div className="current-plan-meta">{subscription?.currentPeriodEnd ? <><CalendarDays size={14} /> {subscription.cancelAtPeriodEnd ? "Access through" : "Next renewal"} {subscription.currentPeriodEnd.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</> : <><Headphones size={14} /> Secure authorization through Razorpay</>}</div>
          {subscription?.status === "active" && !subscription.cancelAtPeriodEnd && <form action={cancelSubscription}><button className="portal-button" type="submit"><XCircle size={15} /> Cancel plan</button></form>}
        </section>

        <div className="plan-toolbar"><div><h2>Choose your plan</h2><p>All plans include secure hosting and regular product updates.</p></div><div className="interval-switch" aria-label="Billing interval"><Link href="/billing?interval=month" className={selectedInterval === "month" ? "interval-active" : ""}>Monthly</Link><Link href="/billing?interval=year" className={selectedInterval === "year" ? "interval-active" : ""}>Yearly <span>Save 20%</span></Link></div></div>

        <section className="plan-grid" aria-label="Available subscription plans">
          {planDetails.map((plan) => {
            const isCurrent = plan.key === currentPlan && active;
            const price = selectedInterval === "year" ? plan.yearly : plan.monthly;
            return <article className={`plan-card ${"featured" in plan && plan.featured ? "plan-featured" : ""}`} key={plan.key}>
              {"featured" in plan && plan.featured && <span className="popular-label">MOST POPULAR</span>}
              <div className="plan-card-head"><div><h3>{plan.name}</h3><p>{plan.description}</p></div>{"featured" in plan && plan.featured && <span className="plan-sparkle"><Sparkles size={17} /></span>}</div>
              <div className="plan-price"><strong>₹{price.toLocaleString("en-IN")}</strong><span>/ school group / month</span></div>
              {selectedInterval === "year" && <p className="annual-note">Billed annually at ₹{plan.yearly * 12}/year</p>}
              <div className="plan-limits"><span><Building2 size={14} />{plan.campuses}</span><span><GraduationCap size={14} />{plan.students}</span></div>
              {isCurrent ? <button className="plan-cta cta-current" disabled><Check size={15} /> Current plan</button> : subscription?.status === "active" ? <button className="plan-cta cta-current" disabled>Contact to change plan</button> : isBillingAdmin ? <form action={startSubscription}>
                <input type="hidden" name="plan" value={plan.key} /><input type="hidden" name="interval" value={selectedInterval} />
                <button className={`plan-cta ${"featured" in plan && plan.featured ? "cta-featured" : ""}`} type="submit">Continue to checkout<ArrowRight size={15} /></button>
              </form> : <button className="plan-cta cta-current" disabled>Contact your group admin</button>}
              <div className="plan-divider" /><p className="included-label">WHAT&apos;S INCLUDED</p>
              <ul>{plan.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul>
            </article>;
          })}
        </section>

        <section className="invoice-section">
          <div className="invoice-heading"><div><h2>Payment history</h2><p>Payments and receipts for your school group</p></div>{subscription?.status === "active" && <span className="payment-provider"><CreditCard size={13} /> Razorpay</span>}</div>
          {invoices.length ? <div className="invoice-table-wrap"><table className="invoice-table"><thead><tr><th>PAYMENT ID</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th /></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td className="invoice-number">{invoice.razorpayPaymentId}</td><td>{invoice.paidAt?.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) ?? invoice.createdAt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</td><td>{new Intl.NumberFormat("en-IN", { style: "currency", currency: invoice.currency.toUpperCase() }).format(invoice.amountPaid / 100)}</td><td><span className={`invoice-status ${invoice.status === "captured" ? "invoice-paid" : ""}`}>{invoice.status}</span></td><td>{invoice.invoiceUrl && <a className="invoice-download" href={invoice.invoiceUrl} target="_blank" rel="noreferrer" aria-label="Open receipt"><ArrowDownToLine size={16} /></a>}</td></tr>)}</tbody></table></div> : <div className="invoice-empty"><span><CreditCard size={18} /></span><div><strong>No payments yet</strong><p>Payment receipts will appear here after your first subscription charge.</p></div></div>}
        </section>
        <footer className="billing-footer"><span>Questions about plans? <a href="mailto:support@kartik.education">Talk to our team</a></span><span>Payments securely processed by Razorpay</span></footer>
      </div>
    </main>
  );
}

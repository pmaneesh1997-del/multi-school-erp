import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  PlugZap,
  Settings2,
} from "lucide-react";
import type { FeatureDefinition } from "@/lib/auth/feature-access";

const setupSteps: Record<string, string[]> = {
  "ai-assistant": ["Choose an AI provider and create an API credential.", "Define which school records the assistant may use.", "Add audit and usage limits before enabling staff access."],
  "gps-tracking": ["Register supported GPS devices or a fleet provider.", "Add vehicles, routes, and authorized driver accounts.", "Set parent visibility and location-retention rules."],
  "biometric-attendance": ["Confirm device model and vendor API support.", "Configure a signed device webhook endpoint.", "Map device identities to student or staff records."],
  "parent-app": ["Configure parent identity verification and student linking.", "Choose mobile app distribution and notification providers.", "Set which attendance, fee, and academic data families can see."],
  "online-payments": ["Configure a payment gateway in test mode.", "Set fee plans, currencies, and payment reconciliation rules.", "Verify webhooks before accepting live payments."],
  "exams-results": ["Configure academic year, exam periods, and grading scales.", "Assign subjects and mark entry permissions.", "Publish results only after approval permissions are defined."],
  "parent-communication": ["Choose email, SMS, or messaging providers.", "Verify sender identity and message templates.", "Set consent, delivery logs, and audience permissions."],
  "inventory-assets": ["Create campus stock locations and asset categories.", "Define issue, return, and maintenance workflows.", "Assign staff permissions for inventory adjustments."],
  library: ["Create a campus catalogue and book categories.", "Set lending periods, renewals, and overdue rules.", "Register library staff and member identities."],
  transport: ["Register vehicles, routes, stops, and assigned drivers.", "Configure transport enrollment and emergency contacts.", "Add a GPS provider to enable live location updates."],
  hostel: ["Configure residences, rooms, and occupancy limits.", "Set room allocation and check-in permissions.", "Define resident contacts and incident workflows."],
  lms: ["Select an LMS or course-content provider.", "Connect classes, teachers, and student rosters.", "Set assignment, media, and online-session permissions."],
  certificates: ["Choose certificate templates and school branding.", "Map required student fields and signing authority.", "Set issue numbering and verification rules."],
  languages: ["Choose the languages available to staff and families.", "Provide approved translations for school terminology.", "Set a default language and per-user preference."],
  security: ["Review user roles and least-privilege access.", "Set retention, export, and backup requirements.", "Configure audit review and incident escalation owners."],
  "communication-hub": ["Connect approved email, SMS, or chat providers.", "Create message templates and audience rules.", "Configure delivery status, consent, and audit history."],
};

const routeByFeature: Record<string, { label: string; href: string }> = {
  students: { label: "Student lifecycle", href: "/students" },
  staff: { label: "Staff & HR", href: "/staff" },
  academics: { label: "Academics & timetable", href: "/academics" },
  attendance: { label: "Attendance", href: "/attendance" },
  finance: { label: "Fee collection", href: "/finance" },
  reports: { label: "Reports & analytics", href: "/reports" },
  billing: { label: "Billing & subscriptions", href: "/billing" },
  settings: { label: "Schools & campuses", href: "/settings" },
};

export function FeatureWorkspace({ feature }: { feature: FeatureDefinition }) {
  const steps = setupSteps[feature.id] ?? ["Review the school workflow and required data fields.", "Confirm responsible roles and campus-level access.", "Connect the required service before using this feature with live records."];
  const relatedRoutes = Object.entries(routeByFeature).filter(([id]) => id !== feature.id);
  const stateLabel = feature.state === "Preview" ? "Preview workspace" : feature.state === "Connected" ? "Connected service" : "Setup required";

  return (
    <div className="feature-workspace">
      <Link href="/modules" className="feature-back-link"><ArrowLeft size={15} /> All features</Link>
      <header className="feature-workspace-heading">
        <div>
          <span className="section-index">{feature.category.toUpperCase()}</span>
          <h1>{feature.label}</h1>
          <p>{feature.summary}</p>
        </div>
        <span className={`feature-workspace-state ${feature.state === "Connected" ? "feature-state-connected" : feature.state === "Preview" ? "feature-state-preview" : "feature-state-setup"}`}>
          {feature.state === "Setup required" ? <CircleAlert size={14} /> : feature.state === "Connected" ? <CheckCircle2 size={14} /> : <Settings2 size={14} />}{stateLabel}
        </span>
      </header>

      <section className="feature-workspace-grid">
        <article className="feature-workspace-main">
          <div className="feature-content-heading"><span className="feature-content-icon"><PlugZap size={18} /></span><div><h2>{feature.state === "Setup required" ? "Setup checklist" : "Workspace status"}</h2><p>{feature.state === "Setup required" ? "Complete these requirements before enabling live use." : "Current capability and next steps for this feature."}</p></div></div>
          {feature.state === "Setup required" ? <ol className="feature-setup-list">{steps.map((step, index) => <li key={step}><span className="feature-step-number">{String(index + 1).padStart(2, "0")}</span><span className="feature-step-copy">{step}</span><CircleAlert size={15} /></li>)}</ol> : <div className="feature-status-message"><CheckCircle2 size={18} /><span>{feature.state === "Preview" ? "This section currently uses preview content. Live data actions are not connected yet." : "This service has a route in the workspace. Provider settings and production credentials may still be required."}</span></div>}
          {feature.state === "Setup required" && <p className="feature-honesty-note">No external service is connected from this page yet. No device data, payments, messages, or AI requests are being processed.</p>}
        </article>
        <aside className="feature-workspace-aside">
          <span className="section-index">WORKSPACE</span><h2>Available school areas</h2>
          <div className="feature-related-links">{relatedRoutes.slice(0, 5).map(([id, route]) => <Link href={route.href} key={id}><span>{route.label}</span><ArrowUpRight size={14} /></Link>)}</div>
          <Link href="/settings" className="feature-settings-link">School &amp; campus settings <ExternalLink size={13} /></Link>
        </aside>
      </section>
    </div>
  );
}

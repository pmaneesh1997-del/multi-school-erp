import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpenCheck,
  Boxes,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  GraduationCap,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { getRoleFeatures } from "@/lib/auth/feature-access";

const featureIcons = { Activity, BookOpenCheck, Boxes, Building2, CalendarDays, CircleDollarSign, GraduationCap, UsersRound, WalletCards };
const connectedAppIds = ["ai-assistant", "gps-tracking", "biometric-attendance", "parent-app", "online-payments"] as const;

export function DashboardOverview({ userName, userRole }: { userName: string; userRole: string }) {
  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(today);
  const roleFeatures = getRoleFeatures(userRole);
  const quickFeatures = roleFeatures.filter((feature) => feature.featured && feature.id !== "overview");
  const dailyOperations = roleFeatures.filter((feature) => ["attendance", "academics", "finance"].includes(feature.id));
  const connectedApps = roleFeatures.filter((feature) => connectedAppIds.includes(feature.id as (typeof connectedAppIds)[number]));
  const firstName = userName.trim().split(/\s+/)[0] || "there";

  return (
    <div className="command-dashboard">
      <section className="dashboard-masthead">
        <div className="masthead-copy">
          <div className="masthead-overline"><span className="live-dot" /> MULTI-CAMPUS SCHOOL OPERATIONS <span className="masthead-divider" /> {dateLabel.toUpperCase()}</div>
          <h1>One platform.<br /><span>Every school.</span></h1>
          <p>Good day, {firstName}. Your school group workspace is ready.</p>
          <div className="masthead-actions"><Link href="/modules" className="masthead-primary"><Boxes size={16} /> Browse all {roleFeatures.length} features <ChevronRight size={15} /></Link><span className="role-label">{userRole.replaceAll("_", " ")}</span></div>
        </div>
        <div className="masthead-visual" aria-label="School group platform overview">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="visual-campus campus-main"><span className="campus-building-icon"><GraduationCap size={25} /></span><strong>School group</strong><small>One connected workspace</small></div>
          <div className="visual-campus campus-east"><span className="mini-campus-dot dot-coral" /><span>Academics</span></div>
          <div className="visual-campus campus-west"><span className="mini-campus-dot dot-green" /><span>Operations</span></div>
          <div className="visual-campus campus-south"><span className="mini-campus-dot dot-blue" /><span>Families</span></div>
          <span className="visual-link link-east" /><span className="visual-link link-west" /><span className="visual-link link-south" />
        </div>
        <div className="masthead-footnote"><span>01</span><i /> SCHOOL GROUP OVERVIEW</div>
      </section>

      <div className="preview-notice"><Activity size={15} /><span><strong>Workspace preview</strong> The sample figures below are illustrative. Live school records have not been connected yet.</span></div>

      <section className="overview-stat-grid" aria-label="School operations snapshot">
        <article className="overview-stat"><span className="overview-stat-icon stat-coral"><GraduationCap size={18} /></span><span className="overview-stat-label">Students</span><strong>2,418</strong><small><ArrowUpRight size={13} /> Admissions preview</small></article>
        <article className="overview-stat"><span className="overview-stat-icon stat-blue"><UsersRound size={18} /></span><span className="overview-stat-label">Staff members</span><strong>486</strong><small><ArrowUpRight size={13} /> Team overview</small></article>
        <article className="overview-stat"><span className="overview-stat-icon stat-green"><CalendarDays size={18} /></span><span className="overview-stat-label">Attendance today</span><strong>94.6%</strong><small><ArrowUpRight size={13} /> Daily register preview</small></article>
        <article className="overview-stat"><span className="overview-stat-icon stat-gold"><CircleDollarSign size={18} /></span><span className="overview-stat-label">Fee collection</span><strong>₹28.45L</strong><small><ArrowDownRight size={13} /> Finance preview</small></article>
      </section>

      <section className="dashboard-section feature-launcher">
        <div className="dashboard-section-heading"><div><span className="section-index">02 / WORKSPACE</span><h2>Your school tools</h2><p>Features available for your {userRole.replaceAll("_", " ")} role.</p></div><Link href="/modules" className="section-link">View complete directory <ChevronRight size={15} /></Link></div>
        <div className="feature-launch-grid">
          {quickFeatures.map((feature, index) => {
            const Icon = featureIcons[feature.icon as keyof typeof featureIcons] ?? Boxes;
            const stateLabel = feature.state === "Preview" ? "Sample workspace" : feature.state === "Connected" ? "Connected" : "Setup required";
            return <Link className={`feature-launch-item launch-tone-${index % 5}`} href={feature.href} key={feature.id}>
              <span className="launch-icon"><Icon size={19} strokeWidth={1.8} /></span>
              <span className="launch-copy"><small>{feature.category}</small><strong>{feature.label}</strong><span>{feature.summary}</span></span>
              <span className={`launch-state ${feature.state === "Connected" ? "launch-connected" : feature.state === "Preview" ? "launch-preview" : "launch-pending"}`}>{stateLabel}</span><ChevronRight className="launch-chevron" size={16} />
            </Link>;
          })}
        </div>
      </section>

      <section className="dashboard-section connected-section">
        <div className="dashboard-section-heading"><div><span className="section-index">03 / CONNECTED ECOSYSTEM</span><h2>Apps &amp; integrations</h2><p>External services that extend the school workspace.</p></div><Link href="/modules" className="section-link">Manage integrations <ChevronRight size={15} /></Link></div>
        <div className="integration-rail">
          {connectedApps.map((feature) => {
            const Icon = featureIcons[feature.icon as keyof typeof featureIcons] ?? Boxes;
            return <Link href={feature.href} className="integration-item" key={feature.id}><span className="integration-icon"><Icon size={18} /></span><span><strong>{feature.label}</strong><small>{feature.state === "Connected" ? "Connected" : "Configuration needed"}</small></span><ChevronRight size={14} /></Link>;
          })}
          {!connectedApps.length && <p className="integration-empty">No integrations are assigned to this role.</p>}
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="operations-panel">
          <div className="dashboard-section-heading compact"><div><span className="section-index">04 / TODAY</span><h2>Daily operations</h2></div><span className="today-pill">{dateLabel}</span></div>
          {dailyOperations.map((feature, index) => {
            const icon = feature.id === "attendance" ? CalendarDays : feature.id === "academics" ? BookOpenCheck : WalletCards;
            const Icon = icon;
            const detail = feature.id === "attendance" ? "Review campus attendance status" : feature.id === "academics" ? "Open schedules and learning plans" : "View collections and outstanding dues";
            return <Link href={feature.href} className="operation-row" key={feature.id}><span className={`operation-marker marker-${["orange", "blue", "green"][index % 3]}`}><Icon size={16} /></span><span><strong>{feature.label}</strong><small>{detail}</small></span><span className="operation-time">Today</span><ChevronRight size={15} /></Link>;
          })}
          {!dailyOperations.length && <p className="integration-empty">No daily operations are assigned to this role.</p>}
        </article>
        <article className="ecosystem-panel"><span className="section-index">05 / SCHOOL NETWORK</span><h2>Connected by design.</h2><p>Bring student services, academic teams, and school operations together across every campus.</p><div className="ecosystem-nodes"><span><GraduationCap size={16} /> Learners</span><i /><span><UsersRound size={16} /> Teams</span><i /><span><Building2 size={16} /> Campuses</span></div><Link href="/modules" className="ecosystem-link">Explore the platform <ChevronRight size={15} /></Link></article>
      </section>

      <footer className="dashboard-footer"><span>© 2026 Kartik Education</span><span><Activity size={13} /> {roleFeatures.length} role-enabled features <i className="footer-divider" /> {dateLabel}</span></footer>
    </div>
  );
}

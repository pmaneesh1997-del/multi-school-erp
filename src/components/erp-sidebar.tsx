'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  CalendarDays,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings2,
  UsersRound,
  ChartNoAxesCombined,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";

const workspaceLinks = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Students", href: "/students", icon: GraduationCap, badge: "2,418" },
  { label: "Staff & teachers", href: "/staff", icon: UsersRound },
  { label: "Academics", href: "/academics", icon: BookOpenCheck },
  { label: "Attendance", href: "/attendance", icon: CalendarDays },
  { label: "Finance", href: "/finance", icon: CreditCard },
];

const managementLinks = [
  { label: "Reports", href: "/reports", icon: ChartNoAxesCombined },
  { label: "Billing & plan", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings2 },
];

export function ErpSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const initials = userName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside className="sidebar">
      <Link className="brand" href="/" aria-label="Kartik Education home">
        <span className="brand-mark"><span /><span /><span /><span /></span>
        <span className="brand-name">Kartik<strong> Education</strong><small>LEARNING, CONNECTED</small></span>
      </Link>
      <button className="school-switcher" type="button" aria-label="Current school group">
        <span className="school-monogram">K</span>
        <span className="school-copy"><strong>Kartik Education Group</strong><small>School group</small></span>
        <span className="school-switcher-caret">⌄</span>
      </button>

      <div className="nav-section-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">
        {workspaceLinks.map(({ label, href, icon: Icon, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return <Link key={label} className={`nav-link ${active ? "selected" : ""}`} href={href} aria-current={active ? "page" : undefined}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{badge && <small>{badge}</small>}
          </Link>;
        })}
      </nav>

      <div className="nav-section-label management-label">MANAGEMENT</div>
      <nav className="main-nav" aria-label="Management navigation">
        {managementLinks.map(({ label, href, icon: Icon }) => {
          const active = href === "/billing" ? pathname === "/billing" : pathname.startsWith(href);
          return <Link key={label} className={`nav-link ${active ? "selected" : ""}`} href={href} aria-current={active ? "page" : undefined}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
          </Link>;
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="support-card">
          <span className="support-icon"><span aria-hidden="true">?</span></span>
          <strong>Need a hand?</strong>
          <p>Our team is here to help you.</p>
          <a href="mailto:support@kartik.education">Contact support <span aria-hidden="true">↗</span></a>
        </div>
        <div className="profile-row">
          <span className="avatar admin-avatar">{initials}</span>
          <span className="profile-copy"><strong>{userName}</strong><small>{userRole.replaceAll("_", " ")}</small></span>
          <span className="profile-presence" aria-label="Signed in" />
        </div>
        <form action={signOut} className="logout-form">
          <button type="submit" className="logout-button">
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

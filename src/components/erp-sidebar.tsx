'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Award,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  BusFront,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  CircleDollarSign,
  CreditCard,
  Fingerprint,
  GraduationCap,
  Languages,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  MapPinned,
  MessageSquareText,
  MonitorPlay,
  PackageOpen,
  Settings2,
  ShieldCheck,
  Smartphone,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { getRoleFeatures } from "@/lib/auth/feature-access";

const featureIcons = {
  Activity,
  Award,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  BusFront,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  CircleDollarSign,
  CreditCard,
  Fingerprint,
  GraduationCap,
  Languages,
  LayoutDashboard,
  LibraryBig,
  MapPinned,
  MessageSquareText,
  MonitorPlay,
  PackageOpen,
  Settings2,
  ShieldCheck,
  Smartphone,
  UsersRound,
  WalletCards,
};

const navigationCategories = ["Workspace", "School operations", "Connected apps", "Administration"] as const;

export function ErpSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const initials = userName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const roleFeatures = getRoleFeatures(userRole);

  return (
    <aside className="sidebar">
      <Link className="brand" href="/" aria-label="Kartik Education home">
        <span className="brand-mark"><span /><span /><span /><span /></span>
        <span className="brand-name">Kartik<strong> Education</strong><small>LEARNING, CONNECTED</small></span>
      </Link>
      

      <nav className="sidebar-navigation" aria-label="School ERP features">
        {navigationCategories.map((category) => {
          const categoryFeatures = roleFeatures.filter((feature) => feature.category === category);
          if (!categoryFeatures.length) return null;
          return <section className="sidebar-feature-group" key={category}>
            <div className="nav-section-label">{category.toUpperCase()}</div>
            <div className="main-nav">
              {categoryFeatures.map((feature) => {
                const Icon = featureIcons[feature.icon as keyof typeof featureIcons] ?? LayoutDashboard;
                const active = feature.href === "/" ? pathname === "/" : pathname === feature.href.split("#")[0];
                return <Link key={feature.id} className={`nav-link ${active ? "selected" : ""}`} href={feature.href} aria-current={active ? "page" : undefined} title={feature.label}>
                  <Icon size={17} strokeWidth={1.8} /><span>{feature.label}</span>{feature.state === "Setup required" && <small className="nav-setup-dot" aria-label="Setup required" />}
                </Link>;
              })}
            </div>
          </section>;
        })}
      </nav>

      <div className="sidebar-bottom">
        
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

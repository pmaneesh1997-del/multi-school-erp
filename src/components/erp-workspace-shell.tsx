'use client';

import type { ReactNode } from "react";
import { Bell, CalendarDays, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { ErpSidebar } from "@/components/erp-sidebar";
import { features } from "@/lib/auth/feature-access";

const routeTitles: Record<string, string> = {
  "/modules": "All modules",
  "/students": "Students",
  "/staff": "Staff & teachers",
  "/academics": "Academics",
  "/attendance": "Attendance",
  "/finance": "Finance",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function ErpWorkspaceShell({
  children,
  userName,
  userRole,
}: {
  children: ReactNode;
  userName: string;
  userRole: string;
}) {
  const pathname = usePathname();
  const section = routeTitles[pathname] ?? features.find((feature) => feature.href === pathname)?.label ?? "Workspace";
  return (
    <main className="erp-shell">
      <ErpSidebar userName={userName} userRole={userRole} />
      <section className="workspace">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-divider">/</span><strong>{section}</strong></div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={17} /><input aria-label="Search workspace" placeholder="Search this workspace..." /><kbd>⌘ K</kbd></label>
            <button className="icon-button notification-button" type="button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <span className="topbar-divider" />
            <button className="date-button" type="button"><CalendarDays size={16} /> Academic year 2026–27</button>
          </div>
        </header>
        <div className="dashboard-content module-content">{children}</div>
      </section>
    </main>
  );
}

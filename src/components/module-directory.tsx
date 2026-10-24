'use client';

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Award,
  BookOpenCheck,
  BrainCircuit,
  Boxes,
  Building2,
  BusFront,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  Fingerprint,
  GraduationCap,
  Languages,
  LibraryBig,
  MapPinned,
  MessageSquareText,
  MonitorPlay,
  PackageOpen,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { getRoleFeatures, type FeatureCategory } from "@/lib/auth/feature-access";

const featureIcons = { Activity, Award, BookOpenCheck, BrainCircuit, Building2, BusFront, CalendarDays, ChartNoAxesCombined, CircleDollarSign, ClipboardCheck, CreditCard, Fingerprint, GraduationCap, Languages, LibraryBig, MapPinned, MessageSquareText, MonitorPlay, PackageOpen, Settings2, ShieldCheck, Smartphone, UsersRound, WalletCards };
const categories: FeatureCategory[] = ["Workspace", "School operations", "Connected apps", "Administration"];
const categoryOptions: (FeatureCategory | "All modules")[] = ["All modules", ...categories];

export function ModuleDirectory({ role }: { role: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FeatureCategory | "All modules">("All modules");
  const moduleItems = getRoleFeatures(role).filter((feature) => feature.id !== "overview");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredModules = moduleItems.filter((item) =>
    (category === "All modules" || item.category === category)
    && `${item.label} ${item.summary} ${item.category}`.toLowerCase().includes(normalizedQuery),
  );

  return (
    <>
      <div className="module-page-heading">
        <div>
          <div className="eyebrow"><span className="live-dot" /> SCHOOL OPERATIONS</div>
          <h1>Module directory</h1>
          <p className="welcome-subtitle">Explore the school tools and connected services in this workspace.</p>
        </div>
        <span className="directory-count">{moduleItems.length} available features</span>
      </div>

      <section className="directory-toolbar" aria-label="Module filters">
        <div className="directory-categories" role="tablist" aria-label="Filter modules by category">
          {categoryOptions.map((item) => (
            <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? "directory-category active" : "directory-category"} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
        <label className="directory-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search modules" aria-label="Search modules" /></label>
      </section>

      <section className="directory-grid" aria-label="School ERP modules">
        {filteredModules.map(({ id, label, summary, href, icon, state, category: itemCategory }) => {
          const Icon = featureIcons[icon as keyof typeof featureIcons] ?? Boxes;
          const stateLabel = state === "Preview" ? "Preview data" : state === "Connected" ? "Connected" : "Setup required";
          const content = <>
            <span className="directory-icon"><Icon size={19} strokeWidth={1.8} /></span>
            <span className="directory-card-copy"><small>{itemCategory}</small><strong>{label}</strong><span>{summary}</span></span>
            <span className={`directory-state ${state === "Connected" ? "state-connected" : state === "Preview" ? "state-preview" : "state-pending"}`}>{stateLabel}</span>
          </>;

          return <Link className="directory-item" href={href} id={id} key={id}>{content}<span className="directory-open" aria-hidden="true">↗</span></Link>;
        })}
        {!filteredModules.length && <p className="directory-empty">No modules match that search.</p>}
      </section>
      <p className="directory-disclaimer">Preview screens use sample data. Connected services require provider accounts, device access, or school-specific configuration before they can process live records.</p>
    </>
  );
}
'use client';

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileBarChart2,
  Filter,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";

type ModuleKey = "students" | "staff" | "academics" | "attendance" | "finance" | "reports" | "settings";
type ModuleRow = { id: string; cells: string[]; status: string; tone: "good" | "pending" | "muted" | "warning" };
type ModuleData = {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  stats: { label: string; value: string; delta: string; icon: "people" | "school" | "calendar" | "finance"; tone: string }[];
  tabs: string[];
  columns: string[];
  rows: ModuleRow[];
  note: string;
};

const modules: Record<ModuleKey, ModuleData> = {
  students: {
    eyebrow: "STUDENT INFORMATION SYSTEM",
    title: "Students",
    description: "Manage enrolment, student records, and campus placement across your school group.",
    action: "Add student",
    stats: [
      { label: "Enrolled students", value: "2,418", delta: "+8.4% this term", icon: "people", tone: "tone-coral" },
      { label: "New applications", value: "126", delta: "32 awaiting review", icon: "school", tone: "tone-blue" },
      { label: "Active campuses", value: "4", delta: "Across 3 districts", icon: "calendar", tone: "tone-green" },
      { label: "Records complete", value: "96.2%", delta: "+2.1% this month", icon: "finance", tone: "tone-yellow" },
    ],
    tabs: ["All students", "Enrolled", "Applicants", "Alumni"],
    columns: ["STUDENT", "STUDENT ID", "GRADE & SECTION", "CAMPUS", "ENROLLED", "STATUS"],
    rows: [
      { id: "STU-24018", cells: ["Aarav Sharma", "STU-24018", "Grade 8 · A", "Northwood Academy", "Sep 04, 2024", "Enrolled"], status: "Enrolled", tone: "good" },
      { id: "STU-24017", cells: ["Mia Patel", "STU-24017", "Grade 6 · B", "Riverside School", "Sep 03, 2024", "Enrolled"], status: "Enrolled", tone: "good" },
      { id: "STU-24016", cells: ["Noah Williams", "STU-24016", "Grade 10 · C", "Northwood Academy", "Sep 02, 2024", "Review"], status: "Review", tone: "pending" },
      { id: "STU-24015", cells: ["Sofia Chen", "STU-24015", "Grade 4 · A", "Oakridge Campus", "Aug 30, 2024", "Enrolled"], status: "Enrolled", tone: "good" },
      { id: "STU-24014", cells: ["Ethan Brooks", "STU-24014", "Grade 7 · B", "Meadowfield Prep", "Aug 29, 2024", "Documents due"], status: "Documents due", tone: "warning" },
      { id: "STU-24013", cells: ["Amara Okafor", "STU-24013", "Grade 9 · A", "Riverside School", "Aug 28, 2024", "Enrolled"], status: "Enrolled", tone: "good" },
    ],
    note: "Student records shown are sample workspace data. Connect admissions and student registration to persist changes.",
  },
  staff: {
    eyebrow: "PEOPLE & ORGANISATION",
    title: "Staff & teachers",
    description: "Keep your people directory, campus assignments, and staff availability in one place.",
    action: "Add staff member",
    stats: [
      { label: "Total staff", value: "486", delta: "+12 this term", icon: "people", tone: "tone-blue" },
      { label: "Teaching faculty", value: "312", delta: "64% of workforce", icon: "school", tone: "tone-coral" },
      { label: "On leave today", value: "18", delta: "Across 4 campuses", icon: "calendar", tone: "tone-yellow" },
      { label: "Open positions", value: "9", delta: "3 roles shortlisted", icon: "finance", tone: "tone-green" },
    ],
    tabs: ["All staff", "Teaching", "Administration", "On leave"],
    columns: ["STAFF MEMBER", "EMPLOYEE ID", "ROLE", "CAMPUS", "WORK EMAIL", "STATUS"],
    rows: [
      { id: "EMP-0102", cells: ["Olivia Bennett", "EMP-0102", "Head of Science", "Northwood Academy", "o.bennett@northwood.edu", "Active"], status: "Active", tone: "good" },
      { id: "EMP-0098", cells: ["Daniel Kim", "EMP-0098", "Mathematics teacher", "Riverside School", "d.kim@riverside.edu", "Active"], status: "Active", tone: "good" },
      { id: "EMP-0091", cells: ["Priya Nair", "EMP-0091", "Admissions officer", "Oakridge Campus", "p.nair@oakridge.edu", "On leave"], status: "On leave", tone: "pending" },
      { id: "EMP-0087", cells: ["Marcus Reed", "EMP-0087", "School counsellor", "Meadowfield Prep", "m.reed@meadowfield.edu", "Active"], status: "Active", tone: "good" },
      { id: "EMP-0082", cells: ["Grace Liu", "EMP-0082", "Primary teacher", "Oakridge Campus", "g.liu@oakridge.edu", "Review"], status: "Review", tone: "warning" },
    ],
    note: "Staff directory shown is sample workspace data. HR records are not yet connected to a staff database table.",
  },
  academics: {
    eyebrow: "CURRICULUM & LEARNING",
    title: "Academics",
    description: "Coordinate terms, programmes, classes, and curriculum delivery across campuses.",
    action: "Create class",
    stats: [
      { label: "Active classes", value: "184", delta: "Across 12 grade levels", icon: "school", tone: "tone-coral" },
      { label: "Subjects", value: "28", delta: "6 curriculum areas", icon: "people", tone: "tone-blue" },
      { label: "Term progress", value: "62%", delta: "Term 1 · Week 8 of 13", icon: "calendar", tone: "tone-green" },
      { label: "Assessments due", value: "14", delta: "Next 7 days", icon: "finance", tone: "tone-yellow" },
    ],
    tabs: ["Class schedule", "Curriculum", "Assessments", "Term calendar"],
    columns: ["CLASS", "SUBJECT", "TEACHER", "CAMPUS", "NEXT SESSION", "STATUS"],
    rows: [
      { id: "CLS-8A-MATH", cells: ["Grade 8 · A", "Mathematics", "Daniel Kim", "Riverside School", "Today, 09:00", "On track"], status: "On track", tone: "good" },
      { id: "CLS-10C-SCI", cells: ["Grade 10 · C", "Science", "Olivia Bennett", "Northwood Academy", "Today, 10:30", "On track"], status: "On track", tone: "good" },
      { id: "CLS-6B-ENG", cells: ["Grade 6 · B", "English", "Priya Shah", "Meadowfield Prep", "Today, 11:15", "Lesson due"], status: "Lesson due", tone: "pending" },
      { id: "CLS-4A-ART", cells: ["Grade 4 · A", "Visual arts", "Grace Liu", "Oakridge Campus", "Today, 13:00", "Room update"], status: "Room update", tone: "warning" },
      { id: "CLS-9A-HIST", cells: ["Grade 9 · A", "World history", "Marcus Reed", "Riverside School", "Today, 14:00", "On track"], status: "On track", tone: "good" },
    ],
    note: "Academic schedule shown is sample workspace data. Curriculum and grading configuration can be connected by campus and term.",
  },
  attendance: {
    eyebrow: "DAILY OPERATIONS",
    title: "Attendance",
    description: "Review attendance by campus, follow up on absences, and monitor daily participation.",
    action: "Take attendance",
    stats: [
      { label: "Present today", value: "2,287", delta: "94.6% of enrolment", icon: "people", tone: "tone-green" },
      { label: "Absent", value: "98", delta: "31 not yet confirmed", icon: "calendar", tone: "tone-coral" },
      { label: "Late arrivals", value: "33", delta: "12 arrived this hour", icon: "school", tone: "tone-yellow" },
      { label: "Campuses reporting", value: "4 / 4", delta: "All submitted", icon: "finance", tone: "tone-blue" },
    ],
    tabs: ["Today", "Needs follow-up", "By campus", "History"],
    columns: ["STUDENT", "STUDENT ID", "CAMPUS", "CLASS", "CHECK-IN", "ATTENDANCE"],
    rows: [
      { id: "ATD-24018", cells: ["Aarav Sharma", "STU-24018", "Northwood Academy", "Grade 8 · A", "08:12 AM", "Present"], status: "Present", tone: "good" },
      { id: "ATD-24017", cells: ["Mia Patel", "STU-24017", "Riverside School", "Grade 6 · B", "08:18 AM", "Present"], status: "Present", tone: "good" },
      { id: "ATD-24016", cells: ["Noah Williams", "STU-24016", "Northwood Academy", "Grade 10 · C", "—", "Unconfirmed"], status: "Unconfirmed", tone: "warning" },
      { id: "ATD-24015", cells: ["Sofia Chen", "STU-24015", "Oakridge Campus", "Grade 4 · A", "08:31 AM", "Present"], status: "Present", tone: "good" },
      { id: "ATD-24014", cells: ["Ethan Brooks", "STU-24014", "Meadowfield Prep", "Grade 7 · B", "—", "Family notified"], status: "Family notified", tone: "pending" },
    ],
    note: "Attendance figures shown are sample workspace data. Daily marks and notifications are not yet persisted from this screen.",
  },
  finance: {
    eyebrow: "SCHOOL FINANCE OPERATIONS",
    title: "Finance",
    description: "Track fee collection, payment follow-ups, and financial activity across campuses.",
    action: "Record payment",
    stats: [
      { label: "Collected this month", value: "₹28.45L", delta: "+8.2% vs last month", icon: "finance", tone: "tone-green" },
      { label: "Outstanding fees", value: "₹4.82L", delta: "Across 173 accounts", icon: "people", tone: "tone-yellow" },
      { label: "Payments received", value: "1,284", delta: "This billing period", icon: "calendar", tone: "tone-blue" },
      { label: "Needs follow-up", value: "42", delta: "Due in the next 7 days", icon: "school", tone: "tone-coral" },
    ],
    tabs: ["All transactions", "Collected", "Outstanding", "Refunds"],
    columns: ["TRANSACTION", "REFERENCE", "STUDENT / PAYER", "CAMPUS", "DATE", "STATUS"],
    rows: [
      { id: "PAY-10842", cells: ["Term 1 tuition", "PAY-10842", "Aarav Sharma", "Northwood Academy", "Oct 14, 2024", "Collected"], status: "Collected", tone: "good" },
      { id: "PAY-10841", cells: ["Transport fee", "PAY-10841", "Mia Patel", "Riverside School", "Oct 14, 2024", "Collected"], status: "Collected", tone: "good" },
      { id: "INV-00428", cells: ["Term 1 tuition", "INV-00428", "Noah Williams", "Northwood Academy", "Due Oct 18", "Outstanding"], status: "Outstanding", tone: "warning" },
      { id: "PAY-10839", cells: ["Activity fee", "PAY-10839", "Sofia Chen", "Oakridge Campus", "Oct 13, 2024", "Collected"], status: "Collected", tone: "good" },
      { id: "INV-00421", cells: ["Transport fee", "INV-00421", "Ethan Brooks", "Meadowfield Prep", "Due Oct 16", "Reminder sent"], status: "Reminder sent", tone: "pending" },
    ],
    note: "Finance activity shown is sample workspace data. Online subscription billing is managed separately under Billing & plan.",
  },
  reports: {
    eyebrow: "INSIGHTS & EXPORTS",
    title: "Reports",
    description: "Turn school-group activity into clear, shareable insight for your teams.",
    action: "Create report",
    stats: [
      { label: "Saved reports", value: "12", delta: "4 shared with your team", icon: "finance", tone: "tone-blue" },
      { label: "Scheduled exports", value: "3", delta: "Next export Friday", icon: "calendar", tone: "tone-green" },
      { label: "Data coverage", value: "96.2%", delta: "+2.1% this month", icon: "people", tone: "tone-coral" },
      { label: "Campuses included", value: "4", delta: "All reporting", icon: "school", tone: "tone-yellow" },
    ],
    tabs: ["All reports", "My reports", "Shared", "Scheduled"],
    columns: ["REPORT", "CATEGORY", "SCOPE", "LAST RUN", "OWNER", "STATUS"],
    rows: [
      { id: "RPT-001", cells: ["Weekly attendance summary", "Attendance", "All campuses", "Today, 08:05", "Jordan Miller", "Ready"], status: "Ready", tone: "good" },
      { id: "RPT-002", cells: ["Enrolment by grade", "Students", "All campuses", "Yesterday", "Jordan Miller", "Ready"], status: "Ready", tone: "good" },
      { id: "RPT-003", cells: ["Fee collection overview", "Finance", "North district", "Oct 11, 2024", "Finance team", "Scheduled"], status: "Scheduled", tone: "pending" },
      { id: "RPT-004", cells: ["Staff capacity review", "People", "All campuses", "Oct 10, 2024", "HR team", "Draft"], status: "Draft", tone: "muted" },
    ],
    note: "Reports are curated workspace previews. Export actions are not connected to a reporting service yet.",
  },
  settings: {
    eyebrow: "SCHOOL GROUP ADMINISTRATION",
    title: "Settings",
    description: "Manage your organisation profile, access policies, and campus preferences.",
    action: "Save changes",
    stats: [
      { label: "School group", value: "Kartik Education", delta: "Group workspace", icon: "school", tone: "tone-coral" },
      { label: "Campuses", value: "4", delta: "All active", icon: "calendar", tone: "tone-blue" },
      { label: "Users & roles", value: "32", delta: "5 administrators", icon: "people", tone: "tone-green" },
      { label: "Plan", value: "Starter", delta: "View billing details", icon: "finance", tone: "tone-yellow" },
    ],
    tabs: ["Organisation", "Campuses", "Users & roles", "Preferences"],
    columns: ["SETTING", "CURRENT VALUE", "LAST UPDATED", "OWNER", "STATUS"],
    rows: [
      { id: "SET-001", cells: ["Organisation profile", "Kartik Education Group", "Oct 14, 2024", "Group owner", "Configured"], status: "Configured", tone: "good" },
      { id: "SET-002", cells: ["Academic year", "2026–27", "Oct 24, 2026", "Group owner", "Active"], status: "Active", tone: "good" },
      { id: "SET-003", cells: ["Default timezone", "Asia/Kolkata", "Aug 18, 2024", "Group owner", "Configured"], status: "Configured", tone: "good" },
      { id: "SET-004", cells: ["Multi-factor authentication", "Optional", "Not configured", "Group owner", "Recommended"], status: "Recommended", tone: "warning" },
    ],
    note: "Settings are currently presented as an administrative workspace. Persisted profile and access-policy editing is not connected yet.",
  },
};

const statIcons = { people: UsersRound, school: GraduationCap, calendar: CalendarDays, finance: CircleDollarSign };

export function ModuleWorkspace({ module }: { module: ModuleKey }) {
  const data = modules[module];
  const [activeTab, setActiveTab] = useState(data.tabs[0]);
  const [query, setQuery] = useState("");
  const [actionNotice, setActionNotice] = useState(false);
  const filteredRows = useMemo(() => data.rows.filter((row) => row.cells.join(" ").toLowerCase().includes(query.toLowerCase())), [data.rows, query]);

  return (
    <>
      <div className="module-page-heading">
        <div>
          <div className="eyebrow"><span className="live-dot" /> {data.eyebrow}</div>
          <h1>{data.title}</h1>
          <p className="welcome-subtitle">{data.description}</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setActionNotice(true)}><Plus size={16} /> {data.action}</button>
      </div>
      {actionNotice && <p className="module-action-notice" role="status">This {data.title.toLowerCase()} screen is a preview. No record was saved because its data form is not connected yet.</p>}

      <section className="metric-grid module-metrics" aria-label={`${data.title} summary`}>
        {data.stats.map((stat) => {
          const Icon = statIcons[stat.icon];
          return <article className="metric-card module-stat" key={stat.label}>
            <div className="metric-top"><span className={`metric-icon ${stat.tone}`}><Icon size={18} strokeWidth={1.8} /></span><MoreHorizontal size={18} className="module-stat-more" /></div>
            <p className="metric-label">{stat.label}</p><div className="metric-bottom"><strong>{stat.value}</strong></div><span className="metric-caption">{stat.delta}</span>
          </article>;
        })}
      </section>

      {module === "academics" && <section className="academic-spotlight panel"><div className="spotlight-symbol"><BookOpenCheck size={20} /></div><div><span className="spotlight-kicker">CURRENT TERM</span><h2>Term 1 · 2026–27</h2><p>Week 8 of 13 <span className="spotlight-separator">·</span> 62% complete</p></div><div className="spotlight-progress"><span style={{ width: "62%" }} /></div><button type="button" aria-label="Term options" className="icon-button"><MoreHorizontal size={19} /></button></section>}
      {module === "reports" && <section className="report-shortcuts" aria-label="Report shortcuts"><a href="#attendance-report"><span className="shortcut-icon shortcut-coral"><CalendarDays size={18} /></span><span><strong>Attendance</strong><small>Daily, weekly, campus</small></span><ArrowUpRight size={16} /></a><a href="#enrolment-report"><span className="shortcut-icon shortcut-blue"><GraduationCap size={18} /></span><span><strong>Enrolment</strong><small>Admissions and student totals</small></span><ArrowUpRight size={16} /></a><a href="#finance-report"><span className="shortcut-icon shortcut-green"><CircleDollarSign size={18} /></span><span><strong>Finance</strong><small>Collections and balances</small></span><ArrowUpRight size={16} /></a></section>}
      {module === "settings" && <section className="settings-groups"><article className="settings-group"><span className="settings-group-icon"><GraduationCap size={17} /></span><div><strong>Organisation</strong><p>Group profile, academic year, language, and timezone.</p></div><span className="settings-group-state">4 items <ArrowUpRight size={14} /></span></article><article className="settings-group"><span className="settings-group-icon settings-icon-blue"><UsersRound size={17} /></span><div><strong>People &amp; access</strong><p>Team members, permission roles, and sign-in security.</p></div><span className="settings-group-state">32 members <ArrowUpRight size={14} /></span></article><article className="settings-group"><span className="settings-group-icon settings-icon-gold"><CreditCard size={17} /></span><div><strong>Subscription &amp; billing</strong><p>Plan, payment method, and payment history.</p></div><a className="settings-group-state" href="/billing">Manage billing <ArrowUpRight size={14} /></a></article></section>}

      <section className="panel module-table-panel">
        <div className="panel-heading module-panel-heading">
          <div><h2>{module === "attendance" ? "Daily attendance register" : module === "academics" ? "Today’s class schedule" : module === "reports" ? "Recent reports" : module === "settings" ? "Configuration overview" : module === "staff" ? "People directory" : "Student directory"}</h2><p>Updated across the school group</p></div>
          <button className="filter-button" type="button" onClick={() => setQuery("")}><SlidersHorizontal size={15} /> Reset filters</button>
        </div>
        <div className="module-table-toolbar">
          <div className="module-tabs" role="tablist" aria-label={`${data.title} views`}>
            {data.tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "module-tab active" : "module-tab"} onClick={() => setActiveTab(tab)}>{tab}</button>)}
          </div>
          <label className="module-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${data.title.toLowerCase()}...`} aria-label={`Search ${data.title}`} /><button type="button" aria-label="Filter list"><Filter size={14} /></button></label>
        </div>
        <div className="student-table-wrap module-table-wrap"><table className="student-table module-table"><thead><tr>{data.columns.map((column) => <th key={column}>{column}</th>)}<th /></tr></thead><tbody>
          {filteredRows.map((row) => <tr key={row.id}>{row.cells.map((cell, index) => <td key={`${row.id}-${index}`} className={index === 1 ? "student-id" : ""}>{index === 0 ? <div className="module-primary-cell"><span className={`module-row-avatar module-avatar-${row.tone}`}>{cell.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><strong>{cell}</strong></div> : cell}{index === row.cells.length - 1 && <span className={`status-badge status-${row.tone}`}><i />{row.status}</span>}</td>)}<td><button className="icon-button subtle row-menu" type="button" aria-label={`More options for ${row.id}`}><MoreHorizontal size={18} /></button></td></tr>)}
          {!filteredRows.length && <tr><td className="module-no-results" colSpan={data.columns.length + 1}>No matching records. Try another search.</td></tr>}
        </tbody></table></div>
        <div className="table-footer module-table-footer"><span>Showing <strong>{filteredRows.length}</strong> of <strong>{data.rows.length}</strong> records <span className="module-note">· {activeTab}</span></span><div><button type="button" disabled aria-label="Previous page">‹</button><button type="button" className="page-current">1</button><button type="button" aria-label="Next page">›</button></div></div>
      </section>
      <div className="module-data-note"><Clock3 size={13} /> {data.note}</div>
      <footer className="dashboard-footer"><span>© 2026 Kartik Education</span><span><FileBarChart2 size={13} /> {data.title} workspace</span></footer>
    </>
  );
}

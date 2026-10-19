import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  CreditCard,
  Ellipsis,
  GraduationCap,
  Search,
  Settings2,
  UsersRound,
} from "lucide-react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ErpSidebar } from "@/components/erp-sidebar";

const students = [
  { name: "Aarav Sharma", initials: "AS", color: "coral", id: "STU-24018", grade: "Grade 8 · A", school: "Northwood Academy", status: "Active" },
  { name: "Mia Patel", initials: "MP", color: "mint", id: "STU-24017", grade: "Grade 6 · B", school: "Riverside School", status: "Active" },
  { name: "Noah Williams", initials: "NW", color: "blue", id: "STU-24016", grade: "Grade 10 · C", school: "Northwood Academy", status: "Pending" },
  { name: "Sofia Chen", initials: "SC", color: "lavender", id: "STU-24015", grade: "Grade 4 · A", school: "Oakridge Campus", status: "Active" },
];

function MetricCard({ label, value, change, icon: Icon, tone, negative = false }: {
  label: string;
  value: string;
  change: string;
  icon: typeof GraduationCap;
  tone: string;
  negative?: boolean;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className={`metric-icon ${tone}`}><Icon size={18} strokeWidth={1.8} /></span>
        <button className="icon-button subtle" aria-label={`More ${label} options`}><Ellipsis size={19} /></button>
      </div>
      <p className="metric-label">{label}</p>
      <div className="metric-bottom">
        <strong>{value}</strong>
        <span className={`metric-change ${negative ? "down" : "up"}`}>
          {negative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{change}
        </span>
      </div>
      <span className="metric-caption">vs. last month</span>
    </article>
  );
}

export default function Home() {
  return <Suspense fallback={<div className="page-loading">Loading your school workspace...</div>}><Dashboard /></Suspense>;
}

async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <main className="erp-shell">
      <ErpSidebar userName={session.name} userRole={session.role} />

      <section className="workspace" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-divider">/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={17} /><input aria-label="Search" placeholder="Search anything..." /><kbd>⌘ K</kbd></label>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <span className="topbar-divider" />
            <button className="date-button"><CalendarDays size={16} /> Oct 14 – Oct 20, 2024 <ChevronDown size={14} /></button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow"><span className="live-dot" /> MONDAY, OCTOBER 14, 2024</div>
              <h1>Good morning, Jordan <span>✳</span></h1>
              <p className="welcome-subtitle">Here&apos;s what&apos;s happening across your schools today.</p>
            </div>
            <button className="primary-button"><span>+</span> Add new student</button>
          </div>

          <section className="metric-grid" aria-label="School group statistics">
            <MetricCard label="Total students" value="8,942" change="12.8%" icon={GraduationCap} tone="tone-coral" />
            <MetricCard label="Teaching staff" value="486" change="4.3%" icon={UsersRound} tone="tone-blue" />
            <MetricCard label="Attendance today" value="94.6%" change="2.1%" icon={CalendarDays} tone="tone-green" />
            <MetricCard label="Fee collection" value="$284.5k" change="8.2%" icon={CreditCard} tone="tone-yellow" negative />
          </section>

          <section className="insights-grid">
            <article className="panel attendance-panel">
              <div className="panel-heading">
                <div><h2>Attendance overview</h2><p>Daily attendance across all campuses</p></div>
                <button className="select-button">This week <ChevronDown size={14} /></button>
              </div>
              <div className="chart-summary"><strong>94.6%</strong><span className="positive-pill"><ArrowUpRight size={13} /> 2.4%</span><small>vs. previous week</small></div>
              <div className="chart" role="img" aria-label="Attendance trend this week, generally increasing">
                <div className="chart-guides"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div>
                <div className="chart-plot">
                  <div className="chart-gridlines"><i /><i /><i /><i /></div>
                  <svg viewBox="0 0 700 180" preserveAspectRatio="none" aria-hidden="true">
                    <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f28c69" stopOpacity=".22" /><stop offset="100%" stopColor="#f28c69" stopOpacity="0" /></linearGradient></defs>
                    <path className="chart-area" d="M0 135 C35 124 40 105 64 111 S105 132 128 105 S170 78 192 88 S230 120 256 91 S295 47 320 62 S360 101 384 70 S425 34 448 51 S485 83 512 47 S550 22 576 39 S617 78 640 45 S678 22 700 12 L700 180 L0 180Z" />
                    <path className="chart-line" d="M0 135 C35 124 40 105 64 111 S105 132 128 105 S170 78 192 88 S230 120 256 91 S295 47 320 62 S360 101 384 70 S425 34 448 51 S485 83 512 47 S550 22 576 39 S617 78 640 45 S678 22 700 12" />
                    <circle cx="576" cy="39" r="5" className="chart-point" />
                  </svg>
                </div>
                <div className="chart-days">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div>
              </div>
              <div className="chart-legend"><span><i className="legend-dot coral-dot" /> Present</span><span><i className="legend-dot pale-dot" /> Absent</span></div>
            </article>

            <article className="panel campuses-panel">
              <div className="panel-heading">
                <div><h2>Campus performance</h2><p>Student attendance by campus</p></div>
                <button className="icon-button subtle" aria-label="More campus options"><Ellipsis size={19} /></button>
              </div>
              <div className="campus-list">
                {[
                  { name: "Northwood Academy", area: "North district", value: 97, color: "coral" },
                  { name: "Riverside School", area: "West district", value: 94, color: "blue" },
                  { name: "Oakridge Campus", area: "East district", value: 91, color: "green" },
                  { name: "Meadowfield Prep", area: "South district", value: 88, color: "yellow" },
                ].map((campus, index) => (
                  <div className="campus-row" key={campus.name}>
                    <span className={`campus-index index-${campus.color}`}>0{index + 1}</span>
                    <div className="campus-main"><div className="campus-name-line"><strong>{campus.name}</strong><span>{campus.value}%</span></div><small>{campus.area}</small><div className="progress-track"><i className={`progress-${campus.color}`} style={{ width: `${campus.value}%` }} /></div></div>
                  </div>
                ))}
              </div>
              <a className="text-link" href="#campuses">View all campuses <ArrowUpRight size={14} /></a>
            </article>
          </section>

          <section className="panel students-panel">
            <div className="panel-heading students-heading">
              <div><h2>Recently enrolled students</h2><p>Latest additions across your school group</p></div>
              <div className="table-actions"><button className="filter-button"><Settings2 size={15} /> Filter</button><a className="text-link" href="#students">View all students <ArrowUpRight size={14} /></a></div>
            </div>
            <div className="student-table-wrap">
              <table className="student-table">
                <thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>GRADE &amp; SECTION</th><th>CAMPUS</th><th>STATUS</th><th /></tr></thead>
                <tbody>{students.map((student) => <tr key={student.id}>
                  <td><div className="student-name"><span className={`avatar avatar-${student.color}`}>{student.initials}</span><strong>{student.name}</strong></div></td>
                  <td className="student-id">{student.id}</td><td>{student.grade}</td><td>{student.school}</td>
                  <td><span className={`status-badge ${student.status === "Active" ? "status-active" : "status-pending"}`}><i />{student.status}</span></td>
                  <td><button className="icon-button subtle row-menu" aria-label={`More options for ${student.name}`}><Ellipsis size={19} /></button></td>
                </tr>)}</tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing <strong>4</strong> of <strong>8,942</strong> students</span><div><button disabled aria-label="Previous page">‹</button><button className="page-current">1</button><button>2</button><button>3</button><span>...</span><button>2,236</button><button aria-label="Next page">›</button></div></div>
          </section>

          <footer className="dashboard-footer"><span>© 2026 Kartik Education</span><span><Clock3 size={13} /> Last synced 2 minutes ago</span></footer>
        </div>
      </section>
    </main>
  );
}
